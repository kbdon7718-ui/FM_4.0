import { useEffect, useRef, useState } from 'react';
import { getLatestTelemetry } from '../services/api.js';
import { MapPin, Car, Clock, Wrench, Activity, Eye, EyeOff } from 'lucide-react';

const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";
const API_BASE_URL = BASE_URL.endsWith("/api") ? BASE_URL : `${BASE_URL}/api`;

/* =========================
   LIVE TRACKING (SUPERVISOR)
========================= */
export function LiveTracking() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);
  const mapInitialized = useRef(false);
const autoCenterRef = useRef(true);

  const [vehicles, setVehicles] = useState([]);
  const [filteredVehicles, setFilteredVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [showPopup, setShowPopup] = useState(false);
  const [mapError, setMapError] = useState('');



  /* =========================
     INIT MAP
  ========================= */
useEffect(() => {
  const initMap = () => {
    if (!window.mappls) {
      setMapError('Mappls SDK not loaded. Please refresh the page.');
      return;
    }

    if (mapInstance.current) return;

    mapInstance.current = new window.mappls.Map('live-tracking-map', {
      zoom: 5,
    });

    mapInstance.current.addListener('dragstart', () => {
      autoCenterRef.current = false;
    });

    mapInstance.current.addListener('zoomstart', () => {
      autoCenterRef.current = false;
    });

    mapInitialized.current = true;

    setTimeout(() => {
      try {
        mapInstance.current?.resize?.();
      } catch {}
    }, 0);
  };

  const timer = setTimeout(initMap, 500);
  return () => clearTimeout(timer);
}, []);

  /* =========================
     FETCH VEHICLE DATA
  ========================= */
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getLatestTelemetry();
        console.log('Fetched vehicles:', data);
        setVehicles(data || []);
      } catch (error) {
        console.error('Error fetching vehicle data:', error);
      }
    };

    load();
    const i = setInterval(load, 2000);

    return () => clearInterval(i);
  }, []);

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


