import { useState, useEffect } from 'react';
import FleetLayout from './FleetLayout';
import FleetMap from './FleetMap';
import FleetSettings from './FleetSettings';

const API_BASE_URL = import.meta.env.VITE_API_URL;

export default function FleetDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicle, setVehicle] = useState(null);
  const [distance, setDistance] = useState(0);

  // Calculate today range
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const now = new Date();

  /* =========================
     FETCH DISTANCE
  ========================= */
  useEffect(() => {
    if (!vehicle) return;

     // ✅ DEFINE VARIABLES HERE
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();


    
  fetch(
      `${API_BASE_URL}/api/fleet/distance?vehicle_id=${vehicle.vehicle_id}&start=${start.toISOString()}&end=${end.toISOString()}`,
      {
        headers: {
          'x-role': 'OWNER', // TEMP (can allow FLEET later)
        },
      }
    )
      .then((res) => res.json())
      .then((data) => {
        setDistance(data.distance_km || 0);
      })
      .catch((err) => console.error(err));
  }, [vehicle]);

  return (
    <FleetLayout onLogout={onLogout}>
      {/* Top Navigation */}
      <div className="flex gap-6 mb-6 text-sm font-medium">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={activeTab === 'dashboard' ? 'text-blue-600 underline' : ''}
        >
          Dashboard
        </button>

        <button
          onClick={() => setActiveTab('location')}
          className={activeTab === 'location' ? 'text-blue-600 underline' : ''}
        >
          Your Location
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={activeTab === 'settings' ? 'text-blue-600 underline' : ''}
        >
          Settings
        </button>
      </div>

      {/* =========================
         DASHBOARD
      ========================= */}
      {activeTab === 'dashboard' && (
        <div className="max-w-md mx-auto text-center mt-20 space-y-4">
          <h2 className="text-xl font-semibold">Today Distance</h2>
          <div className="text-3xl font-bold text-blue-600">
            {distance.toFixed(2)} km
          </div>
          <p className="text-gray-500">
            Distance covered by assigned vehicle
          </p>
        </div>
      )}

      {/* =========================
         LIVE LOCATION
      ========================= */}
      {activeTab === 'location' && vehicle && (
        <FleetMap user={{ vehicle_id: vehicle.vehicle_id }} />
      )}

      {activeTab === 'location' && !vehicle && (
        <div className="text-center text-gray-500 mt-20">
          Please assign a vehicle in Settings first
        </div>
      )}

      {/* =========================
         SETTINGS
      ========================= */}
      {activeTab === 'settings' && (
        <FleetSettings
          onVehicleAssigned={(v) => setVehicle(v)}
          onLogout={onLogout}
        />
      )}
    </FleetLayout>
  );
}
