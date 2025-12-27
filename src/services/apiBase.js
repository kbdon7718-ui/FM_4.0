// Central API base URL helper for all fetch/axios calls
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002';
export const API_BASE_URL = BASE_URL.endsWith('/api') ? BASE_URL : `${BASE_URL}/api`;
