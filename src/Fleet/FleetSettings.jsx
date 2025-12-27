
import { useState } from 'react';
import { API_BASE_URL } from '../services/apiBase';


export default function FleetSettings({ onVehicleAssigned }) {
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    if (!vehicleNumber) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`${API_BASE_URL}/fleet/assign-vehicle`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-role': 'FLEET',
          //  TEMP fleet identity (until JWT)
          'x-fleet-id': '11111111-1111-1111-1111-111111111111',
        },
        body: JSON.stringify({ vehicle_number: vehicleNumber }),
      });
      let data = {};
      try {
        data = await res.json();
      } catch {}
      if (!res.ok) {
        throw new Error(data.message || 'Failed to assign vehicle (server error)');
      }
      onVehicleAssigned(data);
      setVehicleNumber('');
    } catch (err) {
      setError(err.message || 'Network error. Please try again.');
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
        <div className="text-sm text-red-600" role="alert">
          {error}
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        className="w-full h-11 rounded-md bg-blue-600 text-white text-sm font-medium shadow-sm hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
        aria-busy={loading}
      >
        {loading ? 'Saving…' : 'Save Vehicle'}
      </button>
    </div>
  );
}
