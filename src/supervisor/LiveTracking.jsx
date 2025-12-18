import { useEffect, useRef, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

import { getLatestTelemetry } from '../services/api.js';

/* =========================
   FIX LEAFLET ICON
========================= */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl:
    'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

/* =========================
   VEHICLE ICON
========================= */
const vehicleIcon = (status) =>
  L.divIcon({
    html: `
      <div style="
        width:32px;
        height:32px;
        border-radius:50%;
        background:${status === 'moving' ? '#22c55e' : '#ef4444'};
        display:flex;
        align-items:center;
        justify-content:center;
        color:white;
        box-shadow:0 2px 6px rgba(0,0,0,0.4);
      ">
        🚚
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

/* =========================
   MAP CONTROLLER
========================= */
function FocusVehicle({ vehicle }) {
  const map = useMap();

  useEffect(() => {
    if (vehicle?.lat && vehicle?.lng) {
      map.setView(
        [vehicle.lat, vehicle.lng],
        14,
        { animate: true }
      );
    }
  }, [vehicle, map]);

  return null;
}

/* =========================
   LIVE TRACKING
========================= */
export function LiveTracking() {
  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  /* =========================
     FETCH DATA
  ========================= */
  useEffect(() => {
    const load = async () => {
      const data = await getLatestTelemetry();
      setVehicles(data);
    };

    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, []);

  return (
    <div className="flex h-full w-full">
      {/* ================= MAP (3/4) ================= */}
      <div className="w-3/4 h-full">
        <MapContainer
          center={[28.6139, 77.209]}
          zoom={6}
          className="h-full w-full"
          whenCreated={(map) =>
            setTimeout(() => map.invalidateSize(), 300)
          }
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FocusVehicle vehicle={selectedVehicle} />

          {vehicles.map((v) => (
            <Marker
              key={v.id}
              position={[v.lat, v.lng]}
              icon={vehicleIcon(v.status)}
            >
              <Popup>
                <div className="min-w-[220px] text-sm">
                  <div className="font-semibold mb-1">
                    🚚 {v.number}
                  </div>
                  <div className="flex justify-between">
                    <span>Speed</span>
                    <span>{v.speed} km/h</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Today</span>
                    <span>{v.today_km} km</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total</span>
                    <span>{v.total_km} km</span>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* ================= LIST (1/4) ================= */}
      <div className="w-1/4 border-l bg-white overflow-y-auto">
        <div className="p-4 font-semibold border-b">
          Vehicles ({vehicles.length})
        </div>

        {vehicles.map((v) => (
          <div
            key={v.id}
            onClick={() => setSelectedVehicle(v)}
            className={`p-3 cursor-pointer border-b hover:bg-slate-100 ${
              selectedVehicle?.id === v.id
                ? 'bg-slate-200'
                : ''
            }`}
          >
            <div className="font-medium">
              🚚 {v.number}
            </div>
            <div className="text-xs flex justify-between text-gray-600">
              <span>{v.speed} km/h</span>
              <span>{v.today_km} km</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
