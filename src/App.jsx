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
import SupervisorDashboard from './supervisor/SupervisorDashboard.jsx';
import { FuelEntry } from './supervisor/FuelEntry.jsx';
import { LiveTracking } from './supervisor/LiveTracking.jsx';
import { ComplaintsPanel } from './supervisor/ComplaintsPanel.jsx';
import { GeofencingPage } from './supervisor/GeofencingPage.jsx';
import { VehicleTracking } from './supervisor/VehicleTracking.jsx';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState(null);

  /* page state is ROLE-SCOPED */
  const [currentPage, setCurrentPage] = useState(null);

  /* =========================
     AUTH HANDLERS
  ========================= */
  const handleLogin = (role) => {
    setUserRole(role);
    setIsLoggedIn(true);

    // default landing page per role
    setCurrentPage(role === 'owner' ? 'dashboard' : 'dashboard');
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setUserRole(null);
    setCurrentPage(null);
  };

  const handleNavigate = (page) => {
    setCurrentPage(page);
  };

  /* =========================
     LOGIN
  ========================= */
  if (!isLoggedIn) {
    return <LoginPage onLogin={handleLogin} />;
  }

  /* =========================
     OWNER PORTAL
  ========================= */
  if (userRole === 'owner') {
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
      >
        {page}
      </OwnerLayout>
    );
  }

  /* =========================
     SUPERVISOR PORTAL
  ========================= */
  if (userRole === 'supervisor') {
    let page = <SupervisorDashboard />;

    switch (currentPage) {
      case 'dashboard':
        page = <SupervisorDashboard />;
        break;
      case 'fuel-entry':
        page = <FuelEntry />;
        break;
      case 'live-tracking':
        page = <LiveTracking />;
        break;
      case 'vehicle-tracking':
        page = <VehicleTracking />;
        break;
      case 'complaints':
        page = <ComplaintsPanel />;
        break;
      case 'geofencing':
        page = <GeofencingPage />;
        break;
      default:
        page = <SupervisorDashboard />;
    }

    return (
      <SupervisorLayout
        currentPage={currentPage}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
      >
        {page}
      </SupervisorLayout>
    );
  }

  return null;
}
