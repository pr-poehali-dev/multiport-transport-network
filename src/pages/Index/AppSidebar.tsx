import Icon from '@/components/ui/icon';

interface AppSidebarProps {
  activeSection: string;
  setActiveSection: (section: string) => void;
  referencesOpen: boolean;
  setReferencesOpen: (open: boolean) => void;
  documentsOpen: boolean;
  setDocumentsOpen: (open: boolean) => void;
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;
}

export default function AppSidebar({
  activeSection,
  setActiveSection,
  referencesOpen,
  setReferencesOpen,
  documentsOpen,
  setDocumentsOpen,
  settingsOpen,
  setSettingsOpen,
  sidebarOpen,
  setSidebarOpen
}: AppSidebarProps) {
  return (
    <>
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`w-64 bg-[#1a1a1a] text-white flex flex-col flex-shrink-0 fixed lg:static inset-y-0 left-0 z-50 transform transition-transform duration-300 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}>
        <div className="p-4">
          <div className="flex items-center gap-3 mb-6 bg-[#0ea5e9] rounded-lg p-3">
            <div className="bg-white/20 rounded-lg p-2">
              <Icon name="Truck" size={24} className="text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-semibold text-sm leading-tight">TransHub</h1>
              <p className="text-white/70 text-xs truncate">Управление грузоперевозка...</p>
            </div>
          </div>

          <div className="mb-6 px-2">
            <div className="flex items-center gap-2 text-white/90">
              <Icon name="User" size={18} />
              <span className="text-sm font-medium">Администратор</span>
            </div>
          </div>

          <nav className="space-y-1">
            <button
              onClick={() => {
                setActiveSection('dashboard');
                setReferencesOpen(false);
                setDocumentsOpen(false);
                setSettingsOpen(false);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeSection === 'dashboard'
                  ? 'bg-[#0ea5e9] text-white'
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon name="LayoutGrid" size={20} />
                <span className="text-sm font-medium">Дашборд</span>
              </div>
            </button>

            <div>
              <button
                onClick={() => setReferencesOpen(!referencesOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-white/80 hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <Icon name="Book" size={20} />
                  <span className="text-sm font-medium">Справочники</span>
                </div>
                <Icon name="ChevronRight" size={16} className={`text-white/60 transition-transform ${referencesOpen ? 'rotate-90' : ''}`} />
              </button>
              {referencesOpen && (
                <div className="mt-1 ml-9 space-y-1">
                  {[
                    { id: 'orders', label: 'Заказы', icon: 'Package' },
                    { id: 'drivers', label: 'Водители', icon: 'UserCircle' },
                    { id: 'vehicles', label: 'Автомобили', icon: 'Truck' },
                    { id: 'contractors', label: 'Контрагенты', icon: 'Building2' },
                  ].map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        setActiveSection(subItem.id);
                        setReferencesOpen(true);
                        setDocumentsOpen(false);
                        setSettingsOpen(false);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        activeSection === subItem.id
                          ? 'bg-[#0ea5e9] text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white/90'
                      }`}
                    >
                      <Icon name={subItem.icon as any} size={16} />
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <button
                onClick={() => setDocumentsOpen(!documentsOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-white/80 hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <Icon name="FileText" size={20} />
                  <span className="text-sm font-medium">Документы</span>
                </div>
                <Icon name="ChevronRight" size={16} className={`text-white/60 transition-transform ${documentsOpen ? 'rotate-90' : ''}`} />
              </button>
              {documentsOpen && (
                <div className="mt-1 ml-9 space-y-1">
                  {[
                    { id: 'contract', label: 'Договор-Заявка', icon: 'FileSignature' },
                    { id: 'ttn', label: 'ТТН', icon: 'ClipboardList' },
                    { id: 'upd', label: 'УПД', icon: 'Receipt' },
                  ].map((subItem) => (
                    <button
                      key={subItem.id}
                      onClick={() => {
                        setActiveSection(subItem.id);
                        setDocumentsOpen(true);
                        setReferencesOpen(false);
                        setSettingsOpen(false);
                        setSidebarOpen(false);
                      }}
                      className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-all ${
                        activeSection === subItem.id
                          ? 'bg-[#0ea5e9] text-white'
                          : 'text-white/70 hover:bg-white/5 hover:text-white/90'
                      }`}
                    >
                      <Icon name={subItem.icon as any} size={16} />
                      {subItem.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              onClick={() => {
                setActiveSection('overview');
                setReferencesOpen(false);
                setDocumentsOpen(false);
                setSettingsOpen(false);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                activeSection === 'overview'
                  ? 'bg-[#0ea5e9] text-white'
                  : 'text-white/80 hover:bg-white/5'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon name="Activity" size={20} />
                <span className="text-sm font-medium">Обзор</span>
              </div>
            </button>

            <div>
              <button
                onClick={() => setSettingsOpen(!settingsOpen)}
                className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-white/80 hover:bg-white/5"
              >
                <div className="flex items-center gap-3">
                  <Icon name="Settings" size={20} />
                  <span className="text-sm font-medium">Настройки</span>
                </div>
                <Icon name="ChevronRight" size={16} className={`text-white/60 transition-transform ${settingsOpen ? 'rotate-90' : ''}`} />
              </button>
              {settingsOpen && (
                <div className="mt-1 ml-9 space-y-1">
                  <button
                    onClick={() => {
                      setActiveSection('users');
                      setSettingsOpen(true);
                      setReferencesOpen(false);
                      setDocumentsOpen(false);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === 'users'
                        ? 'bg-[#0ea5e9] text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white/90'
                    }`}
                  >
                    <Icon name="Users" size={16} />
                    Пользователи
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('telegram');
                      setSettingsOpen(true);
                      setReferencesOpen(false);
                      setDocumentsOpen(false);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === 'telegram'
                        ? 'bg-[#0ea5e9] text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white/90'
                    }`}
                  >
                    <Icon name="Send" size={16} />
                    TG Бот
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('roles');
                      setSettingsOpen(true);
                      setReferencesOpen(false);
                      setDocumentsOpen(false);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === 'roles'
                        ? 'bg-[#0ea5e9] text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white/90'
                    }`}
                  >
                    <Icon name="Shield" size={16} />
                    Роли
                  </button>
                  <button
                    onClick={() => {
                      setActiveSection('templates');
                      setSettingsOpen(true);
                      setReferencesOpen(false);
                      setDocumentsOpen(false);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-2 text-left px-3 py-2 rounded-lg text-sm transition-all ${
                      activeSection === 'templates'
                        ? 'bg-[#0ea5e9] text-white'
                        : 'text-white/70 hover:bg-white/5 hover:text-white/90'
                    }`}
                  >
                    <Icon name="Layers" size={16} />
                    Шаблоны
                  </button>
                </div>
              )}
            </div>
          </nav>
        </div>
      </aside>
    </>
  );
}
