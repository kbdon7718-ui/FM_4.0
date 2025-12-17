import { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in React-Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom vehicle icons based on status
const createVehicleIcon = (status, rotation = 0) => {
  const colors = {
    moving: '#22c55e',    // green
    stopped: '#ef4444',   // red
    idling: '#f59e0b',    // yellow/amber
  };
  
  const color = colors[status] || colors.stopped;
  
  return L.divIcon({
    className: 'custom-vehicle-marker',
    html: `
      <div style="
        width: 36px;
        height: 36px;
        background: ${color};
        border: 3px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        transform: rotate(${rotation}deg);
      ">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="white">
          <path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/>
        </svg>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
};

// Component to fit map bounds to markers
function FitBounds({ vehicles }) {
  const map = useMap();
  
  useEffect(() => {
    if (vehicles && vehicles.length > 0) {
      const validVehicles = vehicles.filter(v => v.lat && v.lng);
      if (validVehicles.length > 0) {
        const bounds = L.latLngBounds(validVehicles.map(v => [v.lat, v.lng]));
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }
  }, [vehicles, map]);
  
  return null;
}

// Component to center map on selected vehicle
function CenterOnVehicle({ vehicle }) {
  const map = useMap();
  
  useEffect(() => {
    if (vehicle && vehicle.lat && vehicle.lng) {
      map.setView([vehicle.lat, vehicle.lng], 14, { animate: true });
    }
  }, [vehicle, map]);
  
  return null;
}

export function VehicleMap({ 
  vehicles = [], 
  selectedVehicleId = null,
  onVehicleClick = () => {},
  center = [28.6139, 77.2090], // Default: Delhi
  zoom = 10,
  className = '',
  style = {},
}) {
  // Find selected vehicle from id
  const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
  
  return (
    <MapContainer
      center={center}
      zoom={zoom}
      className={className}
      style={{ height: '100%', width: '100%', borderRadius: '8px', ...style }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Fit bounds to show all vehicles */}
      <FitBounds vehicles={vehicles} />
      
      {/* Center on selected vehicle */}
      {selectedVehicle && <CenterOnVehicle vehicle={selectedVehicle} />}
      
      {/* Vehicle markers */}
      {vehicles.map((vehicle) => {
        if (!vehicle.lat || !vehicle.lng) return null;
        
        return (
          <Marker
            key={vehicle.id}
            position={[vehicle.lat, vehicle.lng]}
            icon={createVehicleIcon(vehicle.status, vehicle.rotation || 0)}
            eventHandlers={{
              click: () => onVehicleClick(vehicle),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="font-bold text-lg mb-1">{vehicle.number}</div>
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className={`font-medium ${
                      vehicle.status === 'moving' ? 'text-green-600' :
                      vehicle.status === 'stopped' ? 'text-red-600' : 'text-amber-600'
                    }`}>
                      {vehicle.statusText || vehicle.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Speed:</span>
                    <span>{vehicle.speed || 0} km/h</span>
                  </div>
                  {vehicle.address && (
                    <div className="text-gray-600 text-xs mt-2 border-t pt-2">
                      📍 {vehicle.address}
                    </div>
                  )}
                  {vehicle.lastUpdated && (
                    <div className="text-gray-400 text-xs">
                      Updated: {vehicle.lastUpdated}
                    </div>
                  )}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </MapContainer>
  );
}

export default VehicleMap;
