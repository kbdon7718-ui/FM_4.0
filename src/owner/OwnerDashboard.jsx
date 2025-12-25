import { useEffect, useState } from 'react';
import {
  Truck,
  CheckCircle,
} from 'lucide-react';

import api from '../services/api.js';
const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5002';

export default function OwnerDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getOwnerDashboard()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="text-muted-foreground">
        Loading dashboard…
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* KPI ROW */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <KPI
          title="Total Vehicles"
          value={stats.totalVehicles}
          icon={Truck}
        />

        <KPI
          title="On-Time Arrivals"
          value={stats.onTimeArrivals}
          icon={CheckCircle}
          success
        />
      </div>

      {/* INFO SECTION */}
      <div className="p-5 sm:p-6 rounded-xl border border-border bg-card">
        <h3 className="font-semibold mb-2">
          Operational Summary
        </h3>
        <p className="text-sm text-muted-foreground">
          This dashboard shows live operational performance based on
          actual vehicle GPS and geofence events.
        </p>
      </div>
    </div>
  );
}

/* =========================
   KPI CARD
========================= */
function KPI({ title, value, icon: Icon, success }) {
  return (
    <div
      className={`p-5 rounded-2xl border ${
        success
          ? 'border-success-muted bg-success-muted'
          : 'border-border bg-card'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <p className="text-3xl font-bold text-foreground mt-1">
            {value}
          </p>
        </div>

        <div
          className={`h-12 w-12 flex items-center justify-center rounded-xl ${
            success
              ? 'bg-success-muted text-success'
              : 'bg-muted/40 text-muted-foreground'
          }`}
        >
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
