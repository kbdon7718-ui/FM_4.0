import { useEffect, useRef } from 'react';

export default function VehicleMap({ vehicles = [] }) {
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  /* ===============================
     INIT MAP (ONCE)
  =============================== */
  useEffect(() => {
    if (!window.mappls || mapInstance.current) return;

    const container = document.getElementById('vehicle-map');
    if (!container) return;

    mapInstance.current = new window.mappls.Map(container, {
      center: [28.6139, 77.2090], // lat, lng (Delhi)
      zoom: 6,
    });
  }, []);

  /* ===============================
     UPDATE VEHICLE MARKERS
  =============================== */
  useEffect(() => {
    if (!mapInstance.current || !window.mappls) return;

    // ✅ clear old markers (MapmyIndia way)
    markersRef.current.forEach((m) => {
      if (m && typeof m.remove === 'function') {
        m.remove();
      }
    });
    markersRef.current = [];

    vehicles.forEach((v) => {
      if (v.lat == null || v.lng == null) return;

      const color =
        v.status === 'moving'
          ? '#16a34a'
          : v.status === 'idling'
          ? '#f59e0b'
          : '#dc2626';

      // ✅ HTML marker (SUPPORTED)
      const marker = new window.mappls.Marker({
        map: mapInstance.current,
        position: { lat: v.lat, lng: v.lng },
        html: `
          <div style="
            width:16px;
            height:16px;
            border-radius:50%;
            background:${color};
            border:2px solid white;
            box-shadow:0 0 6px rgba(0,0,0,0.4);
          "></div>
        `,
        offset: [0, 0],
      });

      // ✅ Popup
      if (typeof marker.setPopup === 'function') {
        marker.setPopup(`
          <div style="font-size:12px">
            <strong>${v.number}</strong><br/>
            Speed: ${v.speed || 0} km/h<br/>
            Status: ${v.status}
          </div>
        `);
      }

      markersRef.current.push(marker);
    });
  }, [vehicles]);

  return (
    <div
      id="vehicle-map"
      className="w-full h-[60svh] min-h-[360px] sm:h-[65svh] lg:h-[72svh] max-h-[820px] rounded-xl overflow-hidden border border-border bg-card"
    />
  );
}
