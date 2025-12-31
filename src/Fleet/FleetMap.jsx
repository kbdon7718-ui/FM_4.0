import { useEffect, useRef, useState } from 'react';

import { API_BASE_URL } from '../services/apiBase';
import { useMapplsSdk } from '../hooks/useMapplsSdk.js';

export default function FleetMap({ user, className, style }) {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);
  const hasCenteredRef = useRef(false);

  const [error, setError] = useState(null);
  const { ready: mapplsReady, error: mapplsError } = useMapplsSdk({ timeoutMs: 10000 });

  /* =========================
     INIT MAP (ONCE)
  ========================= */
  useEffect(() => {
    if (!mapplsReady) return;

    let attempts = 0;

    const waitForSDK = () => {
      attempts += 1;
      if (window.mappls) return Promise.resolve();
      if (attempts > 5) return Promise.reject(new Error('Map SDK not available'));
      return new Promise((resolve) => setTimeout(resolve, 1000)).then(waitForSDK);
    };

    const container = document.getElementById('fleet-map');
    if (!container || mapRef.current) return;

    // If we have an assigned vehicle, try to fetch its last DB location
    const init = async () => {
      const isValid = (lat, lng) => {
        if (lat == null || lng == null) return false;
        if (Number.isNaN(Number(lat)) || Number.isNaN(Number(lng))) return false;
        if (lat === 0 && lng === 0) return false;
        if (lat < -90 || lat > 90) return false;
        if (lng < -180 || lng > 180) return false;
        return true;
      };

      let center = [28.6139, 77.2090]; // fallback Delhi

      if (user?.vehicle_id) {
        try {
          const res = await fetch(`${API_BASE_URL}/fleet/last-location/${user.vehicle_id}`, {
            headers: {
              'x-role': 'FLEET',
              'x-vehicle-id': user.vehicle_id,
            },
          });

          if (res.ok) {
            const d = await res.json();
            if (isValid(d?.latitude, d?.longitude)) {
              center = [d.latitude, d.longitude];
              hasCenteredRef.current = true;
            }
          }
        } catch (e) {
          // ignore and fall back
        }
      } else if (navigator.geolocation) {
        // try to use browser location for fleet user without assigned vehicle
        try {
          const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { timeout: 5000 })
          );
          if (isValid(pos.coords.latitude, pos.coords.longitude)) {
            center = [pos.coords.latitude, pos.coords.longitude];
            hasCenteredRef.current = true;
          }
        } catch (e) {
          // ignore
        }
      }
      const map = new window.mappls.Map(container, {
        center,
        zoom: hasCenteredRef.current ? 17 : 6,
      });

      mapRef.current = map;

      try {
        markerRef.current = new window.mappls.Marker({ map });
      } catch (markerErr) {
        console.warn('Map marker init failed', markerErr);
        markerRef.current = null;
      }
    };

    waitForSDK()
      .then(init)
      .catch(() => setError('Map SDK not loaded'));
  }, [mapplsReady]);

  useEffect(() => {
    if (mapplsError) setError(mapplsError);
  }, [mapplsError]);

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
          try {
            markerRef.current.setPosition({
              lat: data.latitude,
              lng: data.longitude,
            });
            mapRef.current.setCenter([data.latitude, data.longitude]);
            mapRef.current.setZoom(17);
            hasCenteredRef.current = true;
          } catch (e) {
            setError('Map marker error');
          }
        }
      })
      .catch(() => setError('Failed to load last location'));
  }, [user]);

  /* =========================
     LIVE GPS TRACKING
  ========================= */
  useEffect(() => {
    // If map is not ready yet, do nothing
    if (!mapRef.current) return;

    // If browser doesn't support geolocation, silently skip live watch
    if (!navigator.geolocation) {
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
      className={`w-full rounded-xl overflow-hidden border border-border bg-card ${className || ''}`}
      style={{ height: '65vh', minHeight: 420, maxHeight: 900, ...(style || {}) }}
    />
  );
}
