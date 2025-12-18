import { useState } from 'react';
import { LoginPage } from './components/pages/LoginPage.jsx';

/* =========================
   OWNER
========================= */
import { OwnerLayout } from './owner/OwnerLayout.jsx';
import OwnerDashboard from './owner/OwnerDashboard.jsx';
import { FuelAnalysis } from './owner/FuelAnalysis.jsx';
import { SLAReports } from './owner/SLAReports.jsx';
import { RiskInsights } from './owner/RiskInsights.jsx';
import { Penalties } from './owner/Penalties.jsx';
import { FuelReports } from './owner/FuelReports.jsx';
import { InsightsPage } from './owner/InsightsPage.jsx';
import { Settings } from './owner/Settings.jsx';

/* =========================
   SUPERVISOR
========================= */
import { SupervisorLayout } from './supervisor/SupervisorLayout.jsx';

/* =========================
   FLEET
========================= */
import FleetDashboard from './Fleet/FleetDashboard.jsx';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [user, setUser] = useState(null);
  const [currentPage, setCurrentPage] = useState(null);

  const handleLogin = (role, userData = null) => {
    setUserRole(role);
    setUser(userData);
    setIsLoggedIn(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setUser(null);
    setCurrentPage(null);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  /* =========================
     OWNER PORTAL (UNCHANGED)
  ========================= */
  if (userRole === 'OWNER') {
    let page = <OwnerDashboard />;

    switch (currentPage) {
      case 'dashboard':
        page = <OwnerDashboard />;
        break;
      case 'fuel-analysis':
        page = <FuelAnalysis />;
        break;
      case 'sla-reports':
        page = <SLAReports />;
        break;
      case 'risk-insights':
        page = <RiskInsights />;
        break;
      case 'penalties':
        page = <Penalties />;
        break;
      case 'fuel-reports':
        page = <FuelReports />;
        break;
      case 'insights':
        page = <InsightsPage />;
        break;
      case 'settings':
        page = <Settings />;
        break;
      default:
        page = <OwnerDashboard />;
    }

    return (
      <OwnerLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        user={user}
      >
        {page}
      </OwnerLayout>
    );
  }

  /* =========================
     SUPERVISOR PORTAL
  ========================= */
  if (userRole === 'SUPERVISOR') {
    return (
      <SupervisorLayout
        onLogout={handleLogout}
        user={user}
      />
    );
  }

  /* =========================
     FLEET PORTAL
  ========================= */
  if (userRole === 'FLEET') {
    return <FleetDashboard onLogout={handleLogout} />;
  }

  return null;
}
