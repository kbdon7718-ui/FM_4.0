import { useState } from 'react';
import { 
  LayoutDashboard, 
  Truck, 
  Droplet, 
  MessageSquare, 
  Settings as SettingsIcon,
  LogOut,
  Bell,
  User,
  X,
  BarChart3
} from 'lucide-react';
import { Button } from './ui/button.jsx';
import { Badge } from './ui/badge.jsx';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from './ui/sheet.jsx';

export function DashboardLayout({ 
  children, 
  userRole, 
  currentPage, 
  onNavigate, 
  onLogout 
}) {
  const [isContentOpen, setIsContentOpen] = useState(false);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'insights', label: 'Insights', icon: BarChart3 },
    { id: 'vehicles', label: 'Vehicle Tracking', icon: Truck },
    { id: 'fuel', label: 'Fuel Reports', icon: Droplet },
    { id: 'complaints', label: 'Complaints', icon: MessageSquare },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  const handleNavigation = (page) => {
    onNavigate(page);
    if (page !== 'dashboard' && page !== 'vehicles' && page !== 'fuel' && page !== 'complaints' && page !== 'settings' && page !== 'insights') {
      setIsContentOpen(true);
    } else {
      setIsContentOpen(false);
    }
  };

  const currentPageLabel = navItems.find(item => item.id === currentPage)?.label || 'Dashboard';

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Left Sidebar */}
      <aside className="relative z-10 w-72 bg-[#0a0f1e] text-white flex flex-col shadow-2xl">
        {/* Logo Section */}
        <div className="p-6 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-[#10b981] p-2 rounded-lg">
              <Truck className="h-6 w-6" />
            </div>
            <div>
              <h1 className="tracking-tight">FleetMaster Pro</h1>
              <p className="text-xs text-slate-400">Transport Management</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <p className="text-xs text-slate-400 px-4 mb-3">MAIN MENU</p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            return (
              <div key={item.id}>
                <button
                  onClick={() => handleNavigation(item.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{item.label}</span>
                </button>
                
                {/* Vehicle Tracking Expanded Section */}
                {item.id === 'vehicles' && isActive && (
                  <div className="mt-3 space-y-3 px-2">
                    {/* Removed search, notification icons and vehicle stats */}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        {/* User Profile & Logout Section */}
        <div className="p-4 border-t border-slate-700 space-y-3">
          <div className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg">
            <div className="h-10 w-10 rounded-full bg-[#10b981] flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-white">RKT Travels</p>
              <p className="text-xs text-slate-400 capitalize">{userRole}</p>
            </div>
            <div className="relative">
              <Bell className="h-5 w-5 text-slate-400" />
              <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-red-500 text-white text-[10px]">
                3
              </Badge>
            </div>
          </div>

          <Button
            onClick={onLogout}
            variant="ghost"
            className="w-full justify-start text-slate-300 hover:text-white hover:bg-slate-800"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </Button>
        </div>
      </aside>

      {/* Content Sheet Overlay */}
      <Sheet open={isContentOpen} onOpenChange={setIsContentOpen}>
        <SheetContent 
          side="right" 
          className="w-[45vw] overflow-y-auto p-0"
        >
          <SheetHeader className="p-6 border-b border-slate-200 bg-white sticky top-0 z-10">
            <div className="flex items-center justify-between">
              <SheetTitle className="flex items-center gap-2 text-slate-900">
                {navItems.find(item => item.id === currentPage)?.icon && (
                  <div className="bg-[#10b981] p-2 rounded-lg">
                    {(() => {
                      const Icon = navItems.find(item => item.id === currentPage).icon;
                      return <Icon className="h-5 w-5 text-white" />;
                    })()}
                  </div>
                )}
                {currentPageLabel}
              </SheetTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsContentOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <p className="text-sm text-slate-500 text-left">
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </p>
          </SheetHeader>
          <div className="p-6">
            {children}
          </div>
        </SheetContent>
      </Sheet>

      {/* Main Dashboard Content - Shows when on dashboard page */}
      {currentPage === 'dashboard' && (
        <main className="relative z-10 flex-1 overflow-hidden h-screen">
          {children}
        </main>
      )}

      {/* Main Vehicle Tracking Content - Shows when on vehicles page */}
      {currentPage === 'vehicles' && (
        <main className="relative z-10 flex-1 overflow-hidden h-screen">
          {children}
        </main>
      )}

      {/* Main Fuel Reports Content - Shows when on fuel page */}
      {currentPage === 'fuel' && (
        <main className="relative z-10 flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      )}

      {/* Main Complaints Content - Shows when on complaints page */}
      {currentPage === 'complaints' && (
        <main className="relative z-10 flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      )}

      {/* Main Settings Content - Shows when on settings page */}
      {currentPage === 'settings' && (
        <main className="relative z-10 flex-1 overflow-y-auto">
          <div className="p-8">
            {children}
          </div>
        </main>
      )}

      {/* Main Insights Content - Shows when on insights page */}
      {currentPage === 'insights' && (
        <main className="relative z-10 flex-1 overflow-y-auto">
          {children}
        </main>
      )}
    </div>
  );
}
