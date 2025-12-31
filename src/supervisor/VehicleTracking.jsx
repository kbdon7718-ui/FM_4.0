import { useCallback, useEffect, useMemo, useState } from 'react';
import { MapPin, Navigation, RefreshCw, Clock3, Activity } from 'lucide-react';
import VehicleMap from '../components/map/VehicleMap.jsx';
import { getLatestTelemetry } from '../services/api.js';
import { Button } from '../components/ui/button.jsx';
import { PageHeader, PageHeaderTitle, PageHeaderDescription, PageHeaderActions } from '../components/ui/page-header.jsx';
import { SectionCard, SectionCardHeader, SectionCardContent } from '../components/ui/section-card.jsx';

const FALLBACK_VEHICLES = [
  { id: 'HR55AN2175', number: 'HR55AN2175', status: 'moving', statusText: 'Active', speed: 42, lat: 28.4595, lng: 77.0266, rotation: 90, address: 'Gurugram, HR', lastUpdated: 'just now' },
  { id: 'HR47E2573', number: 'HR47E2573', status: 'stopped', statusText: 'Stopped', speed: 0, lat: 28.4289, lng: 77.0319, rotation: 0, address: 'IFFCO Chowk, HR', lastUpdated: '2 min ago' },
  { id: 'UP32BN9021', number: 'UP32BN9021', status: 'idling', statusText: 'Idle', speed: 3, lat: 28.4744, lng: 77.504, rotation: 180, address: 'Greater Noida, UP', lastUpdated: '4 min ago' },
  { id: 'MP04CE7712', number: 'MP04CE7712', status: 'moving', statusText: 'Active', speed: 38, lat: 22.6243, lng: 75.5632, rotation: 45, address: 'Pithampur, MP', lastUpdated: '1 min ago' },
  { id: 'MH12RK5521', number: 'MH12RK5521', status: 'stopped', statusText: 'Stopped', speed: 0, lat: 18.6298, lng: 73.7997, rotation: 0, address: 'Pune, MH', lastUpdated: '6 min ago' },
];

const statusColor = {
  moving: 'text-success bg-success-muted border-success-muted',
  idling: 'text-warning bg-warning-muted border-warning-muted',
  stopped: 'text-destructive bg-destructive-muted border-destructive-muted',
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
    <div className="space-y-4">
      <PageHeader>
        <div className="min-w-0">
          <PageHeaderTitle>Vehicle Tracking</PageHeaderTitle>
          <PageHeaderDescription>Location, speed, and status in real time</PageHeaderDescription>
        </div>

        <PageHeaderActions>
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 h-9 text-xs text-muted-foreground">
            <Clock3 className="h-4 w-4 text-muted-foreground" />
            <span className="tabular-nums">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Updating...'}
            </span>
          </div>
          <Button
            variant="outline"
            onClick={fetchTelemetry}
            disabled={isLoading}
            size="icon"
            className="h-9 w-9"
            aria-label="Refresh telemetry"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px] h-[calc(100svh-168px)] min-h-[620px]">
        <SectionCard className="overflow-hidden flex flex-col">
          <SectionCardHeader title="Map" description="Click a marker to select a vehicle" />
          <SectionCardContent className="p-0 flex-1 min-h-0 relative">
            <VehicleMap
              vehicles={vehicles}
              selectedVehicleId={selectedVehicleId}
              onVehicleClick={(v) => setSelectedVehicleId(v.id)}
              center={[28.6139, 77.209]}
              zoom={6}
            />

            <div className="absolute bottom-3 left-3 sm:bottom-4 sm:left-4 z-20 bg-card/95 backdrop-blur-sm px-4 py-3 rounded-lg shadow-lg border border-border">
              <p className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <MapPin className="h-4 w-4 text-success" />
                Status
              </p>
              <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-success" />
                  <span className="tabular-nums">Moving ({summary.moving})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-warning" />
                  <span className="tabular-nums">Idle ({summary.idling})</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-destructive" />
                  <span className="tabular-nums">Stopped ({summary.stopped})</span>
                </div>
              </div>
            </div>

            {error && (
              <div className="absolute bottom-3 right-3 sm:bottom-4 sm:right-4 z-20 bg-warning-muted border border-warning-muted text-foreground text-sm px-4 py-3 rounded-lg shadow max-w-[18rem]">
                {error}
              </div>
            )}
          </SectionCardContent>
        </SectionCard>

        <SectionCard className="overflow-hidden flex flex-col">
          <SectionCardHeader
            title="Vehicles"
            description={`Total ${summary.total} • Moving ${summary.moving} • Idle ${summary.idling} • Stopped ${summary.stopped}`}
          />
          <SectionCardContent className="p-4 sm:p-5 flex-1 min-h-0 overflow-y-auto">
            <div className="space-y-3">
              {vehicles.map((vehicle) => (
                <button
                  key={vehicle.id}
                  type="button"
                  onClick={() => setSelectedVehicleId(vehicle.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    selectedVehicleId === vehicle.id
                      ? 'border-primary/30 bg-primary/10'
                      : 'border-border bg-card hover:bg-accent'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{vehicle.number}</p>
                      <p className="text-[11px] text-muted-foreground truncate">{vehicle.address || 'No address'}</p>
                    </div>
                    <Navigation className="h-4 w-4 text-success shrink-0" />
                  </div>
                  <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground gap-3">
                    <span className={`px-2 py-1 rounded-full border capitalize ${statusColor[vehicle.status] || statusColor.stopped}`}>
                      {vehicle.statusText || vehicle.status}
                    </span>
                    <span className="tabular-nums">{vehicle.speed || 0} km/h</span>
                  </div>
                  <div className="text-[11px] text-muted-foreground/70 mt-1 truncate">Updated {vehicle.lastUpdated}</div>
                </button>
              ))}
            </div>
          </SectionCardContent>
        </SectionCard>
      </div>
    </div>
  );
}
