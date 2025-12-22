import { useEffect, useRef, useState } from 'react';

const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5002';

const API_BASE_URL = BASE_URL.endsWith('/api')
  ? BASE_URL
  : `${BASE_URL}/api`;

export default function FleetMap({ user }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);

  const [error, setError] = useState('');

  useEffect(() => {
    if (!window.mappls) {
      setError('Mappls SDK not loaded');
      return;
    }

    if (!navigator.geolocation) {
      setError('Geolocation not supported');
      return;
    }

    // 🔹 INIT MAP
    const map = new window.mappls.Map('fleet-map', {
      center: [28.6139, 77.209],
      zoom: 16,
    });

    mapRef.current = map;

    // 🔹 CREATE MARKER
    markerRef.current = new window.mappls.Marker({
      map,
      position: { lat: 28.6139, lng: 77.209 },
    });

    // 🔹 WATCH GPS
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed } = pos.coords;

        // Move marker
        markerRef.current.setPosition({
          lat: latitude,
          lng: longitude,
        });

        map.setCenter([latitude, longitude]);

        // 🔥 SEND GPS (every 5 sec)
        const now = Date.now();
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
              speed: speed || 0,
              ignition: true,
            }),
          }).catch(() => {});
        }
      },
      (err) => {
        console.error(err);
        setError('Unable to fetch GPS location');
      },
      {
        enableHighAccuracy: true,
        maximumAge: 0,
        timeout: 5000,
      }
    );

    return () => {
      if (watchIdRef.current) {
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

  return (
    <div
      id="fleet-map"
      style={{
        height: '500px',
        width: '100%',
        borderRadius: '8px',
      }}
    />
  );
}
