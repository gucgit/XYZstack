import axios from 'axios';

// In production, REACT_APP_API_URL is set at build time
// to the ALB DNS or internal service URL.
// In local dev, CRA proxy in package.json handles /api → localhost:8080
const API_BASE = process.env.REACT_APP_API_URL || '';

const api = axios.create({
  baseURL: `${API_BASE}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Request interceptor — log outgoing requests in dev
api.interceptors.request.use((config) => {
  if (process.env.NODE_ENV === 'development') {
    console.log(`→ ${config.method?.toUpperCase()} ${config.url}`);
  }
  return config;
});

// Response interceptor — centralised error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export const taskApi = {
  getAll:       ()           => api.get('/tasks'),
  getById:      (id)         => api.get(`/tasks/${id}`),
  getByStatus:  (status)     => api.get(`/tasks?status=${status}`),
  create:       (task)       => api.post('/tasks', task),
  update:       (id, task)   => api.put(`/tasks/${id}`, task),
  updateStatus: (id, status) => api.patch(`/tasks/${id}/status`, { status }),
  delete:       (id)         => api.delete(`/tasks/${id}`),
  getStats:     ()           => api.get('/tasks/stats'),
};

export default api;
