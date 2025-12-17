import { useState, useEffect } from 'react';
import { getVehicles, getVehicleTelemetry } from '../services/api';

// Demo data for fallback when API fails
const demoVehicles = [
  {
    id: '1',
    number: 'HR55AN2175',
    manufacturer: 'tata',
    status: 'moving',
    statusText: 'Active',
    speed: 42,
    position: { top: '35%', left: '44%' },
    lat: 28.4595,
    lng: 77.0266,
    rotation: 45,
    address: 'Sector 18, Gurugram, Haryana',
    lastUpdated: '2 mins ago',
    todayTrips: 3,
    todayDistance: '124 km',
    totalKm: '5000 km',
    driverName: 'John Doe',
    driverMobile: '9876543210',
    serviceDue: '15 days',
    insurance: { status: 'valid', expiryDate: '15 Jan 2026', daysRemaining: 61 },
    pollution: { status: 'valid', expiryDate: '10 Feb 2026', daysRemaining: 87 },
    fitness: { status: 'valid', expiryDate: '20 Mar 2026', daysRemaining: 125 },
    dieselExpense: { today: '₹1,850', thisMonth: '₹45,200' },
  },
  {
    id: '2',
    number: 'HR47E2573',
    manufacturer: 'ashok',
    status: 'stopped',
    statusText: 'Stopped',
    speed: 0,
    position: { top: '40%', left: '50%' },
    lat: 28.4089,
    lng: 77.0419,
    rotation: 0,
    address: 'IFFCO Chowk, Gurugram, Haryana',
    lastUpdated: '15 mins ago',
    todayTrips: 2,
    todayDistance: '87 km',
    totalKm: '4500 km',
    driverName: 'Jane Smith',
    driverMobile: '9876543211',
    serviceDue: '20 days',
    insurance: { status: 'expiring', expiryDate: '25 Nov 2025', daysRemaining: 10 },
    pollution: { status: 'valid', expiryDate: '15 Jan 2026', daysRemaining: 61 },
    fitness: { status: 'valid', expiryDate: '28 Feb 2026', daysRemaining: 105 },
    dieselExpense: { today: '₹0', thisMonth: '₹38,500' },
  },
];

// Map positions for vehicles on static map
const mapPositions = [
  { top: '35%', left: '44%' },
  { top: '40%', left: '50%' },
  { top: '38%', left: '54%' },
  { top: '52%', left: '38%' },
  { top: '65%', left: '48%' },
  { top: '33%', left: '46%' },
  { top: '62%', left: '52%' },
  { top: '36%', left: '52%' },
  { top: '48%', left: '40%' },
  { top: '30%', left: '48%' },
  { top: '58%', left: '45%' },
  { top: '42%', left: '56%' },
  { top: '55%', left: '42%' },
  { top: '32%', left: '42%' },
  { top: '60%', left: '55%' },
  { top: '45%', left: '35%' },
  { top: '70%', left: '50%' },
  { top: '28%', left: '55%' },
  { top: '68%', left: '58%' },
  { top: '25%', left: '45%' },
];

const statuses = ['moving', 'stopped', 'idling'];
const manufacturers = ['tata', 'ashok', 'militrack'];

