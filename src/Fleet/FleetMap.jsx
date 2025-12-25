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
  const hasCenteredRef = useRef(false);

  const [error, setError] = useState(null);

  /* =========================
     INIT MAP (ONCE)
  ========================= */
  useEffect(() => {
    if (!window.mappls) {
      setError('MapmyIndia SDK not loaded');
      return;
    }

    const container = document.getElementById('fleet-map');
    if (!container || mapRef.current) return;

    // 🇮🇳 SAFE INDIA FALLBACK
    const map = new window.mappls.Map(container, {
      center: [28.6139, 77.2090], // Delhi
      zoom: 6,
    });

    mapRef.current = map;

    markerRef.current = new window.mappls.Marker({
      map,
    });
  }, []);

  /* =========================
     LOAD LAST DB LOCATION
  ========================= */
  useEffect(() => {
    if (!user?.vehicle_id || !mapRef.current) return;

    fetch(`${API_BASE_URL}/fleet/last-location/${user.vehicle_id}`, {
      headers: {
        'x-role': 'FLEET',
        'x-vehicle-id': user.vehicle_id,
      },
    })
      .then((res) => res.ok ? res.json() : null)
      .then((data) => {
        if (
          data?.latitude &&
          data?.longitude &&
          !hasCenteredRef.current
        ) {
          markerRef.current.setPosition({
            lat: data.latitude,
            lng: data.longitude,
          });

          mapRef.current.setCenter([data.latitude, data.longitude]);
          mapRef.current.setZoom(17);

          hasCenteredRef.current = true;
        }
      })
      .catch(() => {});
  }, [user]);

  /* =========================
     LIVE GPS TRACKING
  ========================= */
  useEffect(() => {
    if (!navigator.geolocation || !mapRef.current) {
      setError('Geolocation not supported');
      return;
    }

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed } = pos.coords;

        if (
          latitude == null ||
          longitude == null ||
          latitude === 0 ||
          longitude === 0
        ) return;

        markerRef.current.setPosition({ lat: latitude, lng: longitude });

        // 🎯 FIRST VALID GPS → CENTER
        if (!hasCenteredRef.current) {
          mapRef.current.setCenter([latitude, longitude]);
          mapRef.current.setZoom(18);
          hasCenteredRef.current = true;
        }

        // 🔁 SEND GPS (5 sec)
        if (!user?.vehicle_id) return;

        const now = Date.now();
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
      () => setError('Unable to fetch GPS location'),
      { enableHighAccuracy: true, timeout: 10000 }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [user]);

  if (error) {
    return (
      <div className="w-full rounded-lg border border-destructive-muted bg-destructive-muted p-4 text-center text-sm text-foreground">
        {error}
      </div>
    );
  }

  return (
    <div
      id="fleet-map"
      className="w-full rounded-xl overflow-hidden border border-border bg-card"
      style={{ height: '65vh', minHeight: 420, maxHeight: 900 }}
    />
  );
}
