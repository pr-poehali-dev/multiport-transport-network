import Drivers from '@/pages/Drivers';
import Vehicles from '@/pages/Vehicles';
import Contractors from '@/pages/Contractors';
import Orders from '@/pages/Orders';
import Templates from '@/pages/Templates';
import Contracts from '@/pages/Contracts';
import Roles from '@/pages/Roles';
import Users from '@/pages/Users';
import TelegramBot from '@/pages/TelegramBot';
import DashboardContent from './DashboardContent';

interface MainContentProps {
  activeSection: string;
  onMenuClick: () => void;
  onRefreshDashboard: () => void;
}

export default function MainContent({
  activeSection,
  onMenuClick,
  onRefreshDashboard
}: MainContentProps) {
  if (activeSection === 'dashboard') {
    return <DashboardContent onMenuClick={onMenuClick} onRefresh={onRefreshDashboard} />;
  }

  if (activeSection === 'orders') {
    return <Orders onMenuClick={onMenuClick} />;
  }

  if (activeSection === 'drivers') {
    return <Drivers onMenuClick={onMenuClick} />;
  }

  if (activeSection === 'vehicles') {
    return <Vehicles onMenuClick={onMenuClick} />;
  }

  if (activeSection === 'contractors') {
    return <Contractors onMenuClick={onMenuClick} />;
  }

  if (activeSection === 'contracts') {
    return <Contracts onMenuClick={onMenuClick} />;
  }

  if (activeSection === 'templates') {
    return <Templates onMenuClick={onMenuClick} />;
  }

  if (activeSection === 'roles') {
    return <Roles onMenuClick={onMenuClick} />;
  }

  if (activeSection === 'users') {
    return <Users onMenuClick={onMenuClick} />;
  }

  if (activeSection === 'telegram') {
    return <TelegramBot onMenuClick={onMenuClick} />;
  }

  return <DashboardContent onMenuClick={onMenuClick} onRefresh={onRefreshDashboard} />;
}
