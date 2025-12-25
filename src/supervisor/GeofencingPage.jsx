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
    <div className="flex flex-col lg:flex-row min-h-[70svh] bg-background">
      {/* MAP */}
      <div className="flex-1 min-w-0">
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <div
            id="geofence-map"
            className="w-full h-[60svh] min-h-[360px] sm:h-[65svh] lg:h-[72svh] max-h-[820px] pointer-events-auto"
          />
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="w-full lg:w-[520px] lg:shrink-0 mt-4 lg:mt-0 lg:ml-4 border border-border bg-card p-4 sm:p-6 overflow-y-auto lg:h-[72svh] lg:max-h-[820px] rounded-xl relative z-10">
        <h1 className="text-lg font-semibold mb-6 text-foreground">Geofence Management</h1>

        {/* FORM */}
        <div className="border border-border rounded-lg p-5 mb-6 bg-muted/10">
          <h2 className="font-semibold mb-4 text-foreground">
            {editingId ? '✏️ Edit Geofence' : '📍 Create Geofence'}
          </h2>

          <div className="space-y-4">
            <input
              id="searchBox"
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              placeholder="Search company address"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
            />

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="h-11 rounded-md border border-border bg-muted/30 px-3 text-sm flex items-center justify-between">
                <span className="text-muted-foreground">Lat</span>
                <span className="font-medium text-foreground tabular-nums">
                  {point?.lat != null ? Number(point.lat).toFixed(6) : '--'}
                </span>
              </div>
              <div className="h-11 rounded-md border border-border bg-muted/30 px-3 text-sm flex items-center justify-between">
                <span className="text-muted-foreground">Lng</span>
                <span className="font-medium text-foreground tabular-nums">
                  {point?.lng != null ? Number(point.lng).toFixed(6) : '--'}
                </span>
              </div>
            </div>

            <input
              type="number"
              className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
              placeholder="Radius (meters)"
              value={radius}
              onChange={(e) => setRadius(+e.target.value)}
            />

            <button
              onClick={saveGeofence}
              className="w-full h-11 rounded-md bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:bg-primary/90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            >
              {editingId ? 'Update Geofence' : 'Create Geofence'}
            </button>
          </div>
        </div>

        {/* LIST */}
        <h2 className="font-semibold mb-3 text-foreground">Geofences</h2>

        {companies.map((c) => {
          const m = c.center
            ?.toString()
            .match(/POINT\(([-\d.]+) ([-\d.]+)\)/);

          return (
            <div
              key={c.company_id}
              className="border border-border rounded-lg p-4 mb-3 bg-muted/20"
            >
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="font-semibold text-foreground">{c.company_name}</div>
                  {m && (
                    <div className="text-sm text-muted-foreground">
                      {m[2]}, {m[1]}
                    </div>
                  )}
                  <div className="text-sm text-muted-foreground">
                    Radius: {c.radius_meters}m
                  </div>
                </div>

                <div className="flex flex-wrap justify-end gap-2">
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
                    className="inline-flex items-center justify-center h-11 w-11 rounded-md border border-border bg-card text-info hover:bg-accent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    ✏️
                  </button>

                  <button
                    onClick={() => deleteGeofence(c.company_id)}
                    className="inline-flex items-center justify-center h-11 w-11 rounded-md border border-border bg-card text-destructive hover:bg-destructive/10 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                  >
                    🗑️
                  </button>
                  <button
  onClick={() => {
    setSelectedGeofence(c);
    setShowAssign(true);
  }}
  className="inline-flex items-center justify-center h-11 w-11 rounded-md border border-border bg-card text-success hover:bg-accent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
  className="inline-flex items-center justify-center h-11 px-4 rounded-md border border-border bg-card text-sm font-medium text-foreground hover:bg-accent transition whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
  <div className="fixed inset-0 bg-black/50 z-50 p-4 overflow-y-auto" role="dialog" aria-modal="true" aria-label="Assign vehicle to geofence">
    <div className="mx-auto my-8 bg-card w-full max-w-md rounded-xl border border-border p-4 sm:p-6 shadow-xl max-h-[90svh] overflow-y-auto">
      <h2 className="text-lg font-semibold mb-4 text-foreground">
        Assign Vehicle to Geofence
      </h2>

      <div className="space-y-4">
        {/* VEHICLE */}
        <select
          className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
          className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          value={expectedTime}
          onChange={(e) => setExpectedTime(e.target.value)}
        />

        {/* GRACE */}
        <input
          type="number"
          className="w-full h-11 rounded-md border border-input bg-background px-3 text-sm shadow-sm text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          placeholder="Grace minutes"
          value={graceMinutes}
          onChange={(e) => setGraceMinutes(+e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={() => setShowAssign(false)}
            className="h-11 px-4 rounded-md border border-border bg-card text-sm font-medium text-foreground hover:bg-accent transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
            className="h-11 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold shadow-sm hover:bg-primary/90 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
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
