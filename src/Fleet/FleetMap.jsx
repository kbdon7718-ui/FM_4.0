import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { useEffect, useRef, useState } from 'react';

const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5002';

const API_BASE_URL = BASE_URL.endsWith('/api')
  ? BASE_URL
  : `${BASE_URL}/api`;

export default function FleetMap({ user }) {
  const mapRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);

  const [position, setPosition] = useState(null);
  const [error, setError] = useState('');
  const [lastSentAt, setLastSentAt] = useState(null); // 🔹 small addition

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const latitude = pos.coords.latitude;
        const longitude = pos.coords.longitude;
        const speed = pos.coords.speed || 0;

        const coords = [latitude, longitude];
        setPosition(coords);

        if (mapRef.current) {
          mapRef.current.setView(coords, mapRef.current.getZoom(), {
            animate: true,
          });
        }

        // 🔥 SEND LOCATION TO BACKEND (every 5 sec)
        const now = Date.now();

        // ✅ DO NOT send if vehicle not assigned
        if (!user?.vehicle_id) return;

        if (now - lastSentRef.current > 5000) {
          lastSentRef.current = now;

          fetch(`${API_BASE_URL}/fleet/location`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-role': 'FLEET',
              'x-vehicle-id': user.vehicle_id,
            },
            body: JSON.stringify({
              latitude,
              longitude,
              speed,
              ignition: true,
            }),
          })
            .then(() => {
              setLastSentAt(new Date()); // 🔹 debug only
            })
            .catch((err) => {
              console.error('Failed to send GPS', err);
            });
        }
      },
      (err) => {
  console.error(err);

  switch (err.code) {
    case err.PERMISSION_DENIED:
      setError('Location permission denied');
      break;
    case err.POSITION_UNAVAILABLE:
      setError('Location unavailable. Check GPS or network');
      break;
    case err.TIMEOUT:
      setError('Location request timed out');
      break;
    default:
      setError('Unable to fetch location');
  }
},

      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [user]);

  if (error) {
    return (
      <div className="text-center mt-10 text-red-600">
        {error}
      </div>
    );
  }

  if (!position) {
    return (
      <div className="flex items-center justify-center h-[500px] text-gray-500">
        Fetching live location...
      </div>
    );
  }

  return (
    <div
      style={{
        height: '500px',
        width: '100%',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <MapContainer
        center={position}
        zoom={16}
        style={{ height: '100%', width: '100%' }}
        whenCreated={(map) => {
          mapRef.current = map;
          setTimeout(() => map.invalidateSize(), 300);
        }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <Marker position={position} />
      </MapContainer>

      {/* 🔹 Small debug helper */}
      {lastSentAt && (
        <div className="text-xs text-green-600 mt-1 text-center">
          Last GPS sent at {lastSentAt.toLocaleTimeString()}
        </div>
      )}
    </div>
  );
}
