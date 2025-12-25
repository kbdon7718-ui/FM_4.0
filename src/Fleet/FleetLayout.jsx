import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MapPin,
  Settings as SettingsIcon,
  Truck,
  Menu,
  LogOut,
  User,
  Sun,
  Moon,
} from 'lucide-react';
import FleetMap from './FleetMap';
import FleetSettings from './FleetSettings';
import { Button } from '../components/ui/button.jsx';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet.jsx';

import { Switch } from '../components/ui/switch.jsx';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
const API_BASE_URL = BASE_URL.endsWith('/api')
  ? BASE_URL
  : `${BASE_URL}/api`;

export default function FleetLayout({ onLogout, user, theme, onThemeChange }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => {
    if (typeof window === 'undefined') return true;
    if (typeof window.matchMedia !== 'function') return window.innerWidth >= 1024;
    return window.matchMedia('(min-width: 1024px)').matches;
  });
  const [vehicle, setVehicle] = useState(null);
  const [distance, setDistance] = useState(0);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState('');

  useEffect(() => {
    if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;

    const mql = window.matchMedia('(min-width: 1024px)');
    const onChange = (e) => {
      setIsDesktop(e.matches);
      if (e.matches) setMobileNavOpen(false);
    };

    setIsDesktop(mql.matches);
    if (typeof mql.addEventListener === 'function') mql.addEventListener('change', onChange);
    else mql.addListener(onChange);

    return () => {
      if (typeof mql.removeEventListener === 'function') mql.removeEventListener('change', onChange);
      else mql.removeListener(onChange);
    };
  }, []);


  /* =========================
     RESTORE VEHICLE
  ========================= */
  useEffect(() => {
    const saved = localStorage.getItem('assignedVehicle');
    if (saved) {
      try {
        setVehicle(JSON.parse(saved));
      } catch {}
    }
  }, []);


  
  /* =========================
     FETCH DISTANCE
  ========================= */
/* =========================
   FETCH DISTANCE (AUTO REFRESH)
========================= */
useEffect(() => {
  if (!vehicle?.vehicle_id) return;

  let isMounted = true;

  const fetchDistance = async () => {
    try {
      setDistanceLoading(true);
      setDistanceError('');

      const res = await fetch(
        `${API_BASE_URL}/fleet/distance-today?vehicle_id=${vehicle.vehicle_id}`,
        {
          headers: {
            'x-role': 'FLEET',
            'x-vehicle-id': vehicle.vehicle_id,
          },
        }
      );

      if (!res.ok) throw new Error('Failed');

      const data = await res.json();
      if (isMounted) {
        setDistance(Number(data?.distance_km || 0));
      }
    } catch {
      if (isMounted) {
        setDistanceError('Unable to calculate distance');
      }
    } finally {
      if (isMounted) {
        setDistanceLoading(false);
      }
    }
  };

  // ⏱ fetch immediately
  fetchDistance();

  // 🔁 refresh every 30 seconds
  const interval = setInterval(fetchDistance, 30000);

  return () => {
    isMounted = false;
    clearInterval(interval);
  };
}, [vehicle]);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'location', label: 'Live Location', icon: MapPin },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setMobileNavOpen(false);
  };

  const isWidePage = activeTab === 'location';

  const sidebarContent = (
    <aside
      className="flex w-full bg-sidebar text-sidebar-foreground flex-col min-h-0"
      style={{ height: '100vh' }}
    >
      <div className="p-4 sm:p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg">
            <Truck className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold tracking-tight truncate">FleetMaster Pro</h1>
            <p className="text-xs text-sidebar-foreground/70 truncate">Fleet Portal</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 min-h-0 p-3 sm:p-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-sidebar-foreground/70 px-3 sm:px-4 mb-3">FLEET</p>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              type="button"
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
            <p className="text-sm font-medium truncate">{user?.name || 'Fleet User'}</p>
            <p className="text-xs text-sidebar-foreground/70 truncate">Assigned Vehicle</p>
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
    <div className="bg-background" style={{ minHeight: '100vh' }}>
      {/* ================= DESKTOP SIDEBAR (FIXED) ================= */}
      {isDesktop && (
        <div style={{ position: 'fixed', inset: 0, right: 'auto', width: 288, height: '100vh', zIndex: 40 }}>
          {sidebarContent}
        </div>
      )}

      <div className="flex min-w-0 flex-col" style={{ minHeight: '100vh', paddingLeft: isDesktop ? 288 : 0 }}>
        <header className="sticky top-0 z-50 border-b border-border bg-card/80 backdrop-blur">
          <div className="flex h-14 md:h-16 items-center justify-between gap-3 px-4 sm:px-6">
            <div className="flex items-center gap-3 min-w-0">
              {!isDesktop && (
                <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
                  <SheetTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      className="h-11 w-11"
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
              )}

              <button
                type="button"
                onClick={() => handleNavClick('dashboard')}
                className="flex items-center gap-3 min-w-0 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                aria-label="Go to dashboard"
              >
                <div className="bg-sidebar-primary text-sidebar-primary-foreground p-2 rounded-lg shrink-0">
                  <Truck className="h-5 w-5" />
                </div>
                <div className="min-w-0 text-left">
                  <h1 className="text-sm font-semibold tracking-tight truncate">
                    FleetMaster Pro
                  </h1>
                  <p className="text-[10px] text-muted-foreground truncate">Fleet Portal</p>
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
                variant="destructive"
                className="h-11"
              >
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>
            </div>
          </div>
        </header>

        <main className="flex-1 min-h-0 overflow-auto bg-background">
          {isWidePage ? (
            <div className="p-3 sm:p-4">
              {activeTab === 'location' && vehicle && (
                <div className="w-full">
                  <FleetMap user={{ vehicle_id: vehicle.vehicle_id }} />
                </div>
              )}

              {activeTab === 'location' && !vehicle && (
                <div className="text-center text-muted-foreground mt-10 sm:mt-16">
                  Please assign a vehicle in Settings first
                </div>
              )}
            </div>
          ) : (
            <div className="p-3 sm:p-4 lg:p-6">
              <div className="mx-auto w-full max-w-7xl">
                <div className="rounded-xl border border-border bg-card p-4 sm:p-5">
                  {activeTab === 'dashboard' && (
                    <div className="max-w-md mx-auto text-center mt-10 sm:mt-16 space-y-4">
                  <h2 className="text-xl font-semibold tracking-tight">Today Distance</h2>

                  {vehicle?.vehicle_number && (
                    <div className="text-sm text-muted-foreground">
                      Vehicle:{' '}
                      <span className="font-semibold text-foreground">
                        {vehicle.vehicle_number}
                      </span>
                    </div>
                  )}

                  {distanceLoading && (
                    <div className="text-sm text-muted-foreground">Calculating distance…</div>
                  )}

                  {!distanceLoading && !distanceError && (
                    <div className="text-3xl font-bold tracking-tight text-primary tabular-nums">
                      {distance.toFixed(2)} km
                    </div>
                  )}

                  {distanceError && (
                    <div className="text-sm text-destructive">{distanceError}</div>
                  )}

                  <p className="text-sm text-muted-foreground">
                    Distance covered by assigned vehicle
                  </p>
                    </div>
                  )}

                  {activeTab === 'settings' && (
                    <FleetSettings
                      onVehicleAssigned={(v) => {
                        setVehicle(v);
                        localStorage.setItem('assignedVehicle', JSON.stringify(v));
                      }}
                      onLogout={onLogout}
                    />
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
