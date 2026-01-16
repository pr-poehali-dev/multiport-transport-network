import { useState } from 'react';
import AppSidebar from './Index/AppSidebar';
import PageRouter from './Index/PageRouter';

function Index() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [referencesOpen, setReferencesOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [showAddContractor, setShowAddContractor] = useState(false);
  const [showAddOrders, setShowAddOrders] = useState(false);

  const handleRefreshDashboard = () => {
    console.log('Обновление дашборда...');
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <AppSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        referencesOpen={referencesOpen}
        setReferencesOpen={setReferencesOpen}
        documentsOpen={documentsOpen}
        setDocumentsOpen={setDocumentsOpen}
        settingsOpen={settingsOpen}
        setSettingsOpen={setSettingsOpen}
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      <PageRouter
        activeSection={activeSection}
        showAddDriver={showAddDriver}
        showAddVehicle={showAddVehicle}
        showAddContractor={showAddContractor}
        showAddOrders={showAddOrders}
        onMenuClick={() => setSidebarOpen(true)}
        onRefreshDashboard={handleRefreshDashboard}
        setActiveSection={setActiveSection}
        setReferencesOpen={setReferencesOpen}
        setDocumentsOpen={setDocumentsOpen}
        setSettingsOpen={setSettingsOpen}
        setShowAddDriver={setShowAddDriver}
        setShowAddVehicle={setShowAddVehicle}
        setShowAddContractor={setShowAddContractor}
        setShowAddOrders={setShowAddOrders}
      />
    </div>
  );
}

export default Index;
