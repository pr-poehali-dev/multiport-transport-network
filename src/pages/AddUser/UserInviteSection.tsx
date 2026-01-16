import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import Icon from '@/components/ui/icon';

interface UserInviteSectionProps {
  showInviteSection: boolean;
  setShowInviteSection: (show: boolean) => void;
  existingInvite: any;
  setExistingInvite: (invite: any) => void;
  loadingInvite: boolean;
  regeneratingInvite: boolean;
  isSaving: boolean;
  userId: number | null;
  onSaveAndShowInvite: () => Promise<void>;
  onCreateInvite: () => Promise<void>;
  onRegenerateInvite: () => Promise<void>;
  onCopyInvite: (link: string) => void;
}

export default function UserInviteSection({
  showInviteSection,
  setShowInviteSection,
  existingInvite,
  setExistingInvite,
  loadingInvite,
  regeneratingInvite,
  isSaving,
  userId,
  onSaveAndShowInvite,
  onCreateInvite,
  onRegenerateInvite,
  onCopyInvite
}: UserInviteSectionProps) {
  if (!showInviteSection) {
    return (
      <button
        onClick={onSaveAndShowInvite}
        disabled={isSaving}
        className="w-full bg-white rounded-lg border border-dashed border-border p-4 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isSaving ? (
          <>
            <Icon name="Loader2" size={20} className="animate-spin" />
            <span>Сохранение...</span>
          </>
        ) : (
          <>
            <Icon name="Plus" size={20} />
            <span>Добавить инвайт-ссылку</span>
          </>
        )}
      </button>
    );
  }

  return (
    <div className="bg-white rounded-lg border border-[#0ea5e9] p-4 lg:p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Icon name="Link" size={20} className="text-[#0ea5e9]" />
          <h2 className="text-base lg:text-lg font-semibold text-foreground">Инвайт-ссылка для Telegram</h2>
        </div>
        <div className="flex items-center gap-2">
          {loadingInvite ? (
            <Badge variant="outline">
              <Icon name="Loader2" size={12} className="mr-1 animate-spin" />
              Загрузка...
            </Badge>
          ) : existingInvite?.is_used ? (
            <Badge variant="outline" className="text-orange-600 border-orange-600">
              <Icon name="CheckCircle2" size={12} className="mr-1" />
              Использована
            </Badge>
          ) : existingInvite ? (
            <Badge variant="default" className="bg-green-500">
              <Icon name="Clock" size={12} className="mr-1" />
              Активна
            </Badge>
          ) : null}
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setShowInviteSection(false);
              setExistingInvite(null);
            }}
            className="hover:bg-red-50 hover:text-red-600"
          >
            <Icon name="Trash2" size={18} />
          </Button>
        </div>
      </div>
      <p className="text-sm text-muted-foreground">
        Отправьте эту ссылку пользователю для подключения к боту
      </p>
      {existingInvite ? (
        <>
          <div className="flex gap-2">
            <Input 
              value={existingInvite.invite_link} 
              readOnly 
              className="font-mono text-sm"
            />
            <Button 
              onClick={() => onCopyInvite(existingInvite.invite_link)}
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 gap-2"
            >
              <Icon name="Copy" size={18} />
              Скопировать
            </Button>
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Icon name="Info" size={14} />
            <span>Использований: {existingInvite.current_uses}/{existingInvite.max_uses}</span>
          </div>
          {existingInvite.is_used && (
            <Button 
              onClick={onRegenerateInvite}
              disabled={regeneratingInvite}
              variant="outline"
              className="w-full gap-2"
            >
              {regeneratingInvite ? (
                <>
                  <Icon name="Loader2" size={16} className="animate-spin" />
                  Генерация...
                </>
              ) : (
                <>
                  <Icon name="RefreshCw" size={16} />
                  Сгенерировать новую ссылку
                </>
              )}
            </Button>
          )}
        </>
      ) : (
        <div className="text-center py-4">
          <p className="text-sm text-muted-foreground mb-3">Инвайт-ссылка ещё не создана</p>
          <Button 
            onClick={onCreateInvite}
            disabled={regeneratingInvite || !userId}
            className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 gap-2"
          >
            {regeneratingInvite ? (
              <>
                <Icon name="Loader2" size={16} className="animate-spin" />
                Генерация...
              </>
            ) : (
              <>
                <Icon name="Plus" size={16} />
                Создать инвайт-ссылку
              </>
            )}
          </Button>
          {!userId && (
            <p className="text-xs text-muted-foreground mt-2">Сначала сохраните пользователя</p>
          )}
        </div>
      )}
    </div>
  );
}
