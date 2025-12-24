import { useEffect, useRef, useState } from 'react';
import { getLatestTelemetry } from '../services/api.js';
import { MapPin, Car, Clock, Phone, Wrench, Activity, Eye, EyeOff } from 'lucide-react';

function zoomByRadius(radius) {
  if (radius <= 200) return 18;
  if (radius <= 500) return 16;
  if (radius <= 1000) return 15;
  return 14;
}

/* ======================================================
   MAP CLICK HELPER
====================================================== */
function useMapClick(map, onPick) {
  useEffect(() => {
    if (!map || !window.mappls || !window.mappls.Event) return;

    const listener = window.mappls.Event.addListener(map, 'click', (e) => {
      onPick({
        lat: e.latLng.lat(),
        lng: e.latLng.lng(),
      });
    });

    return () => {
      if (listener) window.mappls.Event.removeListener(listener);
    };
  }, [map, onPick]);
}
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5002";
const API_BASE_URL = BASE_URL.endsWith("/api") 
? BASE_URL
 : `${BASE_URL}/api`;

/* ======================================================
   SUPERVISOR – GEOFENCING PAGE
====================================================== */
export default function GeofencingPage() {
  
  const mapRef = useRef(null);
 
 
const autoCenterRef = useRef(true);
 
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [vehicleDetails, setVehicleDetails] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const [mapError, setMapError] = useState('');

  /* ---------- STATE ---------- */
  const [companies, setCompanies] = useState([]);
  const [companyName, setCompanyName] = useState('');
  const [radius, setRadius] = useState(500);
  const [point, setPoint] = useState(null);
  const [editingId, setEditingId] = useState(null);

const [mapLayer, setMapLayer] = useState('standard');

const [showAssign, setShowAssign] = useState(false);
const [selectedGeofence, setSelectedGeofence] = useState(null);

const vehicleMarkersRef = useRef({});
const [liveVehicles, setLiveVehicles] = useState([]);

const [vehicles, setVehicles] = useState([]);
const [vehicleId, setVehicleId] = useState('');
const [expectedTime, setExpectedTime] = useState('');
const [graceMinutes, setGraceMinutes] = useState(10);

 
  /* ======================================================
     INIT MAP
  ====================================================== */
useEffect(() => {
  const initMap = () => {
    if (!window.mappls || mapRef.current) return;

    mapRef.current = new window.mappls.Map('geofence-map', {
      center: [28.61, 77.2],
      zoom: 6,
    });

    mapRef.current.addListener('dragstart', () => {
      autoCenterRef.current = false;
    });

    mapRef.current.addListener('zoomstart', () => {
      autoCenterRef.current = false;
    });
  };

  const t = setTimeout(initMap, 10);
  return () => clearTimeout(t);
}, []);

  /* =========================
     FETCH VEHICLE DATA
  ========================= */
  useEffect(() => {
  const load = async () => {
    try {
      const data = await getLatestTelemetry();
      setLiveVehicles(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    }
  };

  load();
  const i = setInterval(load, 2000);
  return () => clearInterval(i);
}, []);

  
  /* =========================
     UPDATE MARKERS AND BOUNDS
  ========================= */
  useEffect(() => {
  if (!mapRef.current || !window.mappls) return;

  const seen = new Set();

  liveVehicles.forEach(v => {
    const lat = Number(v.lat);
    const lng = Number(v.lng);

    if (
      isNaN(lat) || isNaN(lng) ||
      lat < -90 || lat > 90 ||
      lng < -180 || lng > 180
    ) return;

    seen.add(v.id);

    let marker = vehicleMarkersRef.current[v.id];

    if (!marker) {
      marker = new window.mappls.Marker({
        map: mapRef.current,
        position: { lat, lng },
        html: `
          <div style="
            width:14px;
            height:14px;
            border-radius:50%;
            background:${
              v.status === 'moving'
                ? '#16a34a'
                : v.status === 'idling'
                ? '#f59e0b'
                : '#dc2626'
            };
            border:2px solid white;
            box-shadow:0 0 6px rgba(0,0,0,.4);
            z-index:999;
          "></div>
        `,
      });

      vehicleMarkersRef.current[v.id] = marker;
    } else {
      marker.setPosition({ lat, lng });
    }
  });

  Object.keys(vehicleMarkersRef.current).forEach(id => {
    if (!seen.has(id)) {
      vehicleMarkersRef.current[id].remove();
      delete vehicleMarkersRef.current[id];
    }
  });
}, [liveVehicles]);

  /* ======================================================
     MAPPLS AUTOSUGGEST (v3)
  ====================================================== */
  useEffect(() => {
    if (
      !window.mappls ||
      !window.mappls.plugins ||
      !window.mappls.plugins.autosuggest ||
      !mapRef.current
    )
      return;

    const autoSuggest = window.mappls.plugins.autosuggest({
      input: 'searchBox',
      map: mapRef.current,
      region: 'IND',
      placeholder: 'Search company address',
      callback: (place) => {
        if (!place || !place.latitude || !place.longitude) return;

        const lat = Number(place.latitude);
        const lng = Number(place.longitude);

        setPoint({ lat, lng });
        setCompanyName(place.placeName || '');
if (mapRef.current) {
  mapRef.current.setCenter([lat, lng]);

// Autosuggest should NOT depend on radius
mapRef.current.setZoom(16);

}
      },
    });

    return () => autoSuggest?.clear?.();
  }, []);

  /* ======================================================
     LOAD EXISTING GEOFENCES
  ====================================================== */
  const loadCompanies = async () => {
    const res = await fetch(`${API_BASE_URL}/companies`);
    if (!res.ok) return;
    const data = await res.json();
    setCompanies(data);
  };


  useEffect(() => {
    loadCompanies();
  }, []);


  const loadVehicles = async () => {
  const res = await fetch(`${API_BASE_URL}/vehicles`);
  if (!res.ok) return;
  setVehicles(await res.json());
};
useEffect(() => {
  loadVehicles();
}, []);
const geofenceCirclesRef = useRef([]);

useEffect(() => {
  if (!mapRef.current || !window.mappls) return;

  const drawCircles = () => {
    // remove old circles
    geofenceCirclesRef.current.forEach(o => o.circle?.setMap(null));
    geofenceCirclesRef.current = [];

    companies.forEach(c => {
      const m = c.center?.toString().match(/POINT\(([-\d.]+) ([-\d.]+)\)/);
      if (!m) return;

      const lng = Number(m[1]); // ✅ correct
      const lat = Number(m[2]); // ✅ correct

      const circle = new window.mappls.Circle({
        map: mapRef.current,
        center: [lat, lng],
        radius: Number(c.radius_meters),
        strokeColor: '#2563eb',
        strokeWeight: 2,
        fillColor: '#2563eb',
        fillOpacity: 0.25,
      });

      window.mappls.Event.addListener(circle, 'click', () => {
        mapRef.current.setCenter([lat, lng]);
        mapRef.current.setZoom(zoomByRadius(c.radius_meters));
      });

      geofenceCirclesRef.current.push({ circle });
    });
  };

  if (mapRef.current.loaded && mapRef.current.loaded()) {
    drawCircles();
  } else {
    mapRef.current.addListener('load', drawCircles);
  }
}, [companies]);

  /* ======================================================
     CREATE / UPDATE GEOFENCE
  ====================================================== */
  const saveGeofence = async () => {
    if (!companyName || !point) {
      alert('Please select a location');
      return;
    }

    const payload = {
      company_name: companyName,
      center_lat: point.lat,
      center_lng: point.lng,
      radius_meters: radius,
    
    };

    const url = editingId
  ? `${API_BASE_URL}/geofences/${editingId}`
  : `${API_BASE_URL}/companies`;

    const method = editingId ? 'PUT' : 'POST';

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      alert('Failed to save geofence');
      return;
    }

    // reset
    setCompanyName('');
    setRadius(500);
    setPoint(null);
    setEditingId(null);
    
  
   
    

    loadCompanies();
  };

  /* ======================================================
     DELETE GEOFENCE
  ====================================================== */
  const deleteGeofence = async (id) => {
    if (!confirm('Delete this geofence?')) return;
    await fetch(`/api/geofences/${id}`, { method: 'DELETE' });
    loadCompanies();
  };

  /* ======================================================
     UI
  ====================================================== */
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* MAP */}
      <div className="flex-1 h-screen overflow-hidden">
        <div
  id="geofence-map"
  className="h-full w-full pointer-events-auto"
