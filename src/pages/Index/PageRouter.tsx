import Drivers from '../Drivers';
import Vehicles from '../Vehicles';
import Contractors from '../Contractors';
import Orders from '../Orders';
import Templates from '../Templates';
import Contracts from '../Contracts';
import AddDriver from '../AddDriver';
import AddVehicle from '../AddVehicle';
import AddContractor from '../AddContractor';
import AddOrders from '../AddOrders';
import Roles from '../Roles';
import Users from '../Users';
import TelegramBot from '../TelegramBot';
import DashboardView from './DashboardView';

interface PageRouterProps {
  activeSection: string;
  showAddDriver: boolean;
  showAddVehicle: boolean;
  showAddContractor: boolean;
  showAddOrders: boolean;
  onMenuClick: () => void;
  onRefreshDashboard: () => void;
  setActiveSection: (section: string) => void;
  setReferencesOpen: (open: boolean) => void;
  setDocumentsOpen: (open: boolean) => void;
  setSettingsOpen: (open: boolean) => void;
  setShowAddDriver: (show: boolean) => void;
  setShowAddVehicle: (show: boolean) => void;
  setShowAddContractor: (show: boolean) => void;
  setShowAddOrders: (show: boolean) => void;
}

export default function PageRouter({
  activeSection,
  showAddDriver,
  showAddVehicle,
  showAddContractor,
  showAddOrders,
  onMenuClick,
  onRefreshDashboard,
  setActiveSection,
  setReferencesOpen,
  setDocumentsOpen,
  setSettingsOpen,
  setShowAddDriver,
  setShowAddVehicle,
  setShowAddContractor,
  setShowAddOrders
}: PageRouterProps) {
  const handleBackFromAddDriver = () => {
    setShowAddDriver(false);
    setActiveSection('drivers');
    setReferencesOpen(true);
  };

  const handleBackFromAddVehicle = () => {
    setShowAddVehicle(false);
    setActiveSection('vehicles');
    setReferencesOpen(true);
  };

  const handleBackFromAddContractor = () => {
    setShowAddContractor(false);
    setActiveSection('contractors');
    setReferencesOpen(true);
  };

  const handleBackFromAddOrders = () => {
    setShowAddOrders(false);
    setActiveSection('orders');
    setReferencesOpen(true);
  };

  if (showAddDriver) {
    return <AddDriver onBack={handleBackFromAddDriver} onMenuClick={onMenuClick} />;
  }

  if (showAddVehicle) {
    return <AddVehicle onBack={handleBackFromAddVehicle} onMenuClick={onMenuClick} />;
  }

  if (showAddContractor) {
    return <AddContractor onBack={handleBackFromAddContractor} onMenuClick={onMenuClick} />;
  }

  if (showAddOrders) {
    return <AddOrders onBack={handleBackFromAddOrders} onMenuClick={onMenuClick} />;
  }

  switch (activeSection) {
    case 'orders':
      return <Orders onMenuClick={onMenuClick} />;
    case 'drivers':
      return <Drivers onMenuClick={onMenuClick} />;
    case 'vehicles':
      return <Vehicles onMenuClick={onMenuClick} />;
    case 'contractors':
      return <Contractors onMenuClick={onMenuClick} />;
    case 'contract':
      return <Contracts onMenuClick={onMenuClick} />;
    case 'templates':
      return <Templates onMenuClick={onMenuClick} />;
    case 'users':
      return <Users onMenuClick={onMenuClick} />;
    case 'telegram':
      return <TelegramBot onMenuClick={onMenuClick} />;
    case 'roles':
      return <Roles onMenuClick={onMenuClick} />;
    default:
      return (
        <DashboardView
          onMenuClick={onMenuClick}
          onRefresh={onRefreshDashboard}
          setActiveSection={setActiveSection}
          setReferencesOpen={setReferencesOpen}
          setDocumentsOpen={setDocumentsOpen}
          setSettingsOpen={setSettingsOpen}
          setShowAddOrders={setShowAddOrders}
          setShowAddDriver={setShowAddDriver}
          setShowAddVehicle={setShowAddVehicle}
          setShowAddContractor={setShowAddContractor}
        />
      );
  }
}
