import { useState } from 'react';

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
  `${import.meta.env.VITE_API_URL}/api/fleet/assign-vehicle`,
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
      <h2 className="text-lg font-semibold">Assign Vehicle</h2>

      <input
        className="border p-2 w-full rounded"
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
        className="w-full bg-blue-600 text-white py-2 rounded"
      >
        {loading ? 'Saving...' : 'Save Vehicle'}
      </button>
    </div>
  );
}
