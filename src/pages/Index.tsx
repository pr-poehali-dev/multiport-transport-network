import { useState } from 'react';
import Sidebar from '@/components/dashboard/Sidebar';
import MainContent from '@/components/dashboard/MainContent';

function Index() {
  const [activeSection, setActiveSection] = useState('dashboard');
  const [referencesOpen, setReferencesOpen] = useState(false);
  const [documentsOpen, setDocumentsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleRefreshDashboard = () => {
    console.log('Обновление дашборда...');
  };

  return (
    <div className="h-screen bg-background flex overflow-hidden">
      <Sidebar
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

      <MainContent
        activeSection={activeSection}
        onMenuClick={() => setSidebarOpen(true)}
        onRefreshDashboard={handleRefreshDashboard}
      />
    </div>
  );
}

export default Index;
