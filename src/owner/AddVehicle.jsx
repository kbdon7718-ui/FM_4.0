import { useEffect, useState } from 'react';
import api from '../services/api.js';

const YEARS = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i
);

const STATES = [
  'MH','DL','KA','TN','GJ','RJ','UP','MP','PB','HR',
  'WB','BR','OD','CG','TS','AP','KL','GA','AS','JK'
];

export default function AddVehicle({ owner }) {
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
  const [vehicles, setVehicles] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  // Fetch vehicles
  const fetchVehicles = async () => {
    setFetching(true);
    try {
      const data = await api.getOwnerVehicles(owner?.owner_id);
      setVehicles(data);
    } catch (err) {
      setMessage('❌ Failed to fetch vehicles');
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  /* =========================
     HANDLE CHANGE (SMART)
  ========================= */
  const handleChange = (e) => {
    const { name, value } = e.target;

    // only vehicle number & state uppercase
    if (name === 'vehicle_number' || name === 'registration_state') {
      setForm({ ...form, [name]: value.toUpperCase() });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  /* =========================
     SUBMIT
  ========================= */
  // Delete vehicle
  const handleDelete = async (id) => {
    if (!window.confirm('Delete this vehicle?')) return;
    setEditLoading(true);
    setEditMessage('');
    try {
      await api.deleteOwnerVehicle(id, owner.owner_id);
      setEditMessage('✅ Vehicle deleted');
      fetchVehicles();
    } catch (err) {
      setEditMessage('❌ Failed to delete');
    } finally {
      setEditLoading(false);
    }
  };

  // Start editing
  const startEdit = (v) => {
    setEditId(v.vehicle_id);
    setEditForm({ ...v });
    setEditMessage('');
  };

  // Handle edit form change
  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm((f) => ({ ...f, [name]: value }));
  };

  // Submit edit
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    setEditLoading(true);
    setEditMessage('');
    try {
      await api.updateOwnerVehicle(editId, editForm, owner.owner_id);
      setEditMessage('✅ Vehicle updated');
      setEditId(null);
      fetchVehicles();
    } catch (err) {
      setEditMessage('❌ Failed to update');
    } finally {
      setEditLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!form.vehicle_type) {
      setMessage('❌ Vehicle type is required');
      setLoading(false);
      return;
    }

    if (!owner?.owner_id) {
      setMessage('❌ Owner not found. Please re-login.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        owner_id: owner.owner_id, // 🔥 REQUIRED
        manufacturing_year: form.manufacturing_year
          ? Number(form.manufacturing_year)
          : null,
        tank_capacity: form.tank_capacity
          ? Number(form.tank_capacity)
          : null,
      };

      const data = await api.createVehicle(payload, owner.owner_id);
      if (!data?.success) {
        throw new Error(data?.error || 'Failed to add vehicle');
      }

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
      fetchVehicles();
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
              placeholder="Vehicle No (MH12AB1234)"
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
              <option value="TRUCK">Truck</option>
            </select>

            <input
              name="manufacturer"
              placeholder="Manufacturer"
              value={form.manufacturer}
              onChange={handleChange}
              className="input"
            />

            <input
              name="model"
              placeholder="Model"
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
              placeholder="GPS Provider"
              value={form.gps_provider}
              onChange={handleChange}
              className="input"
            />

            <input
              name="gps_device_id"
              placeholder="GPS Device ID / IMEI"
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

      {/* VEHICLE LIST */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-4">Your Vehicles</h3>
        {fetching ? (
          <div>Loading vehicles…</div>
        ) : vehicles.length === 0 ? (
          <div className="text-gray-500">No vehicles found.</div>
        ) : (
          <table className="w-full text-sm border">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2">Number</th>
                <th>Type</th>
                <th>Manufacturer</th>
                <th>Model</th>
                <th>Year</th>
                <th>State</th>
                <th>Fuel</th>
                <th>Tank</th>
                <th>GPS</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.vehicle_id} className="border-t">
                  {editId === v.vehicle_id ? (
                    <>
                      <td><input name="vehicle_number" value={editForm.vehicle_number} onChange={handleEditChange} className="input w-28" /></td>
                      <td><input name="vehicle_type" value={editForm.vehicle_type} onChange={handleEditChange} className="input w-20" /></td>
                      <td><input name="manufacturer" value={editForm.manufacturer} onChange={handleEditChange} className="input w-20" /></td>
                      <td><input name="model" value={editForm.model} onChange={handleEditChange} className="input w-20" /></td>
                      <td><input name="manufacturing_year" value={editForm.manufacturing_year} onChange={handleEditChange} className="input w-16" /></td>
                      <td><input name="registration_state" value={editForm.registration_state} onChange={handleEditChange} className="input w-12" /></td>
                      <td><input name="fuel_type" value={editForm.fuel_type} onChange={handleEditChange} className="input w-14" /></td>
                      <td><input name="tank_capacity" value={editForm.tank_capacity} onChange={handleEditChange} className="input w-14" /></td>
                      <td><input name="gps_provider" value={editForm.gps_provider} onChange={handleEditChange} className="input w-16" /></td>
                      <td className="flex gap-2">
                        <button onClick={handleEditSubmit} className="px-2 py-1 bg-emerald-600 text-white rounded">Save</button>
                        <button onClick={() => setEditId(null)} className="px-2 py-1 bg-gray-300 rounded">Cancel</button>
                      </td>
                    </>
                  ) : (
                    <>
                      <td>{v.vehicle_number}</td>
                      <td>{v.vehicle_type}</td>
                      <td>{v.manufacturer}</td>
                      <td>{v.model}</td>
                      <td>{v.manufacturing_year}</td>
                      <td>{v.registration_state}</td>
                      <td>{v.fuel_type}</td>
                      <td>{v.tank_capacity}</td>
                      <td>{v.gps_provider}</td>
                      <td className="flex gap-2">
                        <button onClick={() => startEdit(v)} className="px-2 py-1 bg-blue-600 text-white rounded">Edit</button>
                        <button onClick={() => handleDelete(v.vehicle_id)} className="px-2 py-1 bg-red-600 text-white rounded">Delete</button>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {editMessage && <div className="mt-2 text-sm">{editMessage}</div>}
      </div>
    </div>
  );
}