/>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-[520px] border-l bg-white p-6 overflow-y-auto h-screen relative z-50">
        <h1 className="text-lg font-semibold mb-6">Geofence Management</h1>

        {/* FORM */}
        <div className="border rounded-lg p-5 mb-6">
          <h2 className="font-semibold mb-4">
            {editingId ? '✏️ Edit Geofence' : '📍 Create Geofence'}
          </h2>

          <div className="space-y-4">
            <input
              className="w-full border rounded px-3 py-2"
              placeholder="Geofence Name"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            {/* LATITUDE / LONGITUDE */}
<div className="grid grid-cols-2 gap-3">
  <input
    type="number"
    step="any"
    className="border rounded px-3 py-2"
    placeholder="Latitude"
    value={point?.lat ?? ''}
    onChange={(e) =>
      setPoint({
        lat: Number(e.target.value),
        lng: point?.lng ?? 0,
      })
    }
  />

  <input
    type="number"
    step="any"
    className="border rounded px-3 py-2"
    placeholder="Longitude"
    value={point?.lng ?? ''}
    onChange={(e) =>
      setPoint({
        lat: point?.lat ?? 0,
        lng: Number(e.target.value),
      })
    }
  />
</div>

{/* SHOW ON MAP */}
<button
  onClick={() => {
    if (!point?.lat || !point?.lng) {
      alert('Enter latitude and longitude');
      return;
    }
    mapRef.current.setCenter([point.lat, point.lng]);
    mapRef.current.setZoom(16);
  }}
  className="w-full bg-gray-100 border py-2 rounded text-sm"
