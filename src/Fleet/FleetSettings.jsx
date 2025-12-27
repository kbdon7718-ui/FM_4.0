import { useState } from 'react';

const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5002';

const API_BASE_URL = BASE_URL.endsWith('/api')
  ? BASE_URL
  : `${BASE_URL}/api`;


export default function FleetSettings({ onVehicleAssigned }) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!vehicleNumber) return;

    setLoading(true);
    setError('');

    try {
    const res = await fetch(
  `${API_BASE_URL}/fleet/assign-vehicle`,
  {

          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-role': 'FLEET',
            // ✅ TEMP fleet identity (until JWT)
            'x-fleet-id': '11111111-1111-1111-1111-111111111111',
          },
          body: JSON.stringify({
            vehicle_number: vehicleNumber,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Failed to assign vehicle');
      }

      onVehicleAssigned(data);
      setVehicleNumber('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-sm mx-auto space-y-4">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">Assign Vehicle</h2>
        <p className="text-sm text-slate-600">
          Enter your assigned vehicle number to enable live tracking.
        </p>
      </div>

      <input
        className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        placeholder="Vehicle Number (HR55AN2175)"
        value={vehicleNumber}
        onChange={(e) => setVehicleNumber(e.target.value)}
      />

      {error && (
        <div className="text-sm text-red-600">
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full h-11 rounded-md bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      >
        {loading ? 'Saving...' : 'Save Vehicle'}
      </button>
    </div>
  );
}
