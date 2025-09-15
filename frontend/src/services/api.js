import axios from 'axios';

// Always enforce `/api` at the end of BASE_URL
const BASE_URL =
  (process.env.REACT_APP_API_URL || 'http://localhost:5000').replace(/\/$/, '') + '/api';

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (data) => api.post('/auth/login', data),       // -> /api/auth/login
  getProfile: () => api.get('/auth/profile'),           // -> /api/auth/profile
  inviteUser: (data) => api.post('/auth/invite', data), // -> /api/auth/invite
};

export const notesAPI = {
  create: (data) => api.post('/notes', data),           // -> /api/notes
  getAll: (params) => api.get('/notes', { params }),    // -> /api/notes
  getById: (id) => api.get(`/notes/${id}`),             // -> /api/notes/:id
  update: (id, data) => api.put(`/notes/${id}`, data),  // -> /api/notes/:id
  delete: (id) => api.delete(`/notes/${id}`),           // -> /api/notes/:id
  getStats: () => api.get('/notes/stats'),              // -> /api/notes/stats
};

export const tenantsAPI = {
  getInfo: (slug) => api.get(`/tenants/${slug}`),           // -> /api/tenants/:slug
  upgrade: (slug) => api.post(`/tenants/${slug}/upgrade`),  // -> /api/tenants/:slug/upgrade
};

export const healthAPI = {
  check: () => axios.get(`${BASE_URL.replace('/api', '')}/health`), // -> /health
};

export default api;
