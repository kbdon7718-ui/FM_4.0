import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin, Navigation, RefreshCw, Clock3, Activity } from 'lucide-react';
import VehicleMap from '../map/VehicleMap.jsx';
import { getLatestTelemetry } from '../../services/api.js';

const FALLBACK_VEHICLES = [
  { id: 'HR55AN2175', number: 'HR55AN2175', status: 'moving', statusText: 'Active', speed: 42, lat: 28.4595, lng: 77.0266, rotation: 90, address: 'Gurugram, HR', lastUpdated: 'just now' },
  { id: 'HR47E2573', number: 'HR47E2573', status: 'stopped', statusText: 'Stopped', speed: 0, lat: 28.4289, lng: 77.0319, rotation: 0, address: 'IFFCO Chowk, HR', lastUpdated: '2 min ago' },
  { id: 'UP32BN9021', number: 'UP32BN9021', status: 'idling', statusText: 'Idle', speed: 3, lat: 28.4744, lng: 77.504, rotation: 180, address: 'Greater Noida, UP', lastUpdated: '4 min ago' },
  { id: 'MP04CE7712', number: 'MP04CE7712', status: 'moving', statusText: 'Active', speed: 38, lat: 22.6243, lng: 75.5632, rotation: 45, address: 'Pithampur, MP', lastUpdated: '1 min ago' },
  { id: 'MH12RK5521', number: 'MH12RK5521', status: 'stopped', statusText: 'Stopped', speed: 0, lat: 18.6298, lng: 73.7997, rotation: 0, address: 'Pune, MH', lastUpdated: '6 min ago' },
];

const statusColor = {
  moving: 'text-green-600 bg-green-50 border-green-100',
  idling: 'text-amber-600 bg-amber-50 border-amber-100',
  stopped: 'text-red-600 bg-red-50 border-red-100',
};

function mapTelemetryPayload(payload = []) {
  return payload
    .map((item, index) => {
      const lat = item.latitude ?? item.lat;
      const lng = item.longitude ?? item.lng;
      if (lat === undefined || lng === undefined) return null;

      const speed = Number(item.speed || 0);
      const status = item.status || (speed > 1 ? 'moving' : speed === 0 ? 'stopped' : 'idling');

      return {
        id: item.vehicleId || item.id || `veh-${index}`,
        number: item.vehicleNumber || item.number || item.vehicleId || `Vehicle ${index + 1}`,
        status,
        statusText: item.statusText || status,
        speed: Math.round(speed),
        lat: Number(lat),
        lng: Number(lng),
        rotation: item.heading || item.bearing || 0,
        address: item.location || item.address,
        lastUpdated: item.updatedAt ? new Date(item.updatedAt).toLocaleTimeString() : 'just now',
      };
    })
    .filter(Boolean);
}

export function VehicleTracking() {
  const [vehicles, setVehicles] = useState(FALLBACK_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState(FALLBACK_VEHICLES[0]?.id);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fetchTelemetry = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getLatestTelemetry();
      const mapped = mapTelemetryPayload(data?.vehicles || data || []);
      if (mapped.length > 0) {
        setVehicles(mapped);
        setSelectedVehicleId((prev) => prev || mapped[0]?.id);
      }
      setLastUpdated(new Date());
      setError('');
    } catch (err) {
      setError(err?.message || 'Unable to load live telemetry. Showing recent data.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTelemetry();
    const intervalId = setInterval(fetchTelemetry, 8000);
    return () => clearInterval(intervalId);
  }, [fetchTelemetry]);

  const summary = useMemo(() => {
    const total = vehicles.length;
    const moving = vehicles.filter((v) => v.status === 'moving').length;
    const idling = vehicles.filter((v) => v.status === 'idling').length;
    const stopped = vehicles.filter((v) => v.status === 'stopped').length;
    return { total, moving, idling, stopped };
  }, [vehicles]);

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="flex-1 relative">
        {/* Header */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg flex items-center gap-3">
            <MapPin className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-xs text-slate-500">Live Fleet Tracking</p>
              <p className="text-sm text-slate-700 flex items-center gap-2">
                <Clock3 className="h-4 w-4 text-slate-400" />
                {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Updating...'}
              </p>
            </div>
            <button
              onClick={fetchTelemetry}
              className="ml-2 inline-flex items-center gap-2 text-xs px-3 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100 hover:bg-emerald-100 transition"
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              {isLoading ? 'Refreshing...' : 'Refresh'}
            </button>
          </div>
        </div>

        {/* Map */}
        <div className="absolute inset-0">
          <VehicleMap
            vehicles={vehicles}
            selectedVehicleId={selectedVehicleId}
            onVehicleClick={(v) => setSelectedVehicleId(v.id)}
            center={[28.6139, 77.209]}
            zoom={6}
          />
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-sm px-5 py-4 rounded-xl shadow-lg border border-slate-100">
          <h4 className="text-sm text-slate-900 mb-3">Live Fleet Status</h4>
          <div className="flex items-center gap-4 text-xs text-slate-700">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-green-500" /> Moving ({summary.moving})</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500" /> Idle ({summary.idling})</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" /> Stopped ({summary.stopped})</div>
          </div>
        </div>

        {error && (
          <div className="absolute bottom-6 right-6 z-20 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-lg shadow">
            {error}
          </div>
        )}
      </div>

      {/* Right rail */}
      <aside className="w-80 bg-white border-l border-slate-100 p-6 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500">Vehicles</p>
            <p className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" /> {summary.total} live
            </p>
          </div>
          <button
            onClick={fetchTelemetry}
            className="p-2 rounded-md border border-slate-200 hover:bg-slate-50 transition"
            title="Refresh"
          >
            <RefreshCw className={`h-4 w-4 text-slate-600 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <div className="space-y-3">
          {vehicles.map((vehicle) => (
            <button
              key={vehicle.id}
              onClick={() => setSelectedVehicleId(vehicle.id)}
              className={`w-full text-left p-3 rounded-lg border transition shadow-sm hover:shadow-md ${
                selectedVehicleId === vehicle.id ? 'border-emerald-200 bg-emerald-50' : 'border-slate-200 bg-white'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">{vehicle.number}</p>
                  <p className="text-[11px] text-slate-500">{vehicle.address || 'No address'}</p>
                </div>
                <Navigation className="h-4 w-4 text-emerald-600" />
              </div>
              <div className="flex items-center justify-between mt-2 text-xs text-slate-600">
                <span className={`px-2 py-1 rounded-full border ${statusColor[vehicle.status] || statusColor.stopped}`}>
                  {vehicle.statusText || vehicle.status}
                </span>
                <span>{vehicle.speed || 0} km/h</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Updated {vehicle.lastUpdated}</div>
            </button>
          ))}
        </div>
      </aside>
    </div>
  );
}
