import { useEffect, useRef, useState } from 'react';
import { getOwnerLatestTelemetry } from '../services/api.js';
import { MapPin, Car, Clock, Activity, Eye, EyeOff, Play, Pause } from 'lucide-react';
import { PageHeader, PageHeaderTitle, PageHeaderDescription, PageHeaderActions } from '../components/ui/page-header.jsx';
import { SectionCard, SectionCardContent, SectionCardHeader } from '../components/ui/section-card.jsx';
import { Button } from '../components/ui/button.jsx';
import { useMapplsSdk } from '../hooks/useMapplsSdk.js';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";
const API_BASE_URL = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

/* =========================
   OWNER LIVE TRACKING
========================= */
export function OwnerLiveTracking() {

  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const mapInitialized = useRef(false);

  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPopup, setShowPopup] = useState(false);
  const [mapError, setMapError] = useState('');
  const [isPlaying, setIsPlaying] = useState(true);

  const { ready: mapplsReady, error: mapplsError } = useMapplsSdk({ timeoutMs: 10000 });

  useEffect(() => {
    if (mapplsError) setMapError(mapplsError);
  }, [mapplsError]);

  /* =========================
     INIT MAP
  ========================= */
  useEffect(() => {
    if (!mapplsReady) return;

    const initMap = () => {
      if (!window.mappls) {
        setMapError('Mappls SDK not loaded. Please refresh the page.');
        return;
      }

      if (mapInstance.current) return;

      try {
        mapInstance.current = new window.mappls.Map('owner-live-tracking-map', {
          center: { lat: 20.5937, lng: 78.9629 }, // Center of India
          zoom: 5,
        });
        mapInitialized.current = true;
        setMapError('');

        setTimeout(() => {
          try {
            mapInstance.current?.resize?.();
          } catch {}
        }, 0);
        console.log('Owner map initialized successfully');
      } catch (error) {
        console.error('Owner map initialization error:', error);
        setMapError('Failed to initialize map: ' + error.message);
      }
    };

    const timer = setTimeout(initMap, 500);
    return () => clearTimeout(timer);
  }, [mapplsReady]);

  /* =========================
     FETCH VEHICLE DATA
  ========================= */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getOwnerLatestTelemetry();
        console.log('Owner fetched vehicles:', data);
        setVehicles(data || []);
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      }
    };

    load();
    if (!isPlaying) return;

    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, [isPlaying]);

  /* =========================
     FILTER VEHICLES
  ========================= */
  useEffect(() => {
    if (statusFilter === 'all') {
      setFilteredVehicles(vehicles);
    } else {
      setFilteredVehicles(vehicles.filter(v => v.status === statusFilter));
    }
  }, [vehicles, statusFilter]);

  /* =========================
     UPDATE MARKERS AND BOUNDS
  ========================= */
  useEffect(() => {
    if (!mapInitialized.current || !mapInstance.current || !window.mappls) return;

    try {
      // Clear old markers
      markersRef.current.forEach((m) => {
        if (m && typeof m.remove === 'function') {
          try {
            m.remove();
          } catch (error) {
            console.error('Error removing marker:', error);
          }
        }
      });
      markersRef.current = [];

      if (filteredVehicles.length === 0) return;

      // Create markers and collect bounds
      const bounds = [];
      let hasValidVehicles = false;

      filteredVehicles.forEach((v) => {
        const lat = Number(v.lat);
        const lng = Number(v.lng);
        console.log('Owner processing vehicle:', v.id, v.number, 'lat:', lat, 'lng:', lng, 'status:', v.status);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
          console.warn('Owner vehicle missing/invalid coordinates:', v.id, v.number);
          return;
        }

        hasValidVehicles = true;
        bounds.push([lng, lat]);

        const color =
          v.status === 'moving'
            ? '#27AE60'
            : v.status === 'idling'
            ? '#F2B233'
            : '#E53935';

        try {
          const marker = new window.mappls.Marker({
            map: mapInstance.current,
            position: { lat, lng },
          });

          const popupContent = `
            <div style="font-size:12px; padding: 8px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <strong style="color: #2A3547;">🚚 ${v.number}</strong><br/>
              <span style="color: ${color};">●</span> Status: ${v.status}<br/>
              Speed: ${v.speed} km/h<br/>
              Today: ${v.today_km} km<br/>
              Total: ${Number(v.total_km || 0)} km<br/>
              <small style="color: #67727E;">${new Date(v.lastUpdated).toLocaleString()}</small>
            </div>
          `;

          if (typeof marker.setPopup === 'function') {
            marker.setPopup(popupContent);
          }

          marker.addListener('click', () => {
            handleVehicleClick(v);
          });

          markersRef.current.push(marker);
          console.log('Owner created marker for vehicle:', v.id, v.number);
        } catch (markerError) {
          console.error('Error creating marker for vehicle:', v.id, markerError);
        }
      });

      // Fit bounds to show all vehicles
      if (hasValidVehicles && bounds.length > 0) {
        try {
          if (bounds.length === 1) {
            mapInstance.current.setCenter({ lat: bounds[0][1], lng: bounds[0][0] });
            mapInstance.current.setZoom(14);
          } else {
            if (window.mappls && typeof window.mappls.fitBounds === 'function') {
              new window.mappls.fitBounds({
                map: mapInstance.current,
                cType: 0,
                bounds,
                options: { padding: 120, duration: 1000 },
              });
            } else {
              mapInstance.current.setCenter({ lat: bounds[0][1], lng: bounds[0][0] });
              mapInstance.current.setZoom(10);
            }
          }
        } catch (boundsError) {
          console.error('Error setting map bounds:', boundsError);
        }
      }
    } catch (error) {
      console.error('Error updating markers and bounds:', error);
    }
  }, [filteredVehicles]);

  /* =========================
     VEHICLE STATUS COUNTS
  ========================= */
  const getStatusCounts = () => {
    const counts = { moving: 0, idling: 0, stopped: 0, total: vehicles.length };
    vehicles.forEach(v => {
      counts[v.status] = (counts[v.status] || 0) + 1;
    });
    return counts;
  };

  const statusCounts = getStatusCounts();

  /* =========================
     HANDLE VEHICLE CLICK
  ========================= */
  const handleVehicleClick = async (vehicle) => {
    setSelectedVehicle(vehicle);

    try {
      const [driverRes, maintenanceRes] = await Promise.all([
        fetch(`${API_BASE_URL}/assign-driver/current`),
        fetch(`${API_BASE_URL}/maintenance/recent?vehicle_id=${vehicle.id}`)
      ]);

      const driverData = driverRes.ok ? await driverRes.json() : [];
      const maintenanceData = maintenanceRes.ok ? await maintenanceRes.json() : [];

      const currentDriver = driverData.find(d => d.vehicle_id === vehicle.id);
      const lastMaintenance = maintenanceData
        .filter(m => m.vehicle_id === vehicle.id)
        .sort((a, b) => new Date(b.service_date) - new Date(a.service_date))[0];

      setVehicleDetails({
        driver: currentDriver,
        lastMaintenance
      });
      setShowPopup(true);
    } catch (error) {
      console.error('Error fetching vehicle details:', error);
      setVehicleDetails(null);
      setShowPopup(true);
    }
  };

  useEffect(() => {
    if (!mapInstance.current || !mapInitialized.current) return;

    const lat = Number(selectedVehicle?.lat);
    const lng = Number(selectedVehicle?.lng);
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    try {
      mapInstance.current.setCenter({ lat, lng });
      mapInstance.current.setZoom(14);
    } catch (error) {
      console.error('Error focusing on vehicle:', error);
    }
  }, [selectedVehicle]);

  /* =========================
     TOGGLE AUTO REFRESH
  ========================= */
  const toggleAutoRefresh = () => {
    setIsPlaying(!isPlaying);
  };

  const getStatusBadge = (status) => {
    if (status === 'moving') return { dot: 'bg-success', text: 'text-success' };
    if (status === 'idling') return { dot: 'bg-warning', text: 'text-warning' };
    return { dot: 'bg-destructive', text: 'text-destructive' };
  };

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <PageHeader>
        <div className="min-w-0">
          <PageHeaderTitle>Live Vehicle Tracking</PageHeaderTitle>
          <PageHeaderDescription>Monitor your fleet in real-time</PageHeaderDescription>
        </div>

        <PageHeaderActions>
          <Button
            type="button"
            onClick={toggleAutoRefresh}
            aria-pressed={!isPlaying}
            variant={isPlaying ? 'default' : 'outline'}
            className={isPlaying ? '' : 'bg-card'}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            <span className="text-sm font-medium">{isPlaying ? 'Pause' : 'Resume'}</span>
          </Button>
        </PageHeaderActions>
      </PageHeader>

      <div className="grid gap-4 lg:grid-cols-[1fr_380px] h-[calc(100svh-168px)] min-h-[620px]">
        {/* MAP */}
        <SectionCard className="overflow-hidden flex flex-col">
          {mapError && (
            <div className="p-4 bg-destructive/10 border-b border-border">
              <p className="text-destructive text-sm">{mapError}</p>
            </div>
          )}
          <div className="flex-1 min-h-0">
            <div
              id="owner-live-tracking-map"
              ref={mapRef}
              className="w-full h-full"
            />
          </div>
        </SectionCard>

        {/* RIGHT SIDEBAR */}
        <SectionCard className="overflow-hidden flex flex-col">
          <SectionCardHeader
            title="Vehicles"
            description="Click a vehicle to focus and open details"
          />
          <SectionCardContent className="p-4 sm:p-5 space-y-4 flex-1 min-h-0">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => setStatusFilter('all')}
                variant={statusFilter === 'all' ? 'default' : 'outline'}
                size="sm"
              >
                All ({statusCounts.total})
              </Button>
              <Button
                type="button"
                onClick={() => setStatusFilter('moving')}
                variant={statusFilter === 'moving' ? 'default' : 'outline'}
                size="sm"
                className={
                  statusFilter === 'moving'
                    ? 'bg-success text-success-foreground hover:bg-success/90'
                    : ''
                }
              >
                Moving ({statusCounts.moving})
              </Button>
              <Button
                type="button"
                onClick={() => setStatusFilter('idling')}
                variant={statusFilter === 'idling' ? 'default' : 'outline'}
                size="sm"
                className={
                  statusFilter === 'idling'
                    ? 'bg-warning text-warning-foreground hover:bg-warning/90'
                    : ''
                }
              >
                Idling ({statusCounts.idling})
              </Button>
              <Button
                type="button"
                onClick={() => setStatusFilter('stopped')}
                variant={statusFilter === 'stopped' ? 'destructive' : 'outline'}
                size="sm"
              >
                Stopped ({statusCounts.stopped})
              </Button>
            </div>

            <div className="flex-1 min-h-0 overflow-y-auto pr-1 space-y-2">
              {filteredVehicles.length === 0 ? (
                <div className="text-sm text-muted-foreground">No vehicles found for this filter.</div>
              ) : (
                filteredVehicles.map((v) => {
                  const badge = getStatusBadge(v.status);

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => handleVehicleClick(v)}
                      className="w-full rounded-lg border border-border bg-card px-3 py-3 text-left hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full ${badge.dot}`} />
                            <div className="font-medium text-foreground truncate">{v.number}</div>
                          </div>
                          <div className="mt-1 text-xs text-muted-foreground">
                            Speed: {v.speed} km/h
                            <span className="px-2">•</span>
                            Today: {v.today_km} km
                          </div>
                        </div>

                        <div className={`text-xs font-medium ${badge.text}`}>{v.status}</div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </SectionCardContent>
        </SectionCard>
      </div>

      {/* VEHICLE DETAILS POPUP */}
      {showPopup && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Vehicle details">
          <SectionCard className="max-w-md w-full">
            <SectionCardHeader title="Vehicle Details" description={selectedVehicle?.number ? `# ${selectedVehicle.number}` : undefined} />
            <SectionCardContent className="p-6">
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-muted-foreground">Vehicle Number</p>
                  <p className="font-medium text-foreground">{selectedVehicle.number}</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Status</p>
                  <p className={`font-medium ${
                    selectedVehicle.status === 'moving' ? 'text-success' :
                    selectedVehicle.status === 'idling' ? 'text-warning' : 'text-destructive'
                  }`}>
                    {selectedVehicle.status}
                  </p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Current Speed</p>
                  <p className="font-medium text-foreground">{selectedVehicle.speed} km/h</p>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Today's Distance</p>
                  <p className="font-medium text-foreground">{selectedVehicle.today_km} km</p>
                </div>

                {vehicleDetails?.driver && (
                  <div>
                    <p className="text-sm text-muted-foreground">Current Driver</p>
                    <p className="font-medium text-foreground">{vehicleDetails.driver.driver_name}</p>
                  </div>
                )}

                {vehicleDetails?.lastMaintenance && (
                  <div>
                    <p className="text-sm text-muted-foreground">Last Maintenance</p>
                    <p className="font-medium text-foreground">
                      {new Date(vehicleDetails.lastMaintenance.service_date).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  variant="outline"
                  className="flex-1"
                >
                  Close
                </Button>
              </div>
            </SectionCardContent>
          </SectionCard>
        </div>
      )}
    </div>
  );
}