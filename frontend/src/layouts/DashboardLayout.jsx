import { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

function DashboardLayout({ children, user, onLogout }) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed);

  return (
    <div className={`${darkMode ? 'dark' : ''}`}> {/* dark mode root */}
      <div className="min-h-screen flex bg-gray-50 dark:bg-gray-900 transition-colors">
        <Sidebar
          collapsed={sidebarCollapsed}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />

        <div className="flex-1 flex flex-col min-w-0">
          <Header
            toggleSidebar={toggleSidebar}
            darkMode={darkMode}
            onLogout={onLogout}
            user={user}
          />
          <main className="flex-1 p-4 sm:p-6 overflow-y-auto">{children}</main>
        </div>
      </div>
    </div>
  );
}

export default DashboardLayout;
