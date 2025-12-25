import { useState } from 'react';

import {
  LayoutDashboard,
  Droplet,
  MapPin,
  Activity,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FileText,
  Menu,
  Settings as SettingsIcon,
  LogOut,
  User,
  Sun,
  Moon,
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
   OWNER PAGES
========================= */
import OwnerDashboard from './OwnerDashboard.jsx';
import { FuelAnalysis } from './FuelAnalysis.jsx';
import SLAReports  from './SLAReports.jsx';
//import { RiskInsights } from './RiskInsights.jsx';
//import { Penalties } from './Penalties.jsx';
//import { FuelReports } from './FuelReports.jsx';
import { Settings } from './Settings.jsx';
import AddVehicle from './AddVehicle.jsx';
import { OwnerLiveTracking } from './OwnerLiveTracking.jsx';
import { RouteTracing } from './RouteTracing.jsx';


/**
 * OwnerLayout
 * Executive / decision-making layout
 */
export function OwnerLayout({ onLogout, user, theme, onThemeChange }) {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'live-tracking', label: 'Live Tracking', icon: MapPin },
    { id: 'route-tracing', label: 'Route Tracing', icon: Activity },
    { id: 'fuel-analysis', label: 'Fuel Analysis', icon: Droplet },
    //{ id: 'fuel-reports', label: 'Fuel Reports', icon: FileText },
    { id: 'sla-reports', label: 'SLA Reports', icon: BarChart3 },
  //  { id: 'risk-insights', label: 'Risk Insights', icon: TrendingUp },
   // { id: 'penalties', label: 'Penalties', icon: AlertTriangle },
    { id: 'addvehicle', label: 'Add Vehicle', icon: SettingsIcon },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const renderPage = () => {
    switch (currentPage) {
      case 'live-tracking':
        return <OwnerLiveTracking />;
      case 'route-tracing':
        return <RouteTracing />;
      case 'fuel-analysis':
        return <FuelAnalysis />;
     // case 'fuel-reports':
       // return <FuelReports />;
      case 'sla-reports':
        return <SLAReports />;
     // case 'risk-insights':
       // return <RiskInsights />;
      //case 'penalties':
        //return <Penalties />;
      case 'settings':
        return <Settings />;
        
       case 'addvehicle':
  return <AddVehicle owner={user} />;

      case 'dashboard':
      default:
        return < AddVehicle/>;
    }
  };

  const handleNavClick = (pageId) => {
    setCurrentPage(pageId);
    setMobileNavOpen(false);
  };

  const sidebarContent = (
    <aside className="flex w-full bg-sidebar text-sidebar-foreground flex-col min-h-0">
      <div className="p-4 sm:p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg">
            <LayoutDashboard className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold tracking-tight truncate">
              FleetMaster Pro
            </h1>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              Owner Portal
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 min-h-0 p-3 sm:p-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-sidebar-foreground/70 px-3 sm:px-4 mb-3">
          MANAGEMENT
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
              <span className="text-sm font-medium">
                {item.label}
              </span>
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
            <p className="text-sm font-medium truncate">
              {user?.name || 'Fleet Owner'}
            </p>
            <p className="text-xs text-sidebar-foreground/70 truncate">
              Administrator
            </p>
          </div>
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
    <div className="flex min-h-svh bg-background overflow-hidden">
      {/* ================= SIDEBAR ================= */}
      <div className="hidden lg:flex w-72 shrink-0 min-h-0 lg:sticky lg:top-0 lg:h-svh">
        {sidebarContent}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
          <div className="flex h-14 md:h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    className="h-11 w-11 lg:hidden"
                    aria-label="Open navigation"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent
                  side="left"
                  className="w-[18rem] max-w-[90vw] p-0 bg-sidebar text-sidebar-foreground border-sidebar-border"
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
                className="flex items-center gap-3 min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Go to dashboard"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg shrink-0">
                  <LayoutDashboard className="h-5 w-5" />
                </div>
                <div className="min-w-0 text-left">
                  <h1 className="text-sm font-semibold tracking-tight truncate">
                    FleetMaster Pro
                  </h1>
                  <p className="text-[10px] text-muted-foreground truncate">Owner Portal</p>
                </div>
              </button>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 h-11 rounded-md border border-border bg-muted/40 px-3">
                <Sun className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={(checked) =>
                    onThemeChange?.(checked ? 'dark' : 'light')
                  }
                  aria-label="Toggle dark mode"
                />
                <Moon className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
              </div>
              <Button
                onClick={onLogout}
                variant="outline"
                className="h-11 border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        {/* ================= MAIN CONTENT ================= */}
        <main className="flex-1 min-h-0 overflow-auto bg-background p-3 sm:p-4 lg:p-6">
          <div className="mx-auto w-full max-w-7xl">
            <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
              {renderPage()}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
