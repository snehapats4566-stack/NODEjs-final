import axios from 'axios';

// Derive the backend origin from VITE_API_URL.
// If VITE_API_URL is "https://pawhaven-backend.onrender.com/api" → origin is "https://pawhaven-backend.onrender.com"
// If VITE_API_URL is not set → fallback to localhost.
const rawApiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5050/api';

// Backend origin (no trailing /api) — used to construct image URLs
export const API_BASE_URL = rawApiUrl.replace(/\/api\/?$/, '');

const api = axios.create({
  baseURL: rawApiUrl.endsWith('/api') ? rawApiUrl : `${rawApiUrl}/api`,
});

// Attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;

  // Only set Content-Type to JSON if the body is NOT FormData.
  // FormData needs the browser to set multipart/form-data with the correct boundary automatically.
  if (!(config.data instanceof FormData)) {
    config.headers['Content-Type'] = 'application/json';
  }

  return config;
});

// Handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
