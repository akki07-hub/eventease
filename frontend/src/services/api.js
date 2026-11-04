import axios from 'axios';

// Create configured Axios instance
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000
});

// Response interceptor to normalize error messages
api.interceptors.response.use(
  (response) => response,
  (error) => {
    let message = 'An unexpected error occurred. Please check your network or server.';
    if (error.response && error.response.data && error.response.data.message) {
      message = error.response.data.message;
    } else if (error.message) {
      message = error.message;
    }
    return Promise.reject(new Error(message));
  }
);

// Events API
export const eventService = {
  getAll: async (params = {}) => {
    const res = await api.get('/events', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/events/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/events', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/events/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/events/${id}`);
    return res.data;
  }
};

// Students API
export const studentService = {
  getAll: async (params = {}) => {
    const res = await api.get('/students', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/students/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/students', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/students/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/students/${id}`);
    return res.data;
  }
};

// Registrations API
export const registrationService = {
  getAll: async (params = {}) => {
    const res = await api.get('/registrations', { params });
    return res.data;
  },
  getById: async (id) => {
    const res = await api.get(`/registrations/${id}`);
    return res.data;
  },
  create: async (data) => {
    const res = await api.post('/registrations', data);
    return res.data;
  },
  update: async (id, data) => {
    const res = await api.put(`/registrations/${id}`, data);
    return res.data;
  },
  delete: async (id) => {
    const res = await api.delete(`/registrations/${id}`);
    return res.data;
  },
  getByEvent: async (eventId, params = {}) => {
    const res = await api.get(`/registrations/event/${eventId}`, { params });
    return res.data;
  }
};

// Dashboard Stats API
export const dashboardService = {
  getStats: async () => {
    const res = await api.get('/dashboard/stats');
    return res.data;
  }
};

// Health Check API
export const healthService = {
  check: async () => {
    const res = await api.get('/health');
    return res.data;
  }
};

export default api;
