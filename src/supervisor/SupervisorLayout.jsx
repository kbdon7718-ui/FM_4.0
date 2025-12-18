import {
  LayoutDashboard,
  Truck,
  Droplet,
  Navigation,
  AlertCircle,
  MapPin,
  LogOut,
  User,
} from 'lucide-react';
import { Button } from '../components/ui/button.jsx';

/**
 * SupervisorLayout
 * Operational layout for supervisors
 * Focus: live operations, quick actions
 */
export function SupervisorLayout({
  children,
  onLogout,
  onNavigate,
  currentPage,
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fuel-entry', label: 'Fuel Entry', icon: Droplet },
    { id: 'live-tracking', label: 'Live Tracking', icon: Navigation },
    { id: 'vehicle-tracking', label: 'Vehicle Tracking', icon: Truck },
    { id: 'complaints', label: 'Complaints', icon: AlertCircle },
    { id: 'geofencing', label: 'Geofencing', icon: MapPin },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-[#0a0f1e] text-white flex flex-col shadow-xl">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <Truck className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold tracking-tight">
                FleetMaster Pro
              </h1>
              <p className="text-xs text-slate-400">
                Supervisor Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs text-slate-400 px-4 mb-3">
            OPERATIONS
          </p>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;

            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition ${
                  isActive
                    ? 'bg-emerald-600 text-white'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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

        {/* User / Logout */}
        <div className="p-4 border-t border-slate-800">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg mb-3">
            <div className="h-10 w-10 rounded-full bg-emerald-600 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">
                Supervisor
              </p>
              <p className="text-xs text-slate-400 truncate">
                Operations
              </p>
            </div>
          </div>

          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:bg-slate-800"
          >
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </aside>

      {/* ================= MAIN CONTENT ================= */}
      <main className="flex-1 overflow-hidden bg-slate-50">
        {children}
      </main>
    </div>
  );
}
