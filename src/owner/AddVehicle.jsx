import { useEffect, useState } from 'react';
import api from '../services/api.js';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '../components/ui/page-header.jsx';
import { SectionCard, SectionCardHeader, SectionCardContent } from '../components/ui/section-card.jsx';
import { Button } from '../components/ui/button.jsx';

const YEARS = Array.from(
  { length: 30 },
  (_, i) => new Date().getFullYear() - i
);

const STATES = [
  'MH','DL','KA','TN','GJ','RJ','UP','MP','PB','HR',
  'WB','BR','OD','CG','TS','AP','KL','GA','AS','JK'
];

export default function AddVehicle({ owner }) {
  const ownerId = owner?.owner_id || owner?.ownerId || owner?.id || null;

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
  const [millitrackDevices, setMillitrackDevices] = useState([]);
  const [selectedMillitrackDeviceId, setSelectedMillitrackDeviceId] = useState('');
  const [millitrackLoading, setMillitrackLoading] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [editLoading, setEditLoading] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  // Fetch vehicles
  const fetchVehicles = async () => {
    if (!ownerId) return;
    setFetching(true);
    try {
      const data = await api.getOwnerVehicles(ownerId);
      setVehicles(data);
    } catch (err) {
      setMessage('❌ ' + (err?.message || 'Failed to fetch vehicles'));
    } finally {
      setFetching(false);
    }
  };

  const handleMillitrackSelect = (e) => {
    const deviceId = e.target.value;
    setSelectedMillitrackDeviceId(deviceId);

    if (!deviceId) return;
    const selected = millitrackDevices.find(d => String(d.gps_device_id) === String(deviceId));
    if (!selected) return;

    setForm((prev) => ({
      ...prev,
      vehicle_number: String(selected.vehicle_number || '').toUpperCase(),
      gps_device_id: String(selected.gps_device_id || ''),
      gps_provider: 'MILLITRACK',
    }));
  };

  useEffect(() => {
    if (!ownerId) return;
    fetchVehicles();
  }, [ownerId]);

  useEffect(() => {
    const loadMillitrack = async () => {
      if (!ownerId) return;
      setMillitrackLoading(true);
      try {
        const devices = await api.getMillitrackDevices(ownerId);
        setMillitrackDevices(Array.isArray(devices) ? devices : []);
      } catch (err) {
        setMillitrackDevices([]);
      } finally {
        setMillitrackLoading(false);
      }
    };

    loadMillitrack();
  }, [ownerId]);

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
    if (!ownerId) {
      setEditMessage('❌ Owner not found. Please re-login.');
      return;
    }
    setEditLoading(true);
    setEditMessage('');
    try {
      await api.deleteOwnerVehicle(id, ownerId);
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
    if (!ownerId) {
      setEditMessage('❌ Owner not found. Please re-login.');
      return;
    }
    setEditLoading(true);
    setEditMessage('');
    try {
      await api.updateOwnerVehicle(editId, editForm, ownerId);
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

    if (!ownerId) {
      setMessage('❌ Owner not found. Please re-login.');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        ...form,
        owner_id: ownerId, // 🔥 REQUIRED
        manufacturing_year: form.manufacturing_year
          ? Number(form.manufacturing_year)
          : null,
        tank_capacity: form.tank_capacity
          ? Number(form.tank_capacity)
          : null,
      };

      const data = await api.createVehicle(payload, ownerId);
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
    <div className="space-y-6">
      <PageHeader>
        <div>
          <PageHeaderTitle>Add Vehicle</PageHeaderTitle>
          <PageHeaderDescription>Create, edit, and manage your vehicles</PageHeaderDescription>
        </div>
      </PageHeader>

      <SectionCard>
        <SectionCardHeader
          title="Vehicle details"
          description="Add a new vehicle to your fleet. GPS fields are optional."
        />
        <SectionCardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-6">

        {/* BASIC */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            BASIC DETAILS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              value={selectedMillitrackDeviceId}
              onChange={handleMillitrackSelect}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
              disabled={millitrackLoading || !owner?.owner_id}
            >
              <option value="">Select Vehicle No (from Millitrack)</option>
              {millitrackDevices.map((d) => (
                <option key={d.gps_device_id} value={d.gps_device_id}>
                  {d.vehicle_number}
                </option>
              ))}
            </select>

            <input
              name="vehicle_number"
              placeholder="Vehicle No (MH12AB1234)"
              value={form.vehicle_number}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />

            <select
              name="vehicle_type"
              value={form.vehicle_type}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />

            <input
              name="model"
              placeholder="Model"
              value={form.model}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />

            <select
              name="manufacturing_year"
              value={form.manufacturing_year}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
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
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            FUEL DETAILS
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <select
              name="fuel_type"
              value={form.fuel_type}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
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
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </section>

        {/* GPS */}
        <section>
          <h3 className="text-sm font-semibold text-muted-foreground mb-3">
            GPS (OPTIONAL)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <input
              name="gps_provider"
              placeholder="GPS Provider"
              value={form.gps_provider}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />

            <input
              name="gps_device_id"
              placeholder="GPS Device ID / IMEI"
              value={form.gps_device_id}
              onChange={handleChange}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
            />
          </div>
        </section>

        {/* ACTION */}
        <div className="flex items-center gap-4">
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving...' : 'Add Vehicle'}
          </Button>

          {message && <span className="text-sm text-muted-foreground">{message}</span>}
        </div>
          </form>
        </SectionCardContent>
      </SectionCard>

      {/* VEHICLE LIST */}
      <SectionCard>
        <SectionCardHeader title="Your Vehicles" description="View, edit, or delete existing vehicles" />
        <SectionCardContent className="p-0">
          {fetching ? (
            <div className="p-4 text-sm text-muted-foreground">Loading vehicles…</div>
          ) : vehicles.length === 0 ? (
            <div className="p-4 text-sm text-muted-foreground">No vehicles found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-muted/40 text-muted-foreground">
                    <th className="p-3 text-left font-medium">Number</th>
                    <th className="p-3 text-left font-medium">Type</th>
                    <th className="p-3 text-left font-medium">Manufacturer</th>
                    <th className="p-3 text-left font-medium">Model</th>
                    <th className="p-3 text-left font-medium">Year</th>
                    <th className="p-3 text-left font-medium">State</th>
                    <th className="p-3 text-left font-medium">Fuel</th>
                    <th className="p-3 text-left font-medium">Tank</th>
                    <th className="p-3 text-left font-medium">GPS</th>
                    <th className="p-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {vehicles.map((v) => (
                    <tr key={v.vehicle_id} className="border-t border-border">
                      {editId === v.vehicle_id ? (
                        <>
                          <td className="p-3">
                            <input name="vehicle_number" value={editForm.vehicle_number} onChange={handleEditChange} className="w-36 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" />
                          </td>
                          <td className="p-3">
                            <input name="vehicle_type" value={editForm.vehicle_type} onChange={handleEditChange} className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" />
                          </td>
                          <td className="p-3">
                            <input name="manufacturer" value={editForm.manufacturer} onChange={handleEditChange} className="w-28 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" />
                          </td>
                          <td className="p-3">
                            <input name="model" value={editForm.model} onChange={handleEditChange} className="w-28 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" />
                          </td>
                          <td className="p-3">
                            <input name="manufacturing_year" value={editForm.manufacturing_year} onChange={handleEditChange} className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" />
                          </td>
                          <td className="p-3">
                            <input name="registration_state" value={editForm.registration_state} onChange={handleEditChange} className="w-16 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" />
                          </td>
                          <td className="p-3">
                            <input name="fuel_type" value={editForm.fuel_type} onChange={handleEditChange} className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" />
                          </td>
                          <td className="p-3">
                            <input name="tank_capacity" value={editForm.tank_capacity} onChange={handleEditChange} className="w-20 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" />
                          </td>
                          <td className="p-3">
                            <input name="gps_provider" value={editForm.gps_provider} onChange={handleEditChange} className="w-24 rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring" />
                          </td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <Button onClick={handleEditSubmit} disabled={editLoading} size="sm">Save</Button>
                              <Button onClick={() => setEditId(null)} variant="outline" size="sm">Cancel</Button>
                            </div>
                          </td>
                        </>
                      ) : (
                        <>
                          <td className="p-3 text-foreground">{v.vehicle_number}</td>
                          <td className="p-3 text-foreground">{v.vehicle_type}</td>
                          <td className="p-3 text-foreground">{v.manufacturer}</td>
                          <td className="p-3 text-foreground">{v.model}</td>
                          <td className="p-3 text-foreground">{v.manufacturing_year}</td>
                          <td className="p-3 text-foreground">{v.registration_state}</td>
                          <td className="p-3 text-foreground">{v.fuel_type}</td>
                          <td className="p-3 text-foreground">{v.tank_capacity}</td>
                          <td className="p-3 text-foreground">{v.gps_provider}</td>
                          <td className="p-3">
                            <div className="flex justify-end gap-2">
                              <Button onClick={() => startEdit(v)} variant="outline" size="sm">Edit</Button>
                              <Button onClick={() => handleDelete(v.vehicle_id)} variant="destructive" size="sm">Delete</Button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {editMessage && <div className="p-4 pt-2 text-sm text-muted-foreground">{editMessage}</div>}
        </SectionCardContent>
      </SectionCard>
    </div>
  );
}
