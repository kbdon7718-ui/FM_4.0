/**
 * API Service for FleetMaster Pro
 * Frontend → Backend connector
 * Backend = Node.js + Express
 */

import axios from 'axios';

/* ================================
   BASE CONFIG
================================ */
/* ================================
   BASE CONFIG
================================ */
const BASE_URL =
  import.meta.env.VITE_API_URL || 'http://localhost:5002';

const API_BASE_URL = BASE_URL.endsWith('/api')
  ? BASE_URL
  : `${BASE_URL}/api`;

  
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

/* ================================
   TOKEN MANAGEMENT
================================ */
export const getToken = () =>
  localStorage.getItem('authToken');

export const setToken = (token) =>
  localStorage.setItem('authToken', token);

export const removeToken = () =>
  localStorage.removeItem('authToken');

export const getStoredUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const setStoredUser = (user) =>
  localStorage.setItem('user', JSON.stringify(user));

export const removeStoredUser = () =>
  localStorage.removeItem('user');

/* ================================
   AXIOS INTERCEPTORS
================================ */
apiClient.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      removeToken();
      removeStoredUser();
      window.location.href = '/login';
    }
    return Promise.reject(
      error.response?.data || error.message
    );
  }
);

/* ================================
   AUTH API
================================ */
export const login = async (email, password) => {
  const { data } = await apiClient.post('/auth/login', {
    email,
    password,
  });

  if (data.token) {
    setToken(data.token);
    setStoredUser(data.user);
  }

  return data;
};


export const getOwnerDashboard = async () => {
  const { data } = await apiClient.get('/owner/dashboard');
  return data;
};


export const logout = () => {
  removeToken();
  removeStoredUser();
  window.location.href = '/login';
};

export const getCurrentUser = async () => {
  const { data } = await apiClient.get('/auth/me');
  return data;
};

/* ================================
   VEHICLES
================================ */
export const getVehicles = async () => {
  const { data } = await apiClient.get('/vehicles');
  return data;
};

export const getOwnerVehicles = async (ownerId) => {
  const { data } = await apiClient.get('/owner/vehicles', {
    headers: {
      'x-role': 'OWNER',
      'x-owner-id': ownerId,
    },
  });
  return data;
};

/* ================================
   OWNER - ADD VEHICLE
   Backend expects x-role: OWNER and x-owner-id header
================================ */
export const createVehicle = async (payload, ownerId) => {
  const { data } = await apiClient.post('/owner/vehicles', payload, {
    headers: {
      'x-role': 'OWNER',
      'x-owner-id': ownerId,
    },
  });
  return data;
};

export const updateOwnerVehicle = async (vehicleId, payload, ownerId) => {
  const { data } = await apiClient.put(`/owner/vehicles/${vehicleId}`, payload, {
    headers: {
      'x-role': 'OWNER',
      'x-owner-id': ownerId,
    },
  });
  return data;
};

export const deleteOwnerVehicle = async (vehicleId, ownerId) => {
  const { data } = await apiClient.delete(`/owner/vehicles/${vehicleId}`, {
    headers: {
      'x-role': 'OWNER',
      'x-owner-id': ownerId,
    },
  });
  return data;
};

/* ================================
   TELEMETRY (SUPERVISOR LIVE TRACKING)
================================ */
export const getLatestTelemetry = async () => {
  const { data } = await apiClient.get(
    '/supervisor/live-tracking'
  );
  return data;
};

/* ================================
   SUPERVISOR - ASSIGN DRIVER
================================ */
export const assignDriver = async (payload) => {
  const { data } = await apiClient.post('/assign-driver', payload);
  return data;
};

/* ================================
   OWNER TELEMETRY (OWNER LIVE TRACKING)
================================ */
export const getOwnerLatestTelemetry = async () => {
  const { data } = await apiClient.get(
    '/owner/live-tracking'
  );
  return data;
};

/* ================================
   FLEET - ASSIGN VEHICLE & SEND LOCATION
   Fleet endpoints require x-role:FLEET and x-fleet-id/x-vehicle-id headers
================================ */
export const fleetAssignVehicle = async (vehicle_number, fleetId, vehicle_type) => {
  const { data } = await apiClient.post('/fleet/assign-vehicle', { vehicle_number, vehicle_type }, {
    headers: {
      'x-role': 'FLEET',
      'x-fleet-id': fleetId,
    },
  });
  return data;
};

export const sendFleetLocation = async ({ vehicleId, fleetId, latitude, longitude, speed, ignition }) => {
  const { data } = await apiClient.post('/fleet/location', { latitude, longitude, speed, ignition }, {
    headers: {
      'x-role': 'FLEET',
      'x-fleet-id': fleetId,
      'x-vehicle-id': vehicleId,
    },
  });
  return data;
};

/* ================================
   OWNER ROUTE TRACING
================================ */
export const getOwnerRouteHistory = async (vehicleId, date) => {
  const { data } = await apiClient.get(
    '/owner/route-history',
    {
      params: { vehicle_id: vehicleId, date: date }
    }
  );
  return data;
};


/* ================================
   FUEL (SUPERVISOR + OWNER)
================================ */

// Supervisor → create fuel entry
export const createFuelEntry = async (payload) => {
  const { data } = await apiClient.post('/fuel', payload);
  return data;
};

// Owner → fetch fuel analysis
export const getFuelAnalysis = async () => {
  const { data } = await apiClient.get('/analysis');
  return data;
};

export const getArrivalLogs = async () => {
  const { data } = await apiClient.get('/arrival-logs');
  return data;
};

/* ================================
   SLA / GEOFENCING
================================ */
export const processSLA = async (payload) => {
  const { data } = await apiClient.post(
    '/sla/process',
    payload
  );
  return data;
};

/* ================================
   CORRELATION (INTELLIGENCE)
================================ */
export const runCorrelation = async (payload) => {
  const { data } = await apiClient.post(
    '/correlation/run',
    payload
  );
  return data;
};

/* ================================
   DASHBOARD (OWNER VIEW)
================================ */
export const getDashboardStats = async () => {
  const { data } = await apiClient.get(
    '/dashboard/overview'
  );
  return data;
};

/* ================================
   EXPORT SINGLE API OBJECT
================================ */
const api = {
  login,
  logout,
  getCurrentUser,

  getVehicles,
  getOwnerVehicles,
  createVehicle,
  updateOwnerVehicle,
  deleteOwnerVehicle,
  getLatestTelemetry,

   getOwnerDashboard,
   
  createFuelEntry,
  
  getFuelAnalysis,
  getArrivalLogs,

  processSLA,
  runCorrelation,

  getDashboardStats,
};

export default api;