>
  🗺️ Show on Map
</button>

{/* RADIUS */}
<input
  type="number"
  className="w-full border rounded px-3 py-2"
  placeholder="Radius (meters)"
  value={radius}
  onChange={(e) => setRadius(+e.target.value)}
/>


            
          
            

            <button
              onClick={saveGeofence}
              className="w-full bg-blue-600 text-white py-2 rounded"
            >
              {editingId ? 'Update Geofence' : 'Create Geofence'}
            </button>
          </div>
        </div>

        {/* LIST */}
        <h2 className="font-semibold mb-3">Geofences</h2>

        {companies.map((c) => {
          const m = c.center
            ?.toString()
            .match(/POINT\(([-\d.]+) ([-\d.]+)\)/);

          return (
            <div
              key={c.company_id}
              className="border rounded-lg p-4 mb-3 bg-gray-50"
            >
              <div className="flex justify-between">
                <div>
                  <div className="font-semibold">{c.company_name}</div>
                  {m && (
                    <div className="text-sm text-gray-600">
                      {m[2]}, {m[1]}
                    </div>
                  )}
                  <div className="text-sm text-gray-600">
                    Radius: {c.radius_meters}m
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setEditingId(c.company_id);
                      setCompanyName(c.company_name);
                      setRadius(c.radius_meters);

                      if (m) {
                        const lat = Number(m[2]);
                        const lng = Number(m[1]);
                        setPoint({ lat, lng });
                     mapRef.current.setCenter([lat, lng]);
                     mapRef.current.setZoom(zoomByRadius(c.radius_meters));

                      }

                      
                    }}
                    className="text-blue-600"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => deleteGeofence(c.company_id)}
                    className="text-red-600"
                  >
                    🗑️
                  </button>
                  <button
  onClick={() => {
    setSelectedGeofence(c);
    setShowAssign(true);
  }}
  className="text-green-600"
>
  ➕
</button>
<button
  onClick={() => {
    const next = mapLayer === 'standard' ? 'satellite' : 'standard';
    setMapLayer(next);

    mapRef.current.setMapType(
  next === 'satellite'
    ? window.mappls.MapType.SATELLITE
    : window.mappls.MapType.STANDARD
);

  }}
  className="px-3 py-1 border rounded text-sm"
>
  🛰️ {mapLayer === 'standard' ? 'Satellite' : 'Standard'}
</button>


                </div>
              </div>
            </div>
          );
        })}
      </div>
{showAssign && (
  <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
    <div className="bg-white w-[420px] rounded-lg p-6">
      <h2 className="text-lg font-semibold mb-4">
        Assign Vehicle to Geofence
      </h2>

      <div className="space-y-4">
        {/* VEHICLE */}
        <select
          className="w-full border rounded px-3 py-2"
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
        >
          <option value="">Select Vehicle</option>
          {vehicles.map((v) => (
            <option key={v.vehicle_id} value={v.vehicle_id}>
              {v.vehicle_number}
            </option>
          ))}
        </select>

        {/* EXPECTED TIME */}
        <input
          type="time"
          className="w-full border rounded px-3 py-2"
          value={expectedTime}
          onChange={(e) => setExpectedTime(e.target.value)}
        />

        {/* GRACE */}
        <input
          type="number"
          className="w-full border rounded px-3 py-2"
          placeholder="Grace minutes"
          value={graceMinutes}
          onChange={(e) => setGraceMinutes(+e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowAssign(false)}
            className="px-4 py-2 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={async () => {
              if (!vehicleId || !expectedTime) {
                alert('Select vehicle & time');
                return;
              }

              await fetch(`${API_BASE_URL}/geofence-assignments`,{
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  geofence_id: selectedGeofence.company_id
,
                  vehicle_id: vehicleId,
                  expected_entry_time: expectedTime,
                  grace_minutes: graceMinutes,
                }),
              });

              setShowAssign(false);
              setVehicleId('');
              setExpectedTime('');
              setGraceMinutes(10);
            }}
            className="px-4 py-2 bg-blue-600 text-white rounded"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
