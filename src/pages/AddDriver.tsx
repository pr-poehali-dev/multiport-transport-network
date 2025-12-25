import { useState, useEffect, useRef } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import TopBar from '@/components/TopBar';
import { useToast } from '@/hooks/use-toast';
import { createDriver, updateDriver, Driver } from '@/api/drivers';
import { getContractors, Contractor } from '@/api/contractors';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface AddDriverProps {
  driver?: Driver;
  onBack: () => void;
  onMenuClick: () => void;
}

function AddDriver({ driver, onBack, onMenuClick }: AddDriverProps) {
  const { toast } = useToast();
  const isEditMode = !!driver;
  const [showCancelDialog, setShowCancelDialog] = useState(false);
  const [showPassport, setShowPassport] = useState(false);
  const [showLicense, setShowLicense] = useState(false);
  const [showCompany, setShowCompany] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [contractors, setContractors] = useState<Contractor[]>([]);
  const [loadingContractors, setLoadingContractors] = useState(false);
  const [searchContractor, setSearchContractor] = useState('');
  const [showContractorList, setShowContractorList] = useState(false);
  const contractorInputRef = useRef<HTMLInputElement>(null);
  
  // Основная информация
  const [lastName, setLastName] = useState(driver?.lastName || '');
  const [firstName, setFirstName] = useState(driver?.firstName || '');
  const [middleName, setMiddleName] = useState(driver?.middleName || '');
  const [phone, setPhone] = useState(driver?.phone || '');
  const [phoneExtra, setPhoneExtra] = useState(driver?.phoneExtra || '');
  
  // Паспорт
  const [passportSeries, setPassportSeries] = useState(driver?.passportSeries || '');
  const [passportNumber, setPassportNumber] = useState(driver?.passportNumber || '');
  const [passportDate, setPassportDate] = useState(driver?.passportDate || '');
  const [passportIssued, setPassportIssued] = useState(driver?.passportIssued || '');
  
  // Водительское удостоверение
  const [licenseSeries, setLicenseSeries] = useState(driver?.licenseSeries || '');
  const [licenseNumber, setLicenseNumber] = useState(driver?.licenseNumber || '');
  const [licenseDate, setLicenseDate] = useState(driver?.licenseDate || '');
  const [licenseIssued, setLicenseIssued] = useState(driver?.licenseIssued || '');
  
  // Фирма ТК
  const [companyId, setCompanyId] = useState(driver?.companyId?.toString() || '');

  // Показываем секции паспорта и прав если есть данные
  useEffect(() => {
    if (driver) {
      const hasPassport = driver.passportSeries || driver.passportNumber || driver.passportDate || driver.passportIssued;
      setShowPassport(!!hasPassport);
      
      const hasLicense = driver.licenseSeries || driver.licenseNumber || driver.licenseDate || driver.licenseIssued;
      setShowLicense(!!hasLicense);
      
      setShowCompany(!!driver.companyId);
      
      if (driver.companyId) {
        const contractor = contractors.find(c => c.id?.toString() === driver.companyId?.toString());
        if (contractor) {
          setSearchContractor(contractor.name);
        }
      }
    }
  }, [driver, contractors]);

  useEffect(() => {
    if (showCompany && contractors.length === 0) {
      loadContractorsList();
    }
  }, [showCompany]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (contractorInputRef.current && !contractorInputRef.current.parentElement?.contains(target)) {
        setShowContractorList(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadContractorsList = async () => {
    setLoadingContractors(true);
    try {
      const data = await getContractors();
      setContractors(data.contractors || []);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Не удалось загрузить список контрагентов'
      });
    } finally {
      setLoadingContractors(false);
    }
  };

  const handleCancel = () => {
    setShowCancelDialog(true);
  };

  const confirmCancel = () => {
    setShowCancelDialog(false);
    onBack();
  };

  const handleSave = async () => {
    // Валидация обязательных полей
    if (!lastName.trim() || !firstName.trim() || !phone.trim()) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: 'Заполните обязательные поля: Фамилия, Имя, Телефон'
      });
      return;
    }

    setIsSaving(true);

    try {
      const driverData = {
        lastName: lastName.trim(),
        firstName: firstName.trim(),
        middleName: middleName.trim(),
        phone: phone.trim(),
        phoneExtra: phoneExtra.trim(),
        passportSeries: passportSeries.trim(),
        passportNumber: passportNumber.trim(),
        passportDate: passportDate || undefined,
        passportIssued: passportIssued.trim(),
        licenseSeries: licenseSeries.trim(),
        licenseNumber: licenseNumber.trim(),
        licenseDate: licenseDate || undefined,
        licenseIssued: licenseIssued.trim(),
        companyId: companyId ? parseInt(companyId) : undefined
      };

      const data = isEditMode 
        ? await updateDriver(driver.id!, driverData)
        : await createDriver(driverData);

      toast({
        title: 'Успешно сохранено',
        description: data.message || (isEditMode ? 'Данные водителя обновлены' : 'Водитель добавлен в базу данных')
      });

      onBack();
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Ошибка',
        description: error instanceof Error ? error.message : 'Не удалось сохранить водителя'
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full">
      <TopBar
        title={isEditMode ? 'Редактировать водителя' : 'Добавить водителя'}
        onMenuClick={onMenuClick}
        leftButton={
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="hover:bg-gray-100"
          >
            <Icon name="ArrowLeft" size={20} />
          </Button>
        }
        rightButtons={
          <>
            <Button
              variant="outline"
              onClick={handleCancel}
              className="gap-2"
            >
              <Icon name="X" size={18} />
              <span className="hidden sm:inline">Отменить</span>
            </Button>
            <Button 
              onClick={handleSave}
              disabled={isSaving}
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
            >
              {isSaving ? (
                <>
                  <Icon name="Loader2" size={18} className="animate-spin" />
                  <span className="hidden sm:inline">Сохранение...</span>
                </>
              ) : (
                <>
                  <Icon name="Check" size={18} />
                  <span className="hidden sm:inline">Сохранить</span>
                </>
              )}
            </Button>
          </>
        }
      />

      <div className="flex-1 p-4 lg:p-6 overflow-y-auto">
        <div className="max-w-3xl mx-auto space-y-4">
          {/* Основная информация */}
          <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
            <div className="flex items-center gap-2">
              <Icon name="UserCircle" size={20} className="text-[#0ea5e9]" />
              <h2 className="text-base lg:text-lg font-semibold text-foreground">Основная информация</h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lastName">Фамилия *</Label>
                <Input 
                  id="lastName" 
                  placeholder="Иванов" 
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="firstName">Имя *</Label>
                <Input 
                  id="firstName" 
                  placeholder="Иван"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="middleName">Отчество</Label>
                <Input 
                  id="middleName" 
                  placeholder="Иванович"
                  value={middleName}
                  onChange={(e) => setMiddleName(e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Телефон 1 *</Label>
                <Input 
                  id="phone" 
                  placeholder="+7 (999) 123-45-67"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneExtra">Телефон 2</Label>
                <Input 
                  id="phoneExtra" 
                  placeholder="+7 (999) 123-45-67"
                  value={phoneExtra}
                  onChange={(e) => setPhoneExtra(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Паспорт */}
          {!showPassport ? (
            <button
              onClick={() => setShowPassport(true)}
              className="w-full bg-white rounded-lg border border-dashed border-border p-4 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Icon name="Plus" size={20} />
              <span>Добавить паспорт</span>
            </button>
          ) : (
            <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="CreditCard" size={20} className="text-[#0ea5e9]" />
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">Паспорт</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassport(false)}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="Trash2" size={18} />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="passportSeries">Серия</Label>
                  <Input 
                    id="passportSeries" 
                    placeholder="1234"
                    value={passportSeries}
                    onChange={(e) => setPassportSeries(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportNumber">Номер</Label>
                  <Input 
                    id="passportNumber" 
                    placeholder="567890"
                    value={passportNumber}
                    onChange={(e) => setPassportNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="passportDate">Дата выдачи</Label>
                  <Input 
                    id="passportDate" 
                    type="date"
                    value={passportDate}
                    onChange={(e) => setPassportDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passportIssued">Кем выдан</Label>
                <Input 
                  id="passportIssued" 
                  placeholder="ОВД Центрального района г. Москвы"
                  value={passportIssued}
                  onChange={(e) => setPassportIssued(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Водительское удостоверение */}
          {!showLicense ? (
            <button
              onClick={() => setShowLicense(true)}
              className="w-full bg-white rounded-lg border border-dashed border-border p-4 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Icon name="Plus" size={20} />
              <span>Добавить водительское удостоверение</span>
            </button>
          ) : (
            <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="IdCard" size={20} className="text-[#0ea5e9]" />
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">Водительское удостоверение</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowLicense(false)}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="Trash2" size={18} />
                </Button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="licenseSeries">Серия</Label>
                  <Input 
                    id="licenseSeries" 
                    placeholder="1234"
                    value={licenseSeries}
                    onChange={(e) => setLicenseSeries(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseNumber">Номер</Label>
                  <Input 
                    id="licenseNumber" 
                    placeholder="567890"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="licenseDate">Дата выдачи</Label>
                  <Input 
                    id="licenseDate" 
                    type="date"
                    value={licenseDate}
                    onChange={(e) => setLicenseDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="licenseIssued">Кем выдан</Label>
                <Input 
                  id="licenseIssued" 
                  placeholder="ГИБДД г. Москва"
                  value={licenseIssued}
                  onChange={(e) => setLicenseIssued(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Фирма ТК */}
          {!showCompany ? (
            <button
              onClick={() => setShowCompany(true)}
              className="w-full bg-white rounded-lg border border-dashed border-border p-4 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground"
            >
              <Icon name="Plus" size={20} />
              <span>Добавить фирму ТК</span>
            </button>
          ) : (
            <div className="bg-white rounded-lg border border-border p-4 lg:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Icon name="Building2" size={20} className="text-[#0ea5e9]" />
                  <h2 className="text-base lg:text-lg font-semibold text-foreground">Фирма ТК</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setShowCompany(false);
                    setCompanyId('');
                  }}
                  className="hover:bg-red-50 hover:text-red-600"
                >
                  <Icon name="Trash2" size={18} />
                </Button>
              </div>

              <div className="space-y-2 relative">
                <Label htmlFor="contractor">Фирма ТК</Label>
                <div className="relative" ref={contractorInputRef}>
                  <Input
                    id="contractor"
                    placeholder="Начните вводить название фирмы..."
                    value={searchContractor}
                    onChange={(e) => {
                      setSearchContractor(e.target.value);
                      setShowContractorList(true);
                    }}
                    onFocus={() => setShowContractorList(true)}
                  />
                  {loadingContractors && (
                    <Icon name="Loader2" size={16} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />
                  )}
                  
                  {showContractorList && contractors.length > 0 && (
                    <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-lg shadow-lg max-h-60 overflow-y-auto">
                      {contractors
                        .filter(c => c.name.toLowerCase().includes(searchContractor.toLowerCase()))
                        .map(contractor => (
                          <button
                            key={contractor.id}
                            type="button"
                            onClick={() => {
                              setCompanyId(contractor.id?.toString() || '');
                              setSearchContractor(contractor.name);
                              setShowContractorList(false);
                            }}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-start gap-3 border-b border-border last:border-0"
                          >
                            <Icon name="Building2" size={18} className="text-[#0ea5e9] flex-shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{contractor.name}</p>
                              {contractor.inn && (
                                <p className="text-xs text-muted-foreground">ИНН: {contractor.inn}</p>
                              )}
                            </div>
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <AlertDialog open={showCancelDialog} onOpenChange={setShowCancelDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <Icon name="AlertTriangle" size={24} className="text-orange-500" />
              Подтверждение отмены
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base pt-2">
              {isEditMode 
                ? 'Все несохранённые изменения будут потеряны. Вы уверены, что хотите выйти без сохранения?'
                : 'Данное действие приведет к потере всех введенных данных. Вы уверены, что хотите выйти без сохранения?'
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="gap-2">
              <Icon name="ArrowLeft" size={16} />
              Продолжить редактирование
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmCancel}
              className="bg-red-600 hover:bg-red-700 gap-2"
            >
              <Icon name="LogOut" size={16} />
              Выйти без сохранения
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

export default AddDriver;