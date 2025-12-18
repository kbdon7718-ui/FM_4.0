import {
  Droplet,
  AlertTriangle,
  TrendingUp,
  Clock,
  Truck,
} from 'lucide-react';

export default function OwnerDashboard() {
  return (
    <div className="space-y-6">
      {/* KPI ROW */}
      <div className="grid grid-cols-4 gap-4">
        <KPI title="Total Vehicles" value="42" icon={Truck} />
        <KPI title="Fuel Theft Alerts" value="3" icon={Droplet} danger />
        <KPI title="SLA Violations" value="5" icon={Clock} />
        <KPI title="High Risk Vehicles" value="2" icon={AlertTriangle} danger />
      </div>

      {/* SECTIONS */}
      <div className="grid grid-cols-2 gap-6">
        <Section title="Recent Fuel Theft Alerts">
          <p className="text-sm text-slate-500">
            View vehicles with abnormal mileage variance.
          </p>
        </Section>

        <Section title="SLA Delay Summary">
          <p className="text-sm text-slate-500">
            Routes with late arrival beyond SLA window.
          </p>
        </Section>

        <Section title="Risk Correlation Overview">
          <p className="text-sm text-slate-500">
            Vehicles flagged by combined fuel + SLA logic.
          </p>
        </Section>

        <Section title="Pending Penalty Decisions">
          <p className="text-sm text-slate-500">
            Supervisor flagged events awaiting action.
          </p>
        </Section>
      </div>
    </div>
  );
}

/* ---------- Small UI Components ---------- */

function KPI({ title, value, icon: Icon, danger }) {
  return (
    <div
      className={`p-4 rounded-xl border ${
        danger
          ? 'border-red-200 bg-red-50 text-red-700'
          : 'border-slate-200 bg-white'
      }`}
    >
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4" />
        {title}
      </div>
      <div className="text-2xl font-bold mt-2">{value}</div>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div className="p-5 rounded-xl border border-slate-200 bg-white">
      <h3 className="font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}
