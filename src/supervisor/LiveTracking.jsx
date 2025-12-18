import { useEffect, useState } from 'react';
import VehicleMap from '../components/map/VehicleMap.jsx';
import { getLatestTelemetry } from '../services/api.js';

export function LiveTracking() {
  const [vehicles, setVehicles] = useState([]);

  useEffect(() => {
    getLatestTelemetry()
      .then(setVehicles)
      .catch(console.error);
  }, []);

  return (
    <div className="h-full">
      <VehicleMap
        vehicles={vehicles}
        center={[28.6139, 77.209]}
        zoom={6}
      />
    </div>
  );
}
