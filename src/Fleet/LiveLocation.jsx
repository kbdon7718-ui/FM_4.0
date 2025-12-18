import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useEffect, useState } from 'react';

/* =========================
   LIVE LOCATION STATUS (NO GPS SEND)
========================= */
export function LiveLocation() {
  return (
    <div className="bg-white p-4 rounded shadow">
      <h2 className="font-semibold text-green-600">
        Live Location Tracking
      </h2>
      <p className="text-sm text-gray-600">
        Location is being tracked from Fleet Map
      </p>
    </div>
  );
}

/* =========================
   MAP VIEW ONLY
========================= */
export function LiveFleetMap() {
  const [position, setPosition] = useState([28.6139, 77.2090]);

  useEffect(() => {
    if (!navigator.geolocation) return;

    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      (err) => console.error(err),
      { enableHighAccuracy: true }
    );

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div className="h-[500px] w-full rounded-lg overflow-hidden border">
      <MapContainer
        center={position}
        zoom={15}
        className="h-full w-full"
        whenCreated={(map) =>
          setTimeout(() => map.invalidateSize(), 200)
        }
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <Marker position={position} />
      </MapContainer>
    </div>
  );
}
