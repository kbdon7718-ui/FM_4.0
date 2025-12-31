import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  RefreshCw,
  Clock3,
  Activity,
} from 'lucide-react';
import { Button } from '../components/ui/button.jsx';
import { PageHeader, PageHeaderTitle, PageHeaderDescription, PageHeaderActions } from '../components/ui/page-header.jsx';
import { SectionCard, SectionCardHeader, SectionCardContent } from '../components/ui/section-card.jsx';
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
  moving: 'bg-success-muted text-success border border-success-muted',
  idling: 'bg-warning-muted text-warning border border-warning-muted',
  stopped: 'bg-destructive-muted text-destructive border border-destructive-muted',
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
    <div className="space-y-4">
      <PageHeader>
        <div className="min-w-0">
          <PageHeaderTitle>Live Vehicle Monitoring</PageHeaderTitle>
          <PageHeaderDescription>Real-time operations overview</PageHeaderDescription>
        </div>

        <PageHeaderActions>
          <div className="inline-flex items-center gap-2 rounded-md border border-border bg-card px-3 h-9 text-xs text-muted-foreground">
            <Clock3 className="h-4 w-4 text-muted-foreground" />
            <span className="tabular-nums">
              {lastUpdated ? lastUpdated.toLocaleTimeString() : 'Updating'}
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
        {/* MAP */}
        <SectionCard className="overflow-hidden flex flex-col">
          <SectionCardHeader title="Map" description="Click a marker to select a vehicle" />
          <SectionCardContent className="p-0 flex-1 min-h-0">
            <div className="h-full min-h-0">
              <VehicleMap
                vehicles={vehicles}
                selectedVehicleId={selectedVehicleId}
                onVehicleClick={(v) => setSelectedVehicleId(v.id)}
                center={[28.6139, 77.209]}
                zoom={6}
              />
            </div>
          </SectionCardContent>
        </SectionCard>

        {/* RIGHT PANEL */}
        <SectionCard className="overflow-hidden flex flex-col">
          <SectionCardHeader
            title="Live Vehicles"
            description={`Total ${summary.total} • Moving ${summary.moving} • Idling ${summary.idling} • Stopped ${summary.stopped}`}
          />
          <SectionCardContent className="p-4 sm:p-5 space-y-4 flex-1 min-h-0">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2">
              <Button
                className="h-11 w-full"
                onClick={() => onNavigate?.('fuel-entry')}
              >
                + Fuel Entry
              </Button>
              <Button
                variant="outline"
                className="h-11 w-full"
                onClick={() => onNavigate?.('maintenance')}
              >
                Maintenance
              </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto space-y-3 pr-1">
              {vehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => setSelectedVehicleId(v.id)}
                  className={`w-full text-left p-3 rounded-lg border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    selectedVehicleId === v.id
                      ? 'border-primary/30 bg-primary/10'
                      : 'border-border bg-card hover:bg-accent'
                  }`}
                >
                  <div className="flex justify-between items-start gap-3">
                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-foreground truncate">
                        {v.number}
                      </p>
                      <p className="text-xs text-muted-foreground truncate">
                        {v.address}
                      </p>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full capitalize shrink-0 ${
                        statusBadge[v.status]
                      }`}
                    >
                      {v.status}
                    </span>
                  </div>

                  <div className="mt-2 flex justify-between text-xs text-muted-foreground gap-3">
                    <span className="tabular-nums">Speed: {v.speed} km/h</span>
                    <span className="truncate">{v.lastUpdated}</span>
                  </div>
                </button>
              ))}
            </div>
          </SectionCardContent>
        </SectionCard>
      </div>
    </div>
  );
}
