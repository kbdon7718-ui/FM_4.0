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
  getLatestTelemetry,

   getOwnerDashboard,
   
  createFuelEntry,
  
  getFuelAnalysis,

  processSLA,
  runCorrelation,

  getDashboardStats,
};

export default api;