useEffect(() => {
  vehicles.forEach((v) => {
    fetch(
      `${API_BASE_URL}/supervisor/vehicle-distance?vehicle_id=${v.id}`,
      { headers: { 'x-role': 'SUPERVISOR' } }
    )
      .then(res => res.json())
      .then(data => {
        setVehicles(prev =>
          prev.map(p =>
            p.id === v.id
              ? { ...p, today_km: data.distance_km }
              : p
          )
        );
      });
  });
}, [vehicles.length]);


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
        console.log('Processing vehicle:', v.id, v.number, 'lat:', v.lat, 'lng:', v.lng, 'status:', v.status);
        if (!v.lat || !v.lng) {
          console.warn('Vehicle missing coordinates:', v.id, v.number);
          return;
        }

        hasValidVehicles = true;
        bounds.push([v.lat, v.lng]); // Mappls may expect [lng, lat] for bounds
        console.log('Added to bounds:', [v.lat, v.lng]);

        const color =
          v.status === 'moving'
            ? 'green'
            : v.status === 'idling'
            ? 'orange'
            : 'red';

        try {
          // Create marker with default styling first
          const marker = new window.mappls.Marker({
  map: mapInstance.current,
  position: { lat: v.lat, lng: v.lng },
  html: `
    <div style="
      width:18px;
      height:18px;
      border-radius:50%;
      background:${v.status === 'moving' ? '#16a34a' : v.status === 'idling' ? '#f59e0b' : '#dc2626'};
      box-shadow: 0 0 10px rgba(0,0,0,0.4);
      border:2px solid white;
    "></div>
  `,
  offset: [0, 0],
});


          // Try to add popup with vehicle info
          const popupContent = `
            <div style="font-size:12px; padding: 8px;">
              <strong>🚚 ${v.number}</strong><br/>
              Status: ${v.status}<br/>
              Speed: ${v.speed} km/h<br/>
              Today: ${v.today_km} km
            </div>
          `;

          if (typeof marker.setPopup === 'function') {
            marker.setPopup(popupContent);
          }

          marker.addListener('click', () => {
            handleVehicleClick(v);
          });

          markersRef.current.push(marker);
          console.log('Created marker for vehicle:', v.id, v.number);
        } catch (markerError) {
          console.error('Error creating marker for vehicle:', v.id, markerError);
        }
      });

      // Fit bounds to show all vehicles
      if (hasValidVehicles && bounds.length > 0) {
        try {
          console.log('Fitting bounds for', bounds.length, 'vehicles, bounds:', bounds);
          if (bounds.length === 1) {
            // Single vehicle - zoom in closer
            mapInstance.current.setCenter([bounds[0][1], bounds[0][0]], 14); // [lat, lng]
          } else {
            // Multiple vehicles - fit bounds
            const minLng = Math.min(...bounds.map(b => b[0]));
            const maxLng = Math.max(...bounds.map(b => b[0]));
            const minLat = Math.min(...bounds.map(b => b[1]));
            const maxLat = Math.max(...bounds.map(b => b[1]));

            // Add some padding
            const latPadding = (maxLat - minLat) * 0.1;
            const lngPadding = (maxLng - minLng) * 0.1;

            const boundsArray = [
              [minLng - lngPadding, minLat - latPadding],
              [maxLng + lngPadding, maxLat + latPadding]
            ];

            console.log('Calculated bounds array:', boundsArray);

            // Try to fit bounds if the method exists
            if (typeof mapInstance.current.fitBounds === 'function') {
              mapInstance.current.fitBounds(boundsArray);
              console.log('Called fitBounds with:', boundsArray);
            } else {
              // Fallback to center on the first vehicle
              mapInstance.current.setCenter([bounds[0][1], bounds[0][0]], 10);
              console.log('Fallback: set center to:', [bounds[0][1], bounds[0][0]]);
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

    // Fetch additional details
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

  /* =========================
     FOCUS SELECTED VEHICLE
  ========================= */
  useEffect(() => {
    if (selectedVehicle?.lat && selectedVehicle?.lng && mapInstance.current && mapInitialized.current) {
      try {
      //  mapInstance.current.setCenter([selectedVehicle.lat, selectedVehicle.lng], 14);
      } catch (error) {
        console.error('Error focusing on vehicle:', error);
      }
    }
  }, [selectedVehicle]);

  /* =========================
     CLEANUP
  ========================= */
  useEffect(() => {
    return () => {
      // Clean up markers
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

      // Clean up map instance
      if (mapInstance.current) {
        try {
          // Mappls doesn't have a destroy method, but we can set it to null
          mapInstance.current = null;
        } catch (error) {
          console.error('Error cleaning up map:', error);
        }
      }
      mapInitialized.current = false;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-0 w-full">
      {/* ================= STATUS DASHBOARD ================= */}
      <section className="rounded-xl border border-border bg-card shadow-sm">
        <div className="p-4 sm:p-5">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h2 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground truncate">
                  Live Vehicle Tracking
                </h2>
                <p className="text-xs text-muted-foreground">Real-time location and status</p>
              </div>
              <div className="text-xs text-muted-foreground shrink-0 lg:hidden tabular-nums">
                Last updated: {new Date().toLocaleTimeString()}
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="flex gap-2 min-w-max">
                <button
                  type="button"
                  aria-pressed={statusFilter === 'all'}
                  onClick={() => setStatusFilter('all')}
                  className={`inline-flex items-center justify-center h-11 px-4 rounded-md text-sm font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    statusFilter === 'all'
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  All ({statusCounts.total})
                </button>

                <button
                  type="button"
                  aria-pressed={statusFilter === 'moving'}
                  onClick={() => setStatusFilter('moving')}
                  className={`inline-flex items-center justify-center h-11 px-4 rounded-md text-sm font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    statusFilter === 'moving'
                      ? 'bg-success text-success-foreground border-success'
                      : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Moving ({statusCounts.moving})
                </button>

                <button
                  type="button"
                  aria-pressed={statusFilter === 'idling'}
                  onClick={() => setStatusFilter('idling')}
                  className={`inline-flex items-center justify-center h-11 px-4 rounded-md text-sm font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    statusFilter === 'idling'
                      ? 'bg-warning text-warning-foreground border-warning'
                      : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Idling ({statusCounts.idling})
                </button>

                <button
                  type="button"
                  aria-pressed={statusFilter === 'stopped'}
                  onClick={() => setStatusFilter('stopped')}
                  className={`inline-flex items-center justify-center h-11 px-4 rounded-md text-sm font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                    statusFilter === 'stopped'
                      ? 'bg-destructive text-destructive-foreground border-destructive'
                      : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  Stopped ({statusCounts.stopped})
                </button>
              </div>
            </div>

            <div className="hidden lg:block text-xs text-muted-foreground shrink-0 tabular-nums">
              Last updated: {new Date().toLocaleTimeString()}
            </div>
          </div>
        </div>
      </section>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row gap-4 mt-4">
        {/* ================= MAP ================= */}
        <section className="relative flex flex-col min-h-0 flex-1">
          <div className="relative rounded-xl border border-border bg-card overflow-hidden">
            {mapError ? (
              <div
                className="w-full h-[60svh] min-h-[360px] sm:h-[65svh] lg:h-[72svh] max-h-[820px] flex items-center justify-center bg-muted/30"
                style={{ height: '65vh', minHeight: 420, maxHeight: 900 }}
              >
                <div className="text-center px-6">
                  <div className="text-destructive text-base font-semibold mb-2">Map Error</div>
                  <div className="text-sm text-muted-foreground mb-4">{mapError}</div>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="inline-flex items-center justify-center h-11 px-4 rounded-md bg-primary text-primary-foreground text-sm font-medium shadow-sm hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    Refresh Page
                  </button>
                </div>
              </div>
            ) : (
              <div
                ref={mapRef}
                id="live-tracking-map"
                className="w-full h-[60svh] min-h-[360px] sm:h-[65svh] lg:h-[72svh] max-h-[820px]"
                style={{ height: '65vh', minHeight: 420, maxHeight: 900 }}
              />
            )}

            {/* Map Legend - only show if no error */}
            {!mapError && (
              <div className="absolute top-3 left-3 sm:top-4 sm:left-4 bg-card/95 backdrop-blur p-3 rounded-lg shadow-lg border border-border">
                <h4 className="text-sm font-medium text-foreground mb-2">Legend</h4>
                <div className="space-y-1 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-success rounded"></div>
                    <span>Moving</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-warning rounded"></div>
                    <span>Idling</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-destructive rounded"></div>
                    <span>Stopped</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* ================= RIGHT SIDEBAR ================= */}
        <aside className="w-full lg:w-80 lg:shrink-0 rounded-xl border border-border bg-card shadow-sm lg:h-[72svh] lg:max-h-[820px] overflow-visible lg:overflow-y-auto">
          <div className="p-4 border-b border-border bg-muted/30 backdrop-blur sticky top-0 z-10">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Vehicles</p>
                <p className="text-sm font-semibold text-foreground tabular-nums">
                  {filteredVehicles.length}
                </p>
              </div>
            </div>
          </div>

          <div className="divide-y divide-border">
            {filteredVehicles.map((vehicle) => (
              <button
                key={vehicle.id}
                type="button"
                onClick={() => handleVehicleClick(vehicle)}
                className={`w-full text-left p-4 hover:bg-accent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
                  selectedVehicle?.id === vehicle.id
                    ? 'bg-accent ring-1 ring-inset ring-border'
                    : ''
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <Car size={16} className="text-muted-foreground shrink-0" />
                    <span className="font-medium text-foreground truncate">{vehicle.number}</span>
                  </div>
                  <div
                    className={`shrink-0 px-2 py-1 rounded-full text-xs font-medium capitalize ${
                      vehicle.status === 'moving'
                        ? 'bg-success-muted text-success border border-success-muted'
                        : vehicle.status === 'idling'
                        ? 'bg-warning-muted text-warning border border-warning-muted'
                        : 'bg-destructive-muted text-destructive border border-destructive-muted'
                    }`}
                  >
                    {vehicle.status}
                  </div>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Activity size={14} className="text-muted-foreground" />
                    <span className="tabular-nums">{vehicle.speed} km/h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} className="text-muted-foreground" />
                    <span className="tabular-nums">
                      {vehicle.lat?.toFixed(4)}, {vehicle.lng?.toFixed(4)}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} className="text-muted-foreground" />
                    <span className="tabular-nums">Today: {vehicle.today_km} km</span>
                  </div>
                </div>
              </button>
            ))}
          </div>

          {filteredVehicles.length === 0 && (
            <div className="p-10 text-center text-muted-foreground">
              <Car size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-sm font-medium text-foreground">No vehicles found</p>
              <p className="text-sm text-muted-foreground">Try changing the status filter</p>
            </div>
          )}
        </aside>
      </div>

      {/* ================= VEHICLE DETAIL POPUP ================= */}
      {showPopup && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 z-50 p-4 overflow-y-auto" role="dialog" aria-modal="true">
          <div className="mx-auto my-8 bg-card rounded-xl border border-border shadow-xl max-w-md w-full max-h-[90svh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">Vehicle</p>
                  <h3 className="text-xl font-semibold tracking-tight text-foreground flex items-center gap-2 truncate">
                    <Car size={20} className="shrink-0" />
                    {selectedVehicle.number}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="inline-flex items-center justify-center h-11 w-11 rounded-md text-muted-foreground hover:bg-accent hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  aria-label="Close"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div className="rounded-lg border border-border bg-muted/30 p-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">Status</span>
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${
                          selectedVehicle.status === 'moving'
                            ? 'bg-success-muted text-success border border-success-muted'
                            : selectedVehicle.status === 'idling'
                            ? 'bg-warning-muted text-warning border border-warning-muted'
                            : 'bg-destructive-muted text-destructive border border-destructive-muted'
                        }`}
                      >
                        {selectedVehicle.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">Current Speed</span>
                      <span className="text-sm font-medium text-foreground tabular-nums">
                        {selectedVehicle.speed} km/h
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">Distance Today</span>
                      <span className="text-sm font-medium text-foreground tabular-nums">
                        {selectedVehicle.today_km} km
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm text-muted-foreground">Total Distance</span>
                      <span className="text-sm font-medium text-foreground tabular-nums">
                        {selectedVehicle.total_km} km
                      </span>
                    </div>

                    <div className="flex items-start justify-between gap-3">
                      <span className="text-sm text-muted-foreground">Current Location</span>
                      <span className="text-sm font-medium text-foreground text-right tabular-nums">
                        {selectedVehicle.lat?.toFixed(4)},<br />
                        {selectedVehicle.lng?.toFixed(4)}
                      </span>
                    </div>
                  </div>
                </div>

                {vehicleDetails?.driver && (
                  <div className="border-t border-border pt-4">
                    <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                      <Eye size={16} className="text-muted-foreground" />
                      Driver Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Name</span>
                        <span className="font-medium text-foreground">{vehicleDetails.driver.driver_name}</span>
                      </div>
                      {vehicleDetails.driver.phone_number && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground">Phone</span>
                          <span className="font-medium text-foreground tabular-nums">{vehicleDetails.driver.phone_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {vehicleDetails?.lastMaintenance && (
                  <div className="border-t border-border pt-4">
                    <h4 className="text-sm font-medium uppercase tracking-wide text-muted-foreground mb-3 flex items-center gap-2">
                      <Wrench size={16} className="text-muted-foreground" />
                      Last Maintenance
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Type</span>
                        <span className="font-medium text-foreground">{vehicleDetails.lastMaintenance.maintenance_type}</span>
                      </div>
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-muted-foreground">Date</span>
                        <span className="font-medium text-foreground tabular-nums">
                          {new Date(vehicleDetails.lastMaintenance.service_date).toLocaleDateString()}
                        </span>
                      </div>
                      {vehicleDetails.lastMaintenance.category && (
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-muted-foreground">Category</span>
                          <span className="font-medium text-foreground">{vehicleDetails.lastMaintenance.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {(!vehicleDetails?.driver || !vehicleDetails?.lastMaintenance) && (
                  <div className="border-t border-border pt-4">
                    <div className="rounded-lg border border-warning-muted bg-warning-muted p-3 text-sm text-foreground space-y-2">
                      {!vehicleDetails?.driver && (
                        <p className="flex items-center gap-2">
                          <EyeOff size={14} />
                          No driver assigned
                        </p>
                      )}
                      {!vehicleDetails?.lastMaintenance && (
                        <p className="flex items-center gap-2">
                          <Wrench size={14} />
                          No maintenance records found
                        </p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
