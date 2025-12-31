import { useState, useEffect } from 'react';
import {
  LayoutDashboard,
  MapPin,
  Settings as SettingsIcon,
  Truck,
  Menu,
  LogOut,
  User,
} from 'lucide-react';
import FleetMap from './FleetMap';
import FleetSettings from './FleetSettings';
import { Button } from '../components/ui/button.jsx';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '../components/ui/page-header.jsx';
import { SectionCard, SectionCardHeader, SectionCardContent } from '../components/ui/section-card.jsx';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '../components/ui/sheet.jsx';

import { Switch } from '../components/ui/switch.jsx';

import { API_BASE_URL } from '../services/apiBase';

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
  const [driver, setDriver] = useState(null);

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
      } catch {
        setVehicle(null);
      }
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

  /* =========================
     FETCH CURRENT DRIVER FOR ASSIGNED VEHICLE
  ========================= */
  // Robust driver refresh function
  const refreshDriver = () => {
    if (!vehicle?.vehicle_id) {
      setDriver(null);
      return;
    }
    let cancelled = false;
    fetch(`${API_BASE_URL}/assign-driver/current`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => {
        if (cancelled) return;
        const current = Array.isArray(data) ? data.find(d => d.vehicle_id === vehicle.vehicle_id) : null;
        setDriver(current || null);
      })
      .catch(() => setDriver(null));
    return () => { cancelled = true; };
  };
  useEffect(refreshDriver, [vehicle]);

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
      style={{ height: '100vh', backgroundColor: 'var(--sidebar)', color: 'var(--sidebar-foreground)' }}
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
        <div style={{ position: 'fixed', inset: 0, right: 'auto', width: 288, height: '100vh', zIndex: 40 }}>
          {sidebarContent}
        </div>
      )}

      <div className="flex min-w-0 flex-col" style={{ minHeight: '100vh', paddingLeft: isDesktop ? 288 : 0 }}>
        {!isDesktop && (
          <header className="sticky top-0 z-50 border-b border-border bg-background">
            <div className="flex h-12 items-center gap-3 px-3">
              <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
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
                <div className="text-[10px] text-muted-foreground truncate">Fleet Portal</div>
              </button>
            </div>
          </header>
        )}

        <main className="flex-1 min-h-0 overflow-auto bg-background">
          {isWidePage ? (
            <div className="p-3 sm:p-4 min-h-0">
              {activeTab === 'location' && vehicle && (
                <div className="w-full min-h-0">
                  <FleetMap
                    user={{ vehicle_id: vehicle.vehicle_id }}
                    className="h-[calc(100svh-120px)] min-h-[620px]"
                    style={{ height: 'calc(100svh - 120px)', minHeight: 620, maxHeight: 'none' }}
                  />
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
                {activeTab === 'dashboard' && (
                  <div className="space-y-4">
                    <PageHeader>
                      <div>
                        <PageHeaderTitle>Dashboard</PageHeaderTitle>
                        <PageHeaderDescription>
                          Today’s overview for your assigned vehicle
                        </PageHeaderDescription>
                      </div>
                    </PageHeader>

                    <div className="grid gap-4 lg:grid-cols-3">
                      <SectionCard className="lg:col-span-2">
                        <SectionCardHeader title="Today Distance" description="Auto-refreshes every 30 seconds" />
                        <SectionCardContent className="p-4 sm:p-6">
                          <div className="space-y-3">
                            {vehicle?.vehicle_number && (
                              <div className="text-sm text-muted-foreground">
                                Vehicle:{' '}
                                <span className="font-semibold text-foreground">
                                  {vehicle.vehicle_number}
                                </span>
                              </div>
                            )}

                            {driver?.driver_name && (
                              <div className="text-sm text-muted-foreground">
                                Driver:{' '}
                                <span className="font-semibold text-foreground">
                                  {driver.driver_name}
                                </span>
                              </div>
                            )}

                            {distanceLoading && (
                              <div className="text-sm text-muted-foreground">Calculating distance…</div>
                            )}

                            {!distanceLoading && !distanceError && (
                              <div className="text-4xl font-bold tracking-tight text-primary tabular-nums">
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
                        </SectionCardContent>
                      </SectionCard>

                      <SectionCard>
                        <SectionCardHeader title="Quick tips" description="Keep tracking accurate" />
                        <SectionCardContent className="p-4 sm:p-6 space-y-2 text-sm text-muted-foreground">
                          <div>Enable location permission when prompted.</div>
                          <div>Keep the app open during trips for live updates.</div>
                          <div>Switch to “Live Location” to see the map full screen.</div>
                        </SectionCardContent>
                      </SectionCard>
                    </div>
                  </div>
                )}

                {activeTab === 'settings' && (
                  <FleetSettings
                    onVehicleAssigned={(v) => {
                      setVehicle(v);
                      localStorage.setItem('assignedVehicle', JSON.stringify(v));
                      refreshDriver();
                    }}
                    onLogout={onLogout}
                  />
                )}
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
