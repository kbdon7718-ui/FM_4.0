import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin, Navigation, RefreshCw, Clock3, Activity, Gauge, AlertTriangle, ShieldCheck, AlertCircle, Flag } from 'lucide-react';
import VehicleMap from '../map/VehicleMap.jsx';
import { getLatestTelemetry } from '../../services/api.js';

const FALLBACK_VEHICLES = [
  { id: 'HR55AN2175', number: 'HR55AN2175', status: 'moving', statusText: 'Active', speed: 42, lat: 28.4595, lng: 77.0266, rotation: 90, address: 'Gurugram, HR', lastUpdated: 'just now' },
  { id: 'HR47E2573', number: 'HR47E2573', status: 'stopped', statusText: 'Stopped', speed: 0, lat: 28.4289, lng: 77.0319, rotation: 0, address: 'IFFCO Chowk, HR', lastUpdated: '2 min ago' },
  { id: 'UP32BN9021', number: 'UP32BN9021', status: 'idling', statusText: 'Idle', speed: 3, lat: 28.4744, lng: 77.504, rotation: 180, address: 'Greater Noida, UP', lastUpdated: '4 min ago' },
  { id: 'MP04CE7712', number: 'MP04CE7712', status: 'moving', statusText: 'Active', speed: 38, lat: 22.6243, lng: 75.5632, rotation: 45, address: 'Pithampur, MP', lastUpdated: '1 min ago' },
  { id: 'MH12RK5521', number: 'MH12RK5521', status: 'offline', statusText: 'Offline', speed: 0, lat: 18.6298, lng: 73.7997, rotation: 0, address: 'Pune, MH', lastUpdated: '18 min ago' },
];

function mapTelemetryPayload(payload = []) {
  const now = Date.now();

  return payload
    .map((item, index) => {
      const lat = Number(item.latitude ?? item.lat);
      const lng = Number(item.longitude ?? item.lng);
      if (Number.isNaN(lat) || Number.isNaN(lng)) return null;

      const speed = Number(item.speed ?? 0);
      const updatedAt = item.updatedAt ? new Date(item.updatedAt).getTime() : now;
      const minutesSinceUpdate = (now - updatedAt) / 60000;

      const geofenceActive = Boolean(item.geofenceActive || item.geofence?.active);
      const isUnsubscribed = item.status === 'unsubscribed';
      const isOffline = minutesSinceUpdate > 10 || item.status === 'offline';

      let status = item.status || (speed > 1 ? 'moving' : speed === 0 ? 'stopped' : 'idling');
      if (isUnsubscribed) status = 'unsubscribed';
      else if (isOffline) status = 'offline';

      return {
        id: item.vehicleId || item.id || `veh-${index}`,
        number: item.vehicleNumber || item.number || item.vehicleId || `Vehicle ${index + 1}`,
        manufacturer: item.manufacturer || item.make,
        status,
        statusText: item.statusText || status,
        speed: Math.max(0, Math.round(speed)),
        lat,
        lng,
        rotation: item.heading || item.bearing || 0,
        address: item.location || item.address || 'No address',
        lastUpdated: updatedAt ? new Date(updatedAt).toLocaleTimeString() : 'just now',
        geofenceActive,
        unsubscribed: isUnsubscribed,
      };
    })
    .filter(Boolean);
}

const statusClasses = {
  moving: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  idling: 'bg-amber-50 text-amber-700 border-amber-200',
  stopped: 'bg-red-50 text-red-700 border-red-200',
  offline: 'bg-slate-50 text-slate-600 border-slate-200',
  unsubscribed: 'bg-purple-50 text-purple-700 border-purple-200',
  geofence: 'bg-blue-50 text-blue-700 border-blue-200',
};

