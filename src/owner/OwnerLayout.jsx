import {
  LayoutDashboard,
  Droplet,
  BarChart3,
  TrendingUp,
  AlertTriangle,
  FileText,
  Settings as SettingsIcon,
  LogOut,
  User,
} from 'lucide-react';
import { Button } from '../components/ui/button.jsx';

/**
 * OwnerLayout
 * Executive / decision-making layout
 * NO live tracking, NO operational controls
 */
export function OwnerLayout({
  children,
  onLogout,
  onNavigate,
  currentPage,
}) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'fuel-analysis', label: 'Fuel Analysis', icon: Droplet },
    { id: 'fuel-reports', label: 'Fuel Reports', icon: FileText },
    { id: 'sla-reports', label: 'SLA Reports', icon: BarChart3 },
    { id: 'risk-insights', label: 'Risk Insights', icon: TrendingUp },
    { id: 'penalties', label: 'Penalties', icon: AlertTriangle },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <div className="flex h-screen bg-slate-100 overflow-hidden">
      {/* ================= SIDEBAR ================= */}
      <aside className="w-72 bg-[#0b1220] text-white flex flex-col shadow-xl">
        {/* Logo */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-emerald-600 p-2 rounded-lg">
              <LayoutDashboard className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="font-semibold tracking-tight">
                FleetMaster Pro
              </h1>
              <p className="text-xs text-slate-400">
                Owner Portal
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <p className="text-xs text-slate-400 px-4 mb-3">
            MANAGEMENT
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
                Fleet Owner
              </p>
              <p className="text-xs text-slate-400 truncate">
                Administrator
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
      <main className="flex-1 overflow-y-auto bg-slate-50">
        <div className="p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
