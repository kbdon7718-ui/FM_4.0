import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Loader2,
  AlertCircle,
  CheckCircle2,
  Droplet,
  Calendar,
  Truck,
  Plus
} from 'lucide-react';
import api from '@/services/api';

/**
 * Supervisor Fuel Entry + Add Vehicle
 * Supervisor can:
 * - Add vehicle
 * - Enter fuel
 * - NO analysis shown
 */
export function FuelEntry() {
  /* -------------------- STATE -------------------- */
  const [vehicles, setVehicles] = useState([]);
  const [vehicleId, setVehicleId] = useState('');

  // Fuel
  const [fuelQty, setFuelQty] = useState('');
  const [fuelDate, setFuelDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Add vehicle
  const [showAddVehicle, setShowAddVehicle] = useState(false);
  const [vehicleNumber, setVehicleNumber] = useState('');
  const [vehicleType, setVehicleType] = useState('');

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('');

  /* -------------------- LOAD VEHICLES -------------------- */
  useEffect(() => {
    loadVehicles();
  }, []);

  async function loadVehicles() {
    try {
      const data = await api.getVehicles();
      setVehicles(data || []);
    } catch (err) {
      console.error('Vehicle load failed', err);
    }
  }

  /* -------------------- ADD VEHICLE -------------------- */
  async function handleAddVehicle(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await api.createVehicle({
        vehicle_number: vehicleNumber,
        vehicle_type: vehicleType,
      });

      setMessageType('success');
      setMessage('✓ Vehicle added successfully');
      setVehicleNumber('');
      setVehicleType('');
      setShowAddVehicle(false);

      await loadVehicles();
    } catch (err) {
      setMessageType('error');
      setMessage(err?.message || 'Failed to add vehicle');
    } finally {
      setLoading(false);
    }
  }

  /* -------------------- FUEL ENTRY -------------------- */
  async function handleFuelSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Save fuel
      await api.createFuelEntry({
        vehicle_id: vehicleId,
        fuel_quantity: Number(fuelQty),
        fuel_date: fuelDate,
      });

      // Trigger backend logic (no UI output)
      await api.runFuelAnalysis({
        vehicle_id: vehicleId,
        route_id: null,
        date: fuelDate,
      });

      setMessageType('success');
      setMessage('✓ Fuel entry saved');
      setFuelQty('');
      setVehicleId('');
    } catch (err) {
      setMessageType('error');
      setMessage(err?.message || 'Fuel entry failed');
    } finally {
      setLoading(false);
    }
  }

  /* -------------------- UI -------------------- */
  return (
    <div className="p-8 max-w-3xl space-y-8">
      <h1 className="text-3xl font-bold">Supervisor Portal</h1>

      {/* ---------------- ADD VEHICLE ---------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5 text-green-600" />
            Add New Vehicle
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAddVehicle} className="space-y-4">
            <Input
              placeholder="Vehicle Number (e.g. HR55AN2175)"
              value={vehicleNumber}
              onChange={(e) => setVehicleNumber(e.target.value)}
              required
            />
            <Input
              placeholder="Vehicle Type (Bus / Mini Bus)"
              value={vehicleType}
              onChange={(e) => setVehicleType(e.target.value)}
            />
            <Button
              type="submit"
              disabled={loading}
              className="bg-green-600 hover:bg-green-700"
            >
              {loading ? 'Saving...' : 'Add Vehicle'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* ---------------- FUEL ENTRY ---------------- */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Droplet className="h-5 w-5 text-blue-600" />
            Fuel Entry
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleFuelSubmit} className="space-y-5">
            {/* Vehicle */}
            <select
              value={vehicleId}
              onChange={(e) => setVehicleId(e.target.value)}
              required
              className="w-full px-4 py-2 border rounded-lg"
            >
              <option value="">Select Vehicle</option>
              {vehicles.map((v) => (
                <option key={v.vehicle_id} value={v.vehicle_id}>
                  {v.vehicle_number}
                </option>
              ))}
            </select>

            {/* Fuel */}
            <Input
              type="number"
              step="0.01"
              placeholder="Fuel (Liters)"
              value={fuelQty}
              onChange={(e) => setFuelQty(e.target.value)}
              required
            />

            {/* Date */}
            <Input
              type="date"
              value={fuelDate}
              onChange={(e) => setFuelDate(e.target.value)}
              required
            />

            {/* Message */}
            {message && (
              <div
                className={`p-3 rounded ${
                  messageType === 'success'
                    ? 'bg-green-50 text-green-700'
                    : 'bg-red-50 text-red-700'
                }`}
              >
                {message}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Submit Fuel Entry'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default FuelEntry;
