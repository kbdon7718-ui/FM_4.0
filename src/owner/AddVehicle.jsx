import { useState } from 'react';

const YEARS = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i
);

const STATES = [
  'MH','DL','KA','TN','GJ','RJ','UP','MP','PB','HR',
  'WB','BR','OD','CG','TS','AP','KL','GA','AS','JK'
];

export default function AddVehicle() {
  const [form, setForm] = useState({
    vehicle_number: '',
    vehicle_type: '',
    manufacturer: '',
    model: '',
    manufacturing_year: '',
    registration_state: '',
    fuel_type: '',
    tank_capacity: '',
    gps_provider: '',
    gps_device_id: '',
  });

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value.toUpperCase() });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const payload = {
        ...form,
        manufacturing_year: form.manufacturing_year
          ? Number(form.manufacturing_year)
          : null,
        tank_capacity: form.tank_capacity
          ? Number(form.tank_capacity)
          : null,
      };

      const res = await fetch('http://localhost:5002/api/vehicles', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');

      setMessage('✅ Vehicle added successfully');

      setForm({
        vehicle_number: '',
        vehicle_type: '',
        manufacturer: '',
        model: '',
        manufacturing_year: '',
        registration_state: '',
        fuel_type: '',
        tank_capacity: '',
        gps_provider: '',
        gps_device_id: '',
      });
    } catch (err) {
      setMessage('❌ ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow">
      <h2 className="text-2xl font-semibold mb-6">
        Add Vehicle
      </h2>

      <form onSubmit={handleSubmit} className="space-y-6">

        {/* BASIC */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            BASIC DETAILS
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <input
              name="vehicle_number"
              placeholder="Vehicle No (MH12AB1234) – optional"
              value={form.vehicle_number}
              onChange={handleChange}
              className="input"
            />

            <select
              name="vehicle_type"
              value={form.vehicle_type}
              onChange={handleChange}
              className="input"
              required
            >
              <option value="">Select Vehicle Type</option>
              <option value="BUS">Bus</option>
              <option value="CAB">Cab</option>
            </select>

            <input
              name="manufacturer"
              placeholder="Manufacturer (optional)"
              value={form.manufacturer}
              onChange={handleChange}
              className="input"
            />

            <input
              name="model"
              placeholder="Model (optional)"
              value={form.model}
              onChange={handleChange}
              className="input"
            />

            <select
              name="manufacturing_year"
              value={form.manufacturing_year}
              onChange={handleChange}
              className="input"
            >
              <option value="">Manufacturing Year</option>
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>

            <select
              name="registration_state"
              value={form.registration_state}
              onChange={handleChange}
              className="input"
            >
              <option value="">Registration State</option>
              {STATES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </section>

        {/* FUEL */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            FUEL DETAILS
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <select
              name="fuel_type"
              value={form.fuel_type}
              onChange={handleChange}
              className="input"
            >
              <option value="">Fuel Type</option>
              <option value="DIESEL">Diesel</option>
              <option value="PETROL">Petrol</option>
              <option value="CNG">CNG</option>
              <option value="EV">EV</option>
            </select>

            <input
              type="number"
              name="tank_capacity"
              placeholder="Tank Capacity (Liters)"
              value={form.tank_capacity}
              onChange={handleChange}
              className="input"
            />
          </div>
        </section>

        {/* GPS */}
        <section>
          <h3 className="text-sm font-semibold text-gray-500 mb-3">
            GPS (OPTIONAL)
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <input
              name="gps_provider"
              placeholder="GPS Provider (optional)"
              value={form.gps_provider}
              onChange={handleChange}
              className="input"
            />

            <input
              name="gps_device_id"
              placeholder="GPS Device ID / IMEI (optional)"
              value={form.gps_device_id}
              onChange={handleChange}
              className="input"
            />
          </div>
        </section>

        {/* ACTION */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700"
          >
            {loading ? 'Saving...' : 'Add Vehicle'}
          </button>

          {message && <span className="text-sm">{message}</span>}
        </div>
      </form>

      <style>{`
        .input {
          border: 1px solid #cbd5e1;
          padding: 10px 12px;
          border-radius: 8px;
          font-size: 14px;
        }
        .input:focus {
          border-color: #10b981;
          outline: none;
        }
      `}</style>
    </div>
  );
}
