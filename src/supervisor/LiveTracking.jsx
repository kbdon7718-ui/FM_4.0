import { useEffect, useRef, useState } from 'react';
import { getLatestTelemetry } from '../services/api.js';

/* =========================
   LIVE TRACKING (MAPMYINDIA)
========================= */
export function LiveTracking() {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const markersRef = useRef([]);

  const [vehicles, setVehicles] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  /* =========================
     INIT MAP
  ========================= */
  useEffect(() => {
    if (!window.mappls || mapInstance.current) return;

    mapInstance.current = new window.mappls.Map(mapRef.current, {
      center: [28.6139, 77.209],
      zoom: 6,
    });
  }, []);

  /* =========================
     FETCH VEHICLE DATA
  ========================= */
  useEffect(() => {
    const load = async () => {
      const data = await getLatestTelemetry();
      setVehicles(data || []);
    };

    load();
    const i = setInterval(load, 5000);
    return () => clearInterval(i);
  }, []);

  /* =========================
     UPDATE MARKERS
  ========================= */
  useEffect(() => {
    if (!mapInstance.current || !window.mappls) return;

    // clear old markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    vehicles.forEach((v) => {
      if (!v.lat || !v.lng) return;

      const color =
        v.status === 'moving'
          ? 'green'
          : v.status === 'idling'
          ? 'orange'
          : 'red';

      const marker = new window.mappls.Marker({
        map: mapInstance.current,
        position: { lat: v.lat, lng: v.lng },
        icon: {
          url: `https://maps.mappls.com/images/${color}_marker.png`,
          size: [30, 30],
        },
        popupHtml: `
          <div style="font-size:12px">
            <strong>🚚 ${v.number}</strong><br/>
            Speed: ${v.speed} km/h<br/>
            Today: ${v.today_km} km<br/>
            Total: ${v.total_km} km
          </div>
        `,
      });

      marker.addListener('click', () => {
        setSelectedVehicle(v);
      });

      markersRef.current.push(marker);
    });
  }, [vehicles]);

  /* =========================
     FOCUS SELECTED VEHICLE
  ========================= */
  useEffect(() => {
    if (
      selectedVehicle?.lat &&
      selectedVehicle?.lng &&
      mapInstance.current
    ) {
      mapInstance.current.setCenter(
        [selectedVehicle.lat, selectedVehicle.lng],
        14
      );
    }
  }, [selectedVehicle]);

  return (
    <div className="flex h-full w-full">
      {/* ================= MAP (3/4) ================= */}
      <div className="w-3/4 h-full">
        <div
          ref={mapRef}
          className="h-full w-full"
        />
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
