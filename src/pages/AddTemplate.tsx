import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import Icon from '@/components/ui/icon';

const AddTemplate = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [file, setFile] = useState<File | null>(null);
  const [templateName, setTemplateName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (location.state) {
      const { file: stateFile, pdfUrl, fileName } = location.state as { 
        file: File; 
        pdfUrl: string; 
        fileName: string; 
      };
      
      setFile(stateFile);
      setPdfPreviewUrl(pdfUrl);
      setTemplateName(fileName);
    }
  }, [location.state]);

  const handleUpload = async () => {
    if (!file || !templateName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Заполните название и выберите файл',
        variant: 'destructive',
      });
      return;
    }

    setIsUploading(true);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const base64Content = base64.split(',')[1];

        const response = await fetch('YOUR_BACKEND_URL_HERE', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: templateName,
            type: 'pdf',
            pdf_content: base64Content,
          }),
        });

        if (!response.ok) {
          throw new Error('Ошибка загрузки шаблона');
        }

        toast({
          title: 'Успех!',
          description: `Шаблон "${templateName}" успешно загружен`,
        });

        navigate('/');
      };

      reader.readAsDataURL(file);
    } catch (error) {
      toast({
        title: 'Ошибка',
        description: 'Не удалось загрузить шаблон',
        variant: 'destructive',
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-slate-900 mb-2">Редактор PDF шаблона</h1>
            <p className="text-slate-600">Настройте название и проверьте содержимое</p>
          </div>
          <Button variant="ghost" onClick={handleCancel}>
            <Icon name="X" className="mr-2 h-4 w-4" />
            Закрыть
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Загрузка шаблона</CardTitle>
              <CardDescription>Выберите PDF файл и укажите название</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="templateName">Название шаблона</Label>
                <Input
                  id="templateName"
                  placeholder="Например: Договор перевозки"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdfFile">PDF файл</Label>
                <div className="border-2 border-dashed border-slate-300 rounded-lg p-8 text-center hover:border-slate-400 transition-colors">
                  <input
                    id="pdfFile"
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    disabled
                  />
                  <label htmlFor="pdfFile" className="cursor-pointer">
                    <Icon name="FileUp" size={48} className="mx-auto text-slate-400 mb-4" />
                    <p className="text-slate-600 mb-2">
                      {file ? file.name : 'Нажмите для выбора PDF файла'}
                    </p>
                    <p className="text-sm text-slate-400">Максимальный размер: 10 МБ</p>
                  </label>
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleUpload}
                  disabled={!file || !templateName.trim() || isUploading}
                  className="flex-1"
                  size="lg"
                >
                  {isUploading ? (
                    <>
                      <Icon name="Loader2" className="mr-2 h-4 w-4 animate-spin" />
                      Загрузка...
                    </>
                  ) : (
                    <>
                      <Icon name="Upload" className="mr-2 h-4 w-4" />
                      Сохранить
                    </>
                  )}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isUploading}
                  size="lg"
                >
                  Отмена
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Предварительный просмотр</CardTitle>
              <CardDescription>PDF документ будет отображен здесь</CardDescription>
            </CardHeader>
            <CardContent>
              {pdfPreviewUrl ? (
                <div className="border rounded-lg overflow-hidden bg-white">
                  <iframe
                    src={pdfPreviewUrl}
                    className="w-full h-[600px]"
                    title="PDF Preview"
                  />
                </div>
              ) : (
                <div className="border-2 border-dashed border-slate-200 rounded-lg p-12 text-center">
                  <Icon name="FileText" size={64} className="mx-auto text-slate-300 mb-4" />
                  <p className="text-slate-400">Выберите PDF для предпросмотра</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AddTemplate;