import { useEffect, useRef, useState } from 'react';

/* =========================
   MAPPLS MAP VIEW
========================= */
export function LiveFleetMap() {
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const watchIdRef = useRef(null);

  const [error, setError] = useState('');

  useEffect(() => {
    if (!window.mappls) {
      setError('Mappls SDK not loaded');
      return;
    }

    // Initialize map
    const map = new window.mappls.Map('fleet-map', {
      center: [28.6139, 77.2090],
      zoom: 15,
    });

    mapRef.current = map;

    // Add marker
    markerRef.current = new window.mappls.Marker({
      map,
      position: { lat: 28.6139, lng: 77.2090 },
    });

    // Watch GPS
    if (!navigator.geolocation) return;

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;

        markerRef.current.setPosition({ lat, lng });
        map.setCenter([lat, lng]);
      },
      (err) => {
        console.error(err);
        setError('Unable to fetch GPS location');
      },
      { enableHighAccuracy: true }
    );

    return () => {
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  if (error) {
    return (
      <div className="text-red-600 text-center mt-10">
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
        overflow: 'hidden',
      }}
    />
  );
}
