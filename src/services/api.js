/**
 * API Service for FleetMaster Pro
 * Connects frontend with backend API
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://fleet-backend-1-0.onrender.com/api';

// Token management
export function getToken() {
  return localStorage.getItem('authToken');
}

export function setToken(token) {
  localStorage.setItem('authToken', token);
}

export function removeToken() {
  localStorage.removeItem('authToken');
}

export function getStoredUser() {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

export function setStoredUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

export function removeStoredUser() {
  localStorage.removeItem('user');
}

// API request helper
async function apiRequest(endpoint, options = {}) {
  const token = getToken();
  
  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    
    if (response.status === 401) {
      // Token expired or invalid
      removeToken();
      removeStoredUser();
      window.location.href = '/login';
      throw new Error('Session expired. Please login again.');
    }
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.error || data.message || 'API request failed');
    }
    
    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ============================================
// AUTH API
// ============================================

export async function login(email, password) {
  const data = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
  
  if (data.token) {
    setToken(data.token);
    setStoredUser(data.user);
  }
  
  return data;
}

export async function signup(name, email, password, role = 'supervisor') {
  const data = await apiRequest('/auth/signup', {
    method: 'POST',
    body: JSON.stringify({ name, email, password, role }),
  });
  
  if (data.token) {
    setToken(data.token);
    setStoredUser(data.user);
  }
  
  return data;
}

export async function getCurrentUser() {
  return apiRequest('/auth/me');
}

export function logout() {
  removeToken();
  removeStoredUser();
  window.location.href = '/login';
}

export function isAuthenticated() {
  return !!getToken();
}

// ============================================
// DASHBOARD API
// ============================================

export async function getDashboardStats() {
  return apiRequest('/dashboard/stats');
}

export async function getVehicleStats(vehicleId) {
  return apiRequest(`/dashboard/vehicles/${vehicleId}/stats`);
}

// ============================================
// VEHICLES API
// ============================================

export async function getVehicles(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/vehicles?${queryString}` : '/vehicles';
  return apiRequest(endpoint);
}

export async function getVehicle(id) {
  return apiRequest(`/vehicles/${id}`);
}

export async function createVehicle(vehicleData) {
  return apiRequest('/vehicles', {
    method: 'POST',
    body: JSON.stringify(vehicleData),
  });
}

export async function updateVehicle(id, vehicleData) {
  return apiRequest(`/vehicles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(vehicleData),
  });
}

export async function deleteVehicle(id) {
  return apiRequest(`/vehicles/${id}`, {
    method: 'DELETE',
  });
}

// ============================================
// TELEMETRY API
// ============================================

export async function getVehicleTelemetry(vehicleId) {
  return apiRequest(`/telemetry/${vehicleId}`);
}

export async function getLatestTelemetry() {
  return apiRequest('/telemetry/latest');
}

// ============================================
// FUEL API
// ============================================

export async function getFuelLogs(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/fuel?${queryString}` : '/fuel';
  return apiRequest(endpoint);
}

export async function createFuelLog(fuelData) {
  return apiRequest('/fuel', {
    method: 'POST',
    body: JSON.stringify(fuelData),
  });
}

export async function updateFuelLog(id, fuelData) {
  return apiRequest(`/fuel/${id}`, {
    method: 'PUT',
    body: JSON.stringify(fuelData),
  });
}

// ============================================
// GEOFENCE API
// ============================================

export async function getGeofences() {
  return apiRequest('/geofence');
}

export async function createGeofence(geofenceData) {
  return apiRequest('/geofence', {
    method: 'POST',
    body: JSON.stringify(geofenceData),
  });
}

export async function updateGeofence(id, geofenceData) {
  return apiRequest(`/geofence/${id}`, {
    method: 'PUT',
    body: JSON.stringify(geofenceData),
  });
}

export async function deleteGeofence(id) {
  return apiRequest(`/geofence/${id}`, {
    method: 'DELETE',
  });
}

export async function getGeofenceAlerts(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/geofence/alerts?${queryString}` : '/geofence/alerts';
  return apiRequest(endpoint);
}

// ============================================
// COMPLAINTS API
// ============================================

export async function getComplaints(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/complaints?${queryString}` : '/complaints';
  return apiRequest(endpoint);
}

export async function createComplaint(complaintData) {
  return apiRequest('/complaints', {
    method: 'POST',
    body: JSON.stringify(complaintData),
  });
}

export async function updateComplaint(id, complaintData) {
  return apiRequest(`/complaints/${id}`, {
    method: 'PUT',
    body: JSON.stringify(complaintData),
  });
}

export async function resolveComplaint(id, resolution) {
  return apiRequest(`/complaints/${id}/resolve`, {
    method: 'POST',
    body: JSON.stringify({ resolution }),
  });
}

// ============================================
// INSIGHTS API
// ============================================

export async function getInsights() {
  return apiRequest('/insights');
}

export async function getFleetAnalytics(params = {}) {
  const queryString = new URLSearchParams(params).toString();
  const endpoint = queryString ? `/insights/analytics?${queryString}` : '/insights/analytics';
  return apiRequest(endpoint);
}

// ============================================
// EXPORT DEFAULT API OBJECT
// ============================================

const api = {
  // Auth
  login,
  signup,
  logout,
  getCurrentUser,
  isAuthenticated,
  getToken,
  getStoredUser,
  
  // Dashboard
  getDashboardStats,
  getVehicleStats,
  
  // Vehicles
  getVehicles,
  getVehicle,
  createVehicle,
  updateVehicle,
  deleteVehicle,
  
  // Telemetry
  getVehicleTelemetry,
  getLatestTelemetry,
  
  // Fuel
  getFuelLogs,
  createFuelLog,
  updateFuelLog,
  
  // Geofence
  getGeofences,
  createGeofence,
  updateGeofence,
  deleteGeofence,
  getGeofenceAlerts,
  
  // Complaints
  getComplaints,
  createComplaint,
  updateComplaint,
  resolveComplaint,
  
  // Insights
  getInsights,
  getFleetAnalytics,
};

export default api;
