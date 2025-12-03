// If VITE_API_URL is set (from .env), use it.
// Otherwise, use empty string '' to allow Vite Proxy to forward /api requests to localhost:5000
const API_URL = import.meta.env.VITE_API_URL || '';
export default API_URL;
