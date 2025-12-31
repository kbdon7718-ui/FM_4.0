import { useEffect, useState } from 'react';
import api from '../services/api';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '../components/ui/page-header.jsx';
import { SectionCard, SectionCardHeader, SectionCardContent } from '../components/ui/section-card.jsx';
import { Button } from '../components/ui/button.jsx';

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
      const sessionRaw = localStorage.getItem('fm_session_v1');
      const ownerId = sessionRaw ? JSON.parse(sessionRaw)?.user?.owner_id : null;
      const data = ownerId ? await api.getOwnerVehicles(ownerId) : [];
      setVehicles(Array.isArray(data) ? data : []);
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
    <div className="w-full max-w-3xl space-y-6">
      <PageHeader>
        <div>
          <PageHeaderTitle>Fuel Entry</PageHeaderTitle>
          <PageHeaderDescription>Log fuel given and trigger same-day mileage analysis</PageHeaderDescription>
        </div>
      </PageHeader>

      <SectionCard>
        <SectionCardHeader title="New fuel entry" description="Select a vehicle, enter fuel quantity, and save." />
        <SectionCardContent className="p-4 sm:p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="sm:col-span-3">
                <label className="mb-2 block text-sm font-medium text-foreground">Vehicle</label>
                <select
                  value={vehicleId}
                  onChange={(e) => setVehicleId(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <option value="">Select Vehicle</option>
                  {vehicles.map((v) => (
                    <option key={v.vehicle_id} value={v.vehicle_id}>
                      {v.vehicle_number}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Fuel quantity (L)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 24.5"
                  value={fuelQty}
                  onChange={(e) => setFuelQty(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-foreground">Date</label>
                <input
                  type="date"
                  value={fuelDate}
                  onChange={(e) => setFuelDate(e.target.value)}
                  required
                  className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground shadow-sm outline-none ring-offset-background focus-visible:ring-2 focus-visible:ring-ring"
                />
              </div>

              <div className="flex items-end">
                <Button className="w-full" disabled={loading || !vehicleId}>
                  {loading ? 'Saving...' : 'Submit Fuel Entry'}
                </Button>
              </div>
            </div>

            {message && (
              <div className="text-sm text-muted-foreground">{message}</div>
            )}
          </form>
        </SectionCardContent>
      </SectionCard>
    </div>
  );
}
