import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  RefreshCw,
  Clock3,
  Navigation,
  Activity,
} from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import VehicleMap from '../components/map/VehicleMap.jsx';
import { getLatestTelemetry } from '../services/api.js';

/**
 * SupervisorDashboard
 * Live operations view (MAP + VEHICLE STATUS)
 */

const FALLBACK_VEHICLES = [
  {
    id: 'HR55AN2175',
    number: 'HR55AN2175',
    status: 'moving',
    speed: 42,
    lat: 28.4595,
    lng: 77.0266,
    address: 'Gurugram, HR',
    lastUpdated: 'just now',
  },
  {
    id: 'HR47E2573',
    number: 'HR47E2573',
    status: 'stopped',
    speed: 0,
    lat: 28.4289,
    lng: 77.0319,
    address: 'IFFCO Chowk, HR',
    lastUpdated: '2 min ago',
  },
];

const statusBadge = {
  moving: 'bg-green-100 text-green-700',
  idling: 'bg-amber-100 text-amber-700',
  stopped: 'bg-red-100 text-red-700',
};

export default function SupervisorDashboard({ onNavigate }) {
  const [vehicles, setVehicles] = useState(FALLBACK_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState(
    FALLBACK_VEHICLES[0]?.id
  );
  const [isLoading, setIsLoading] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  const fetchTelemetry = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getLatestTelemetry();
      if (Array.isArray(data) && data.length) {
        setVehicles(data);
        setSelectedVehicleId(data[0]?.id);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Telemetry error', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const id = setInterval(fetchTelemetry, 8000);
    return () => clearInterval(id);
  }, [fetchTelemetry]);

  const summary = useMemo(() => {
    return {
      total: vehicles.length,
      moving: vehicles.filter(v => v.status === 'moving').length,
      stopped: vehicles.filter(v => v.status === 'stopped').length,
      idling: vehicles.filter(v => v.status === 'idling').length,
    };
  }, [vehicles]);

  return (
    <div className="flex h-full">
      {/* ================= MAP ================= */}
      <div className="flex-1 relative">
        {/* Header */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white/95 backdrop-blur px-6 py-3 rounded-xl shadow border flex items-center gap-4">
            <MapPin className="h-5 w-5 text-emerald-600" />
            <span className="text-sm font-medium">
              Live Vehicle Monitoring
            </span>
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Clock3 className="h-3 w-3" />
              {lastUpdated
                ? lastUpdated.toLocaleTimeString()
                : 'Updating'}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={fetchTelemetry}
              disabled={isLoading}
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  isLoading ? 'animate-spin' : ''
                }`}
              />
            </Button>
          </div>
        </div>

        <VehicleMap
          vehicles={vehicles}
          selectedVehicleId={selectedVehicleId}
          onVehicleClick={(v) => setSelectedVehicleId(v.id)}
          center={[28.6139, 77.209]}
          zoom={6}
        />
      </div>

      {/* ================= RIGHT PANEL ================= */}
      <aside className="w-80 bg-white border-l p-4 overflow-y-auto">
        {/* Summary */}
        <div className="mb-4">
          <p className="text-xs text-slate-500">Live Vehicles</p>
          <p className="text-lg font-semibold flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-600" />
            {summary.total}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex gap-2 mb-4">
          <Button
            size="sm"
            className="flex-1"
            onClick={() => onNavigate('fuel-entry')}
          >
            + Fuel Entry
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="flex-1"
            onClick={() => onNavigate('complaints')}
          >
            Report Issue
          </Button>
        </div>

        {/* Vehicle List */}
        <div className="space-y-3">
          {vehicles.map((v) => (
            <button
              key={v.id}
              onClick={() => setSelectedVehicleId(v.id)}
              className={`w-full text-left p-3 rounded-lg border transition ${
                selectedVehicleId === v.id
                  ? 'border-emerald-300 bg-emerald-50'
                  : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold text-sm">
                    {v.number}
                  </p>
                  <p className="text-xs text-slate-500">
                    {v.address}
                  </p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    statusBadge[v.status]
                  }`}
                >
                  {v.status}
                </span>
              </div>

              <div className="mt-2 flex justify-between text-xs text-slate-600">
                <span>Speed: {v.speed} km/h</span>
                <span>{v.lastUpdated}</span>
              </div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
