import { useEffect, useRef } from 'react';

export default function VehicleMap({ vehicles = [] }) {
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  /* ===============================
     INIT MAP (ONCE)
  =============================== */
  useEffect(() => {
    if (!window.mappls || mapInstance.current) return;

    // 🔥 FIX: pass container ID (string), NOT ref
    mapInstance.current = new window.mappls.Map('vehicle-map', {
      center: [28.6139, 77.2090], // Delhi
      zoom: 6,
    });
  }, []);

  /* ===============================
     UPDATE VEHICLE MARKERS
  =============================== */
  useEffect(() => {
    if (!mapInstance.current || !window.mappls) return;

    // clear old markers
    markersRef.current.forEach((m) => {
      if (m && m.setMap) m.setMap(null);
    });
    markersRef.current = [];

    vehicles.forEach((v) => {
      if (v.lat == null || v.lng == null) return;

      const marker = new window.mappls.Marker({
        map: mapInstance.current,
        position: { lat: v.lat, lng: v.lng },
      });

      const color =
        v.status === 'moving'
          ? 'green'
          : v.status === 'idling'
          ? 'orange'
          : 'red';

      marker.setIcon({
        url: `https://maps.mappls.com/images/${color}_marker.png`,
        size: [30, 30],
      });

      marker.setPopup(`
        <strong>${v.number}</strong><br/>
        Speed: ${v.speed || 0} km/h<br/>
        Status: ${v.status}
      `);

      markersRef.current.push(marker);
    });
  }, [vehicles]);

  return (
    <div
      id="vehicle-map"   // 🔥 REQUIRED
      style={{
        width: '100%',
        height: '500px',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    />
  );
}