export default function OwnerDashboard({ onNavigate }) {
  const [vehicles, setVehicles] = useState(FALLBACK_VEHICLES);
  const [selectedVehicleId, setSelectedVehicleId] = useState(FALLBACK_VEHICLES[0]?.id || '');
  const [statusFilter, setStatusFilter] = useState('all');
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

  const counts = useMemo(() => {
    const moving = vehicles.filter((v) => v.status === 'moving').length;
    const idling = vehicles.filter((v) => v.status === 'idling').length;
    const stopped = vehicles.filter((v) => v.status === 'stopped').length;
    const offline = vehicles.filter((v) => v.status === 'offline').length;
    const geofence = vehicles.filter((v) => v.geofenceActive).length;
    const unsubscribed = vehicles.filter((v) => v.status === 'unsubscribed').length;
    return { total: vehicles.length, moving, idling, stopped, offline, geofence, unsubscribed };
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    if (statusFilter === 'all') return vehicles;
    if (statusFilter === 'geofence') return vehicles.filter((v) => v.geofenceActive);
    return vehicles.filter((v) => v.status === statusFilter);
  }, [statusFilter, vehicles]);

  const selectedVehicle =
    filteredVehicles.find((v) => v.id === selectedVehicleId) ||
    vehicles.find((v) => v.id === selectedVehicleId) ||
    filteredVehicles[0];

  const filterButtons = [
    { key: 'all', label: 'All', count: counts.total },
    { key: 'moving', label: 'Moving', count: counts.moving },
    { key: 'idling', label: 'Idle', count: counts.idling },
    { key: 'stopped', label: 'Stopped', count: counts.stopped },
    { key: 'offline', label: 'Offline', count: counts.offline },
    { key: 'geofence', label: 'Geofence', count: counts.geofence },
    { key: 'unsubscribed', label: 'Unsubscribed', count: counts.unsubscribed },
  ];

  return (
    <div className="flex h-screen bg-slate-50">
      <div className="flex-1 relative">
        {/* Header */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white/95 backdrop-blur-sm px-6 py-4 rounded-xl shadow-lg flex items-center gap-3 border border-slate-100">
            <MapPin className="h-6 w-6 text-emerald-600" />
            <div>
              <p className="text-xs text-slate-500">Owner Dashboard</p>
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

        {/* Filter bar */}
        <div className="absolute top-24 left-1/2 -translate-x-1/2 z-20">
          <div className="bg-white/95 backdrop-blur-sm px-4 py-3 rounded-xl shadow-lg flex items-center gap-2 border border-slate-100">
            {filterButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => {
                  setStatusFilter(btn.key);
                  if (btn.key === 'geofence' && onNavigate) onNavigate('vehicles');
                }}
                className={`px-3 py-2 rounded-lg text-xs border transition ${
                  statusFilter === btn.key
                    ? 'bg-slate-900 text-white border-slate-900'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{btn.count}</span>
                  <span className="text-[11px]">{btn.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Map */}
        <div className="absolute inset-0">
          <VehicleMap
            vehicles={filteredVehicles}
            selectedVehicleId={selectedVehicle?.id}
            onVehicleClick={(v) => setSelectedVehicleId(v.id)}
            center={[28.6139, 77.209]}
            zoom={6}
          />
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 left-6 z-20 bg-white/95 backdrop-blur-sm px-5 py-4 rounded-xl shadow-lg border border-slate-100">
          <h4 className="text-sm text-slate-900 mb-3">Live Fleet Status</h4>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-700">
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-emerald-500" /> Moving ({counts.moving})</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-amber-500" /> Idle ({counts.idling})</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-red-500" /> Stopped ({counts.stopped})</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-slate-400" /> Offline ({counts.offline})</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-blue-500" /> Geofence ({counts.geofence})</div>
            <div className="flex items-center gap-2"><span className="h-3 w-3 rounded-full bg-purple-500" /> Unsubscribed ({counts.unsubscribed})</div>
          </div>
        </div>

        {error && (
          <div className="absolute bottom-6 right-6 z-20 bg-amber-50 border border-amber-200 text-amber-800 text-xs px-4 py-3 rounded-lg shadow">
            {error}
          </div>
        )}
      </div>

      {/* Right rail */}
      <aside className="w-[360px] bg-white border-l border-slate-100 p-5 overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-xs text-slate-500">Fleet</p>
            <p className="text-lg font-semibold text-slate-900 flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-600" /> {counts.total} vehicles
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

        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="p-3 rounded-lg border border-emerald-100 bg-emerald-50 text-emerald-800 text-xs">
            <div className="flex items-center gap-2"><Gauge className="h-4 w-4" /> Moving</div>
            <div className="text-lg font-semibold">{counts.moving}</div>
          </div>
          <div className="p-3 rounded-lg border border-amber-100 bg-amber-50 text-amber-800 text-xs">
            <div className="flex items-center gap-2"><AlertTriangle className="h-4 w-4" /> Idle</div>
            <div className="text-lg font-semibold">{counts.idling}</div>
          </div>
          <div className="p-3 rounded-lg border border-red-100 bg-red-50 text-red-800 text-xs">
            <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4" /> Stopped</div>
            <div className="text-lg font-semibold">{counts.stopped}</div>
          </div>
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 text-slate-700 text-xs">
            <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Offline</div>
            <div className="text-lg font-semibold">{counts.offline}</div>
          </div>
        </div>

        <div className="space-y-3">
          {filteredVehicles.map((vehicle) => (
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
                <span className={`px-2 py-1 rounded-full border ${statusClasses[vehicle.status] || statusClasses.stopped}`}>
                  {vehicle.statusText || vehicle.status}
                </span>
                <span>{vehicle.speed || 0} km/h</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">Updated {vehicle.lastUpdated}</div>
            </button>
          ))}
        </div>

        {selectedVehicle && (
          <div className="mt-5 p-4 rounded-xl border border-slate-200 bg-slate-50">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-900">{selectedVehicle.number}</p>
              <span className={`px-2 py-1 rounded-full border text-xs ${statusClasses[selectedVehicle.status] || statusClasses.stopped}`}>
                {selectedVehicle.statusText || selectedVehicle.status}
              </span>
            </div>
            <p className="text-xs text-slate-500">{selectedVehicle.address}</p>
            <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-700">
              <div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-slate-500" />{selectedVehicle.speed} km/h</div>
              <div className="flex items-center gap-2"><Flag className="h-4 w-4 text-slate-500" />{selectedVehicle.geofenceActive ? 'Geofence Active' : 'No Geofence'}</div>
              <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-slate-500" />Updated {selectedVehicle.lastUpdated}</div>
              <div className="flex items-center gap-2"><AlertCircle className="h-4 w-4 text-slate-500" />{selectedVehicle.status}</div>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
}

export { OwnerDashboard };