// Transform backend vehicle data to frontend format
function transformVehicle(vehicle, index) {
  const statusIdx = index % statuses.length;
  const status = statuses[statusIdx];
  const position = mapPositions[index % mapPositions.length];
  
  return {
    id: vehicle.id,
    number: vehicle.registrationNo || `VEHICLE-${index + 1}`,
    manufacturer: manufacturers[index % manufacturers.length],
    status: status,
    statusText: status === 'moving' ? 'Active' : status === 'stopped' ? 'Stopped' : 'Idle',
    speed: status === 'moving' ? Math.floor(Math.random() * 60) + 20 : 0,
    position: position,
    lat: vehicle.lastLat || 28.4595 + (Math.random() - 0.5) * 0.5,
    lng: vehicle.lastLng || 77.0266 + (Math.random() - 0.5) * 0.5,
    rotation: Math.floor(Math.random() * 360),
    address: getAddressFromLocation(vehicle.lastLat, vehicle.lastLng),
    lastUpdated: getTimeAgo(vehicle.lastSeen),
    todayTrips: Math.floor(Math.random() * 5) + 1,
    todayDistance: `${Math.floor(Math.random() * 200) + 50} km`,
    totalKm: `${vehicle.odometer || Math.floor(Math.random() * 10000)} km`,
    driverName: `Driver ${index + 1}`,
    driverMobile: `98765432${10 + index}`,
    serviceDue: `${Math.floor(Math.random() * 30) + 5} days`,
    vehicleModel: vehicle.model || 'Standard',
    make: vehicle.make,
    year: vehicle.year,
    imei: vehicle.imei,
    fuelCapacity: vehicle.fuelCapacity,
    insurance: { status: 'valid', expiryDate: '15 Jan 2026', daysRemaining: 61 },
    pollution: { status: 'valid', expiryDate: '10 Feb 2026', daysRemaining: 87 },
    fitness: { status: 'valid', expiryDate: '20 Mar 2026', daysRemaining: 125 },
    tax: { status: 'paid', nextDueDate: '30 Mar 2026', amount: '₹12,500' },
    dieselExpense: { today: `₹${Math.floor(Math.random() * 2000) + 500}`, thisMonth: `₹${Math.floor(Math.random() * 50000) + 20000}` },
    tyreExpense: { lastReplacement: '5 Oct 2025', cost: '₹28,000' },
  };
}

function getAddressFromLocation(lat, lng) {
  const addresses = [
    'Sector 18, Gurugram, Haryana',
    'IFFCO Chowk, Gurugram, Haryana',
    'Greater Noida Industrial Area, UP',
    'Pithampur Industrial Area, MP',
    'Pune Industrial Estate, MH',
    'Manesar Industrial Hub, Haryana',
    'Mumbai Port Area, MH',
    'Noida Sector 62, UP',
    'Indore Ring Road, MP',
    'Delhi NCR Highway, Delhi',
  ];
  return addresses[Math.floor(Math.random() * addresses.length)];
}

function getTimeAgo(date) {
  if (!date) return 'Unknown';
  const now = new Date();
  const past = new Date(date);
  const diffMs = now - past;
  const diffMins = Math.floor(diffMs / 60000);
  
  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} mins ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours} hours ago`;
  return `${Math.floor(diffHours / 24)} days ago`;
}

export function useVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isUsingDemoData, setIsUsingDemoData] = useState(false);

  useEffect(() => {
    async function fetchVehicles() {
      try {
        setLoading(true);
        const response = await getVehicles();
        
        if (response.data && response.data.length > 0) {
          const transformedVehicles = response.data.map((v, idx) => transformVehicle(v, idx));
          setVehicles(transformedVehicles);
          setIsUsingDemoData(false);
        } else {
          // No vehicles in DB, use demo data
          setVehicles(demoVehicles);
          setIsUsingDemoData(true);
        }
      } catch (err) {
        console.error('Failed to fetch vehicles:', err);
        setError(err.message);
        // Fallback to demo data on error
        setVehicles(demoVehicles);
        setIsUsingDemoData(true);
      } finally {
        setLoading(false);
      }
    }

    fetchVehicles();
    
    // Refresh every 30 seconds
    const interval = setInterval(fetchVehicles, 30000);
    return () => clearInterval(interval);
  }, []);

  const getVehicleById = (id) => vehicles.find(v => v.id === id);
  
  const getVehiclesByStatus = (status) => {
    if (status === 'all') return vehicles;
    return vehicles.filter(v => v.status === status);
  };

  const stats = {
    total: vehicles.length,
    moving: vehicles.filter(v => v.status === 'moving').length,
    stopped: vehicles.filter(v => v.status === 'stopped').length,
    idling: vehicles.filter(v => v.status === 'idling').length,
  };

  return {
    vehicles,
    loading,
    error,
    isUsingDemoData,
    getVehicleById,
    getVehiclesByStatus,
    stats,
    refresh: () => {
      setLoading(true);
      // Trigger re-fetch
    }
  };
}

export default useVehicles;
