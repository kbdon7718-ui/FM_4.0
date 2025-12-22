import { useState, useEffect } from 'react';
import FleetLayout from './FleetLayout';
import FleetMap from './FleetMap';
import FleetSettings from './FleetSettings';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';

const API_BASE_URL = BASE_URL.endsWith('/api')
  ? BASE_URL
  : `${BASE_URL}/api`;

export default function FleetDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [vehicle, setVehicle] = useState(null);
  const [distance, setDistance] = useState(0);
  const [distanceLoading, setDistanceLoading] = useState(false);
  const [distanceError, setDistanceError] = useState('');

  /* =========================
     RESTORE VEHICLE (on reload)
  ========================= */
  useEffect(() => {
    const saved = localStorage.getItem('assignedVehicle');
    if (saved) {
      setVehicle(JSON.parse(saved));
    }
  }, []);

  /* =========================
     FETCH DISTANCE
  ========================= */
  useEffect(() => {
    if (!vehicle) return;

    const start = new Date();
    start.setUTCHours(0, 0, 0, 0);
    const end = new Date();

    setDistanceLoading(true);
    setDistanceError('');

    fetch(
      `${API_BASE_URL}/fleet/distance?vehicle_id=${vehicle.vehicle_id}&start=${start.toISOString()}&end=${end.toISOString()}`,
      {
        headers: {
          'x-role': 'OWNER',
        },
      }
    )
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch distance');
        return res.json();
      })
      .then((data) => {
        setDistance(data.distance_km || 0);
      })
      .catch(() => {
        setDistanceError('Unable to calculate distance');
        setDistance(0);
      })
      .finally(() => {
        setDistanceLoading(false);
      });
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
          ttings
        </button>
      </div>

      {/* =========================
         DASHBOARD
      ========================= */}
      {activeTab === 'dashboard' && (
        <div className="max-w-md mx-auto text-center mt-20 space-y-4">
          <h2 className="text-xl font-semibold">Today Distance</h2>

          {distanceLoading && (
            <div className="text-gray-500">Calculating distance…</div>
          )}

          {!distanceLoading && !distanceError && (
            <div className="text-3xl font-bold text-blue-600">
              {distance.toFixed(2)} km
            </div>
          )}

          {distanceError && (
            <div className="text-sm text-red-600">{distanceError}</div>
          )}

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
          onVehicleAssigned={(v) => {
            setVehicle(v);
            localStorage.setItem('assignedVehicle', JSON.stringify(v));
          }}
          onLogout={onLogout}
        />
      )}
    </FleetLayout>
  );
}
