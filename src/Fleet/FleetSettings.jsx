
import { useState } from 'react';
import { API_BASE_URL } from '../services/apiBase';
import { PageHeader, PageHeaderTitle, PageHeaderDescription } from '../components/ui/page-header.jsx';
import { SectionCard, SectionCardHeader, SectionCardContent } from '../components/ui/section-card.jsx';
import { Button } from '../components/ui/button.jsx';


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
    <div className="space-y-6">
      <PageHeader>
        <div>
          <PageHeaderTitle>Settings</PageHeaderTitle>
          <PageHeaderDescription>
            Assign your vehicle number to enable live location updates
          </PageHeaderDescription>
        </div>
      </PageHeader>

      <SectionCard className="max-w-xl">
        <SectionCardHeader title="Assign vehicle" description="Enter the vehicle number provided by your supervisor" />
        <SectionCardContent className="p-4 sm:p-6 space-y-4">
          <input
            className="w-full h-11 rounded-md border border-border bg-background px-3 text-sm text-foreground shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            placeholder="Vehicle Number (e.g. HR55AN2175)"
            value={vehicleNumber}
            onChange={(e) => setVehicleNumber(e.target.value)}
          />

          {error && (
            <div className="text-sm text-destructive" role="alert">
              {error}
            </div>
          )}

          <Button
            type="button"
            onClick={submit}
            disabled={loading || !vehicleNumber}
            className="w-full"
            aria-busy={loading}
          >
            {loading ? 'Saving…' : 'Save Vehicle'}
          </Button>
        </SectionCardContent>
      </SectionCard>
    </div>
  );
}
