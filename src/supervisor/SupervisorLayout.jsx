import { useEffect, useState } from 'react';
import {
  LayoutDashboard,
  Truck,
  Droplet,
  Navigation,
  MapPin,
  LogOut,
  User,
  Wrench,
  UserCheck,
  Map,
  Menu,
} from 'lucide-react';

import { Button } from '../components/ui/button.jsx';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet.jsx';

import { Switch } from '../components/ui/switch.jsx';

/* =========================
   SUPERVISOR PAGES
========================= */
import SupervisorDashboard from './SupervisorDashboard.jsx';
import { FuelEntry } from './FuelEntry.jsx';
import { LiveTracking } from './LiveTracking.jsx';
//import { VehicleTracking } from './VehicleTracking.jsx';
//import { ComplaintsPanel } from './ComplaintsPanel.jsx';
import GeofencingPage  from './GeofencingPage.jsx';
import { Maintenance } from './Maintenance.jsx';
import { AssignDriver } from './AssignDriver.jsx';
import { Companyroutesmanagemnt } from './Companyroutesmanagemnt.jsx';

/**
 * SupervisorLayout (TOP HEADER)
 * - Header navigation
 * - Page state
 * - Page rendering
 */
export function SupervisorLayout({ onLogout, user, theme, onThemeChange }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    if (typeof window.matchMedia !== 'function') return window.innerWidth >= 1024;
    return window.matchMedia('(min-width: 1024px)').matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => {
      setIsDesktop(e.matches);
      if (e.matches) setMobileOpen(false);
    };

    setIsDesktop(mql.matches);
    if (typeof mql.addEventListener === 'function') mql.addEventListener('change', onChange);
    else mql.addListener(onChange);

    return () => {
      if (typeof mql.removeEventListener === 'function') mql.removeEventListener('change', onChange);
      else mql.removeListener(onChange);
    };
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fuel-entry', label: 'Fuel Entry', icon: Droplet },
    { id: 'live-tracking', label: 'Live Tracking', icon: Navigation },
   // { id: 'vehicle-tracking', label: 'Vehicle Tracking', icon: Truck },
  //  { id: 'complaints', label: 'Complaints', icon: AlertCircle },
    { id: 'geofencing', label: 'Geofencing', icon: MapPin },
    { id: 'maintenance', label: 'Maintenance', icon: Wrench },
    { id: 'assign-driver', label: 'Assign Driver', icon: UserCheck },
    { id: 'company-routes', label: 'Company Routes', icon: Map },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <SupervisorDashboard onNavigate={handleNavClick} />;
      case 'fuel-entry':
        return <FuelEntry />;
      case 'live-tracking':
        return <LiveTracking />;
      //case 'vehicle-tracking':
       // return <VehicleTracking />;
    //  case 'complaints':
      //  return <ComplaintsPanel />;
      case 'geofencing':
        return <GeofencingPage />;
      case 'maintenance':
        return <Maintenance />;
      case 'assign-driver':
        return <AssignDriver />;
      case 'company-routes':
        return <Companyroutesmanagemnt />;
      default:
        return <SupervisorDashboard />;
    }
  };

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setMobileOpen(false);
  };

  const isWidePage =
    currentPage === 'dashboard' ||
    currentPage === 'live-tracking' ||
    currentPage === 'geofencing';

  const sidebarContent = (
    <aside
      className="flex w-full bg-sidebar text-sidebar-foreground flex-col min-h-0"
      style={{ height: '100vh', backgroundColor: 'var(--sidebar)', color: 'var(--sidebar-foreground)' }}
    >
      <div className="p-4 sm:p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg">
            <Truck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold tracking-tight truncate">
              FleetMaster Pro
            </h1>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              Supervisor Portal
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 min-h-0 p-3 sm:p-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-sidebar-foreground/70 px-3 sm:px-4 mb-3">
          OPERATIONS
        </p>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring focus-visible:ring-offset-2 focus-visible:ring-offset-sidebar ${
                isActive
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground'
                  : 'text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-3 sm:p-4 border-t border-sidebar-border shrink-0">
        <div className="flex items-center gap-3 p-3 bg-sidebar-accent/60 rounded-lg mb-3">
          <div className="h-10 w-10 rounded-full bg-sidebar-primary text-sidebar-primary-foreground flex items-center justify-center">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{user?.name || 'Supervisor'}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">Operations</p>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 p-3 bg-sidebar-accent/60 rounded-lg mb-2">
          <div className="min-w-0">
            <p className="text-sm font-medium truncate">Dark mode</p>
          </div>
          <Switch
            checked={theme === 'dark'}
            onCheckedChange={(checked) => onThemeChange?.(checked ? 'dark' : 'light')}
            aria-label="Toggle dark mode"
          />
        </div>

        <Button
          onClick={onLogout}
          variant="ghost"
          className="w-full justify-start text-destructive hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </aside>
  );

  return (
    <div className="bg-background" style={{ minHeight: '100vh' }}>
      {/* ================= DESKTOP SIDEBAR (FIXED) ================= */}
      {isDesktop && (
        <div
          style={{ position: 'fixed', inset: 0, right: 'auto', width: 288, height: '100vh', zIndex: 40 }}
        >
          {sidebarContent}
        </div>
      )}

      <div
        className="flex min-w-0 flex-col"
        style={{ minHeight: '100vh', paddingLeft: isDesktop ? 288 : 0 }}
      >
        {!isDesktop && (
          <header className="sticky top-0 z-50 border-b border-border bg-background">
            <div className="flex h-12 items-center gap-3 px-3">
              <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-9 w-9"
                    aria-label="Open navigation"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[18rem] max-w-[90vw] p-0 bg-sidebar text-sidebar-foreground border-sidebar-border"
                  style={{ backgroundColor: 'var(--sidebar)', color: 'var(--sidebar-foreground)', borderColor: 'var(--sidebar-border)' }}
                >
                  <SheetHeader className="sr-only">
                    <SheetTitle>Navigation</SheetTitle>
                  </SheetHeader>
                  {sidebarContent}
                </SheetContent>
              </Sheet>

              <button
                type="button"
                onClick={() => handleNavClick('dashboard')}
                className="min-w-0 text-left"
                aria-label="Go to dashboard"
              >
                <div className="text-sm font-semibold tracking-tight truncate">FleetMaster Pro</div>
                <div className="text-[10px] text-muted-foreground truncate">Supervisor Portal</div>
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 min-h-0 overflow-auto bg-background">
          {isWidePage ? (
            <div className="p-3 sm:p-4">
              {renderPage()}
            </div>
          ) : (
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="mx-auto w-full max-w-7xl">
                <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                  {renderPage()}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
