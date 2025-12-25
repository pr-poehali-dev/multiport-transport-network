import { ReactNode } from 'react';
import Icon from '@/components/ui/icon';
import { Button } from '@/components/ui/button';
import ErrorLogsViewer from '@/components/ErrorLogsViewer';

interface TopBarProps {
  title: string;
  onMenuClick?: () => void;
  onRefresh?: () => void;
  leftButton?: ReactNode;
  rightButtons?: ReactNode;
}

function TopBar({ title, onMenuClick, onRefresh, leftButton, rightButtons }: TopBarProps) {
  return (
    <header className="bg-white border-b border-border px-4 lg:px-6 py-4 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 lg:gap-3">
          {onMenuClick && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onMenuClick}
              className="lg:hidden"
            >
              <Icon name="Menu" size={24} />
            </Button>
          )}
          {leftButton}
          <h1 className="text-base lg:text-xl font-semibold text-foreground">{title}</h1>
        </div>
        <div className="flex items-center gap-2 lg:gap-3">
          <ErrorLogsViewer />
          {onRefresh && (
            <Button 
              onClick={onRefresh}
              className="bg-[#0ea5e9] hover:bg-[#0ea5e9]/90 text-white gap-2"
            >
              <Icon name="RefreshCw" size={18} />
              <span className="hidden sm:inline">Обновить</span>
            </Button>
          )}
          {rightButtons}
        </div>
      </div>
    </header>
  );
}

export default TopBar;