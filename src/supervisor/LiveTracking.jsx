import { useEffect, useRef, useState } from 'react';
import { getLatestTelemetry } from '../services/api.js';
import { MapPin, Car, Clock, Phone, Wrench, Activity, Eye, EyeOff } from 'lucide-react';

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
        bounds.push([v.lng, v.lat]); // Mappls may expect [lng, lat] for bounds
        console.log('Added to bounds:', [v.lng, v.lat]);

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
    <div className="flex flex-col h-full overflow-hidden relative">
      {/* ================= STATUS DASHBOARD ================= */}
      <div className="bg-white border-b shadow-sm p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <h2 className="text-lg font-semibold text-gray-800">Live Vehicle Tracking</h2>
            <div className="flex gap-4">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                All ({statusCounts.total})
              </button>
              
              <button
                onClick={() => setStatusFilter('moving')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'moving'
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Moving ({statusCounts.moving})
              </button>
              <button
                onClick={() => setStatusFilter('idling')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'idling'
                    ? 'bg-yellow-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Idling ({statusCounts.idling})
              </button>
              <button
                onClick={() => setStatusFilter('stopped')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  statusFilter === 'stopped'
                    ? 'bg-red-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                Stopped ({statusCounts.stopped})
              </button>
            </div>
          </div>
          <div className="text-sm text-gray-600">
            Last updated: {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* ================= MAIN CONTENT ================= */}
      <div className="flex-1 flex overflow-hidden">
        {/* ================= MAP ================= */}
        <div className="flex flex-col min-h-0 flex-1 overflow-hidden">

          {mapError ? (
            <div className="h-full w-full flex items-center justify-center bg-gray-100">
              <div className="text-center">
                <div className="text-red-600 text-lg font-semibold mb-2">Map Error</div>
                <div className="text-gray-600 mb-4">{mapError}</div>
                <button
                  onClick={() => window.location.reload()}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          ) : (
            <div
              ref={mapRef}
              id="live-tracking-map"
              className="h-full w-full"
              style={{ minHeight: '400px' }}
            />
          )}

          {/* Map Legend - only show if no error */}
          {!mapError && (
            <div className="absolute top-4 left-4 bg-white p-3 rounded-lg shadow-lg">
              <h4 className="text-sm font-medium mb-2">Legend</h4>
              <div className="space-y-1 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Moving</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Idling</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Stopped</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* ================= RIGHT SIDEBAR ================= */}
        <div className="w-80 bg-white border-l shadow-lg overflow-y-auto">
          <div className="p-4 border-b bg-gray-50">
            <h3 className="font-semibold text-gray-800">
              Vehicles ({filteredVehicles.length})
            </h3>
          </div>

          <div className="divide-y">
            {filteredVehicles.map((vehicle) => (
              <div
                key={vehicle.id}
                onClick={() => handleVehicleClick(vehicle)}
                className={`p-4 cursor-pointer hover:bg-gray-50 transition-colors ${
                  selectedVehicle?.id === vehicle.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Car size={16} className="text-gray-600" />
                    <span className="font-medium text-gray-800">{vehicle.number}</span>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    vehicle.status === 'moving'
                      ? 'bg-green-100 text-green-800'
                      : vehicle.status === 'idling'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {vehicle.status}
                  </div>
                </div>

                <div className="space-y-1 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Activity size={14} />
                    <span>{vehicle.speed} km/h</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin size={14} />
                    <span>{vehicle.lat?.toFixed(4)}, {vehicle.lng?.toFixed(4)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={14} />
                    <span>Today: {vehicle.today_km} km</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {filteredVehicles.length === 0 && (
            <div className="p-8 text-center text-gray-500">
              <Car size={48} className="mx-auto mb-4 opacity-50" />
              <p>No vehicles found</p>
              <p className="text-sm">Try changing the status filter</p>
            </div>
          )}
        </div>
      </div>

      {/* ================= VEHICLE DETAIL POPUP ================= */}
      {showPopup && selectedVehicle && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
                  <Car size={20} />
                  {selectedVehicle.number}
                </h3>
                <button
                  onClick={() => setShowPopup(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                {/* Status */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                    selectedVehicle.status === 'moving'
                      ? 'bg-green-100 text-green-800'
                      : selectedVehicle.status === 'idling'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {selectedVehicle.status}
                  </span>
                </div>

                {/* Speed */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Current Speed</span>
                  <span className="font-medium">{selectedVehicle.speed} km/h</span>
                </div>

                {/* Distance Today */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Distance Today</span>
                  <span className="font-medium">{selectedVehicle.today_km} km</span>
                </div>

                {/* Total Distance */}
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Distance</span>
                  <span className="font-medium">{selectedVehicle.total_km} km</span>
                </div>

                {/* Current Location */}
                <div className="flex items-start justify-between">
                  <span className="text-sm text-gray-600">Current Location</span>
                  <span className="font-medium text-right">
                    {selectedVehicle.lat?.toFixed(4)},<br />
                    {selectedVehicle.lng?.toFixed(4)}
                  </span>
                </div>

                {/* Driver Info */}
                {vehicleDetails?.driver && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <Eye size={16} />
                      Driver Information
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Name</span>
                        <span className="font-medium">{vehicleDetails.driver.driver_name}</span>
                      </div>
                      {vehicleDetails.driver.phone_number && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Phone</span>
                          <span className="font-medium">{vehicleDetails.driver.phone_number}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Last Maintenance */}
                {vehicleDetails?.lastMaintenance && (
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-800 mb-2 flex items-center gap-2">
                      <Wrench size={16} />
                      Last Maintenance
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Type</span>
                        <span className="font-medium">{vehicleDetails.lastMaintenance.maintenance_type}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600">Date</span>
                        <span className="font-medium">
                          {new Date(vehicleDetails.lastMaintenance.service_date).toLocaleDateString()}
                        </span>
                      </div>
                      {vehicleDetails.lastMaintenance.category && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-600">Category</span>
                          <span className="font-medium">{vehicleDetails.lastMaintenance.category}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* No Driver/Maintenance Info */}
                {(!vehicleDetails?.driver || !vehicleDetails?.lastMaintenance) && (
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-500 space-y-2">
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
