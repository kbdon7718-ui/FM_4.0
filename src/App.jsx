import { useState } from 'react';
import { LoginPage } from './components/pages/LoginPage.jsx';
import { DashboardLayout } from './components/DashboardLayout.jsx';
import { OwnerDashboard } from './components/pages/OwnerDashboard.jsx';
import { SupervisorDashboard } from './components/pages/SupervisorDashboard.jsx';
import { VehicleTracking } from './components/pages/VehicleTracking.jsx';
import { FuelReports } from './components/pages/FuelReports.jsx';
import { ComplaintsPanel } from './components/pages/ComplaintsPanel.jsx';
import { Settings } from './components/pages/Settings.jsx';
import { InsightsPage } from './components/pages/InsightsPage.jsx';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [selectedVehicleId, setSelectedVehicleId] = useState(undefined);

  const handleLogin = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentPage('dashboard');
    setSelectedVehicleId(undefined);
  };

  const handleNavigate = (page, vehicleId) => {
    setCurrentPage(page);
    setSelectedVehicleId(vehicleId);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return userRole === 'owner' ? <OwnerDashboard onNavigate={handleNavigate} selectedVehicleId={selectedVehicleId} /> : <SupervisorDashboard onNavigate={handleNavigate} selectedVehicleId={selectedVehicleId} />;
      case 'vehicles':
        return <VehicleTracking />;
      case 'fuel':
        return <FuelReports />;
      case 'complaints':
        return <ComplaintsPanel />;
      case 'settings':
        return <Settings />;
      case 'insights':
        return <InsightsPage onNavigate={handleNavigate} />;
      default:
        return userRole === 'owner' ? <OwnerDashboard onNavigate={handleNavigate} selectedVehicleId={selectedVehicleId} /> : <SupervisorDashboard onNavigate={handleNavigate} selectedVehicleId={selectedVehicleId} />;
    }
  };

  return (
    <DashboardLayout
      userRole={userRole}
      currentPage={currentPage}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderPage()}
    </DashboardLayout>
  );
}
