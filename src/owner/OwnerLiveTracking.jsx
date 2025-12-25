import { useEffect, useRef, useState } from 'react';
import { getOwnerLatestTelemetry } from '../services/api.js';
import { MapPin, Car, Clock, Activity, Eye, EyeOff, Play, Pause } from 'lucide-react';

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

      try {
        mapInstance.current = new window.mappls.Map('owner-live-tracking-map', {
          center: [20.5937, 78.9629], // Center of India
          zoom: 5,
        });
        mapInitialized.current = true;
        setMapError('');
        console.log('Owner map initialized successfully');
      } catch (error) {
        console.error('Owner map initialization error:', error);
        setMapError('Failed to initialize map: ' + error.message);
      }
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
        console.log('Owner processing vehicle:', v.id, v.number, 'lat:', v.lat, 'lng:', v.lng, 'status:', v.status);
        if (!v.lat || !v.lng) {
          console.warn('Owner vehicle missing coordinates:', v.id, v.number);
          return;
        }

        hasValidVehicles = true;
        bounds.push([v.lat, v.lng]);

        const color =
          v.status === 'moving'
            ? '#27AE60'
            : v.status === 'idling'
            ? '#F2B233'
            : '#E53935';

        try {
          const marker = new window.mappls.Marker({
            map: mapInstance.current,
            position: { lat: v.lat, lng: v.lng },
          });

          const popupContent = `
            <div style="font-size:12px; padding: 8px; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
              <strong style="color: #2A3547;">🚚 ${v.number}</strong><br/>
              <span style="color: ${color};">●</span> Status: ${v.status}<br/>
              Speed: ${v.speed} km/h<br/>
              Today: ${v.today_km} km<br/>
              Total: ${v.total_km} km<br/>
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
            mapInstance.current.setCenter(bounds[0], 14);
          } else {
            const minLat = Math.min(...bounds.map(b => b[0]));
            const maxLat = Math.max(...bounds.map(b => b[0]));
            const minLng = Math.min(...bounds.map(b => b[1]));
            const maxLng = Math.max(...bounds.map(b => b[1]));

            const latPadding = (maxLat - minLat) * 0.1;
            const lngPadding = (maxLng - minLng) * 0.1;

            const boundsArray = [
              [minLat - latPadding, minLng - lngPadding],
              [maxLat + latPadding, maxLng + lngPadding]
            ];

            if (typeof mapInstance.current.fitBounds === 'function') {
              mapInstance.current.fitBounds(boundsArray);
            } else {
              mapInstance.current.setCenter(bounds[0], 10);
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

  /* =========================
     TOGGLE AUTO REFRESH
  ========================= */
  const toggleAutoRefresh = () => {
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="space-y-4">
      {/* HEADER */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-lg sm:text-xl font-semibold tracking-tight text-foreground">
            Live Vehicle Tracking
          </h1>
          <p className="text-sm text-muted-foreground">Monitor your fleet in real-time</p>
        </div>

        <button
          type="button"
          onClick={toggleAutoRefresh}
          aria-pressed={!isPlaying}
          className={`inline-flex items-center gap-2 h-11 px-4 rounded-md border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            isPlaying
              ? 'border-border bg-card hover:bg-accent'
              : 'border-border bg-muted/40 hover:bg-accent'
          }`}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          <span className="text-sm font-medium">
            {isPlaying ? 'Pause' : 'Resume'}
          </span>
        </button>
      </div>

      {/* STATUS FILTERS */}
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => setStatusFilter('all')}
          className={`h-11 px-4 rounded-md text-sm font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            statusFilter === 'all'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          All Vehicles ({statusCounts.total})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('moving')}
          className={`h-11 px-4 rounded-md text-sm font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            statusFilter === 'moving'
              ? 'bg-success text-success-foreground border-success'
              : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          Moving ({statusCounts.moving})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('idling')}
          className={`h-11 px-4 rounded-md text-sm font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            statusFilter === 'idling'
              ? 'bg-warning text-warning-foreground border-warning'
              : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          Idling ({statusCounts.idling})
        </button>
        <button
          type="button"
          onClick={() => setStatusFilter('stopped')}
          className={`h-11 px-4 rounded-md text-sm font-medium transition-colors border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background ${
            statusFilter === 'stopped'
              ? 'bg-destructive text-destructive-foreground border-destructive'
              : 'bg-card text-muted-foreground border-border hover:bg-accent hover:text-accent-foreground'
          }`}
        >
          Stopped ({statusCounts.stopped})
        </button>
      </div>

      {/* MAP CONTAINER */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        {mapError && (
          <div className="p-4 bg-destructive/10 border-b border-border">
            <p className="text-destructive text-sm">{mapError}</p>
          </div>
        )}
        <div
          id="owner-live-tracking-map"
          ref={mapRef}
          className="w-full h-[60svh] min-h-[360px] sm:h-[65svh] lg:h-[72svh] max-h-[820px]"
        />
      </div>

      {/* VEHICLE DETAILS POPUP */}
      {showPopup && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-label="Vehicle details">
          <div className="bg-card rounded-xl border border-border p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-foreground">Vehicle Details</h3>

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
              <button
                type="button"
                onClick={() => setShowPopup(false)}
                className="flex-1 h-11 px-4 rounded-md border border-border bg-muted/40 text-foreground hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}