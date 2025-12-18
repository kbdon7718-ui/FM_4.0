import { useEffect, useState } from 'react';
import api from '../services/api';

export function FuelReports() {
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');
  const [fuelQty, setFuelQty] = useState('');
  const [fuelDate, setFuelDate] = useState(
    new Date().toISOString().split('T')[0]
  );
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    async function loadVehicles() {
      const data = await api.getVehicles();
      setVehicles(data);
    }
    loadVehicles();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // 1️⃣ Create fuel entry
      await api.createFuelEntry({
        vehicle_id: vehicleId,
        fuel_quantity: Number(fuelQty),
        fuel_date: fuelDate,
      });

      // 2️⃣ Trigger analysis (same day)
      await api.runFuelAnalysis({
        vehicle_id: vehicleId,
        route_id: null, // backend resolves active route
        date: fuelDate,
      });

      setMessage('Fuel entry saved & analyzed successfully');
      setFuelQty('');
    } catch (err) {
      setMessage(err.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-xl space-y-6">
      <h2 className="text-xl font-semibold">Fuel Entry</h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          value={vehicleId}
          onChange={(e) => setVehicleId(e.target.value)}
          required
        >
          <option value="">Select Vehicle</option>
          {vehicles.map((v) => (
            <option key={v.vehicle_id} value={v.vehicle_id}>
              {v.vehicle_number}
            </option>
          ))}
        </select>

        <input
          type="number"
          step="0.01"
          placeholder="Fuel Quantity (liters)"
          value={fuelQty}
          onChange={(e) => setFuelQty(e.target.value)}
          required
        />

        <input
          type="date"
          value={fuelDate}
          onChange={(e) => setFuelDate(e.target.value)}
          required
        />

        <button disabled={loading}>
          {loading ? 'Saving...' : 'Submit Fuel Entry'}
        </button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
