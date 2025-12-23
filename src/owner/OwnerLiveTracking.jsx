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
    const i = setInterval(load, isPlaying ? 5000 : 0);
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
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Vehicle Tracking</h1>
          <p className="text-slate-600">Monitor your fleet in real-time</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleAutoRefresh}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition ${
              isPlaying
                ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            {isPlaying ? 'Pause' : 'Resume'} Updates
          </button>
        </div>
      </div>

      {/* STATUS FILTERS */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={() => setStatusFilter('all')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            statusFilter === 'all'
              ? 'bg-slate-900 text-white'
              : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
          }`}
        >
          All Vehicles ({statusCounts.total})
        </button>
        <button
          onClick={() => setStatusFilter('moving')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            statusFilter === 'moving'
              ? 'bg-green-600 text-white'
              : 'bg-green-100 text-green-700 hover:bg-green-200'
          }`}
        >
          Moving ({statusCounts.moving})
        </button>
        <button
          onClick={() => setStatusFilter('idling')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            statusFilter === 'idling'
              ? 'bg-yellow-500 text-white'
              : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'
          }`}
        >
          Idling ({statusCounts.idling})
        </button>
        <button
          onClick={() => setStatusFilter('stopped')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
            statusFilter === 'stopped'
              ? 'bg-red-600 text-white'
              : 'bg-red-100 text-red-700 hover:bg-red-200'
          }`}
        >
          Stopped ({statusCounts.stopped})
        </button>
      </div>

      {/* MAP CONTAINER */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
        {mapError && (
          <div className="p-4 bg-red-50 border-b border-red-200">
            <p className="text-red-700 text-sm">{mapError}</p>
          </div>
        )}
        <div
          id="owner-live-tracking-map"
          ref={mapRef}
          className="w-full h-96"
          style={{ minHeight: '600px' }}
        />
      </div>

      {/* VEHICLE DETAILS POPUP */}
      {showPopup && selectedVehicle && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold mb-4">Vehicle Details</h3>

            <div className="space-y-3">
              <div>
                <p className="text-sm text-slate-600">Vehicle Number</p>
                <p className="font-medium">{selectedVehicle.number}</p>
              </div>

              <div>
                <p className="text-sm text-slate-600">Status</p>
                <p className={`font-medium ${
                  selectedVehicle.status === 'moving' ? 'text-green-600' :
                  selectedVehicle.status === 'idling' ? 'text-yellow-600' : 'text-red-600'
                }`}>
                  {selectedVehicle.status}
                </p>
              </div>

              <div>
                <p className="text-sm text-slate-600">Current Speed</p>
                <p className="font-medium">{selectedVehicle.speed} km/h</p>
              </div>

              <div>
                <p className="text-sm text-slate-600">Today's Distance</p>
                <p className="font-medium">{selectedVehicle.today_km} km</p>
              </div>

              {vehicleDetails?.driver && (
                <div>
                  <p className="text-sm text-slate-600">Current Driver</p>
                  <p className="font-medium">{vehicleDetails.driver.driver_name}</p>
                </div>
              )}

              {vehicleDetails?.lastMaintenance && (
                <div>
                  <p className="text-sm text-slate-600">Last Maintenance</p>
                  <p className="font-medium">
                    {new Date(vehicleDetails.lastMaintenance.service_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPopup(false)}
                className="flex-1 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200"
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