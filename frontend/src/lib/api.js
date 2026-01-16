import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
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

// Auth
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
};

// Programs
export const programsAPI = {
  getAll: () => api.get('/programs'),
  create: (data) => api.post('/admin/programs', data),
  update: (id, data) => api.put(`/admin/programs/${id}`, data),
  delete: (id) => api.delete(`/admin/programs/${id}`),
};

// Courses
export const coursesAPI = {
  getAll: (programId) => api.get('/courses', { params: { program_id: programId } }),
  getOne: (id) => api.get(`/courses/${id}`),
  adminGetAll: () => api.get('/admin/courses'),
  create: (data) => api.post('/admin/courses', data),
  update: (id, data) => api.put(`/admin/courses/${id}`, data),
  delete: (id) => api.delete(`/admin/courses/${id}`),
};

// Lessons
export const lessonsAPI = {
  getAll: (courseId) => api.get(`/lessons/${courseId}`),
  getOne: (id) => api.get(`/lesson/${id}`),
  create: (data) => api.post('/admin/lessons', data),
  update: (id, data) => api.put(`/admin/lessons/${id}`, data),
  delete: (id) => api.delete(`/admin/lessons/${id}`),
  reorder: (lessonOrders) => api.put('/admin/lessons/reorder', lessonOrders),
};

// Modules
export const modulesAPI = {
  create: (data) => api.post('/admin/modules', data),
  update: (id, data) => api.put(`/admin/modules/${id}`, data),
  delete: (id) => api.delete(`/admin/modules/${id}`),
};

// Videos
export const videosAPI = {
  getOne: (id) => api.get(`/videos/${id}`),
  create: (data) => api.post('/admin/videos', data),
  update: (id, data) => api.put(`/admin/videos/${id}`, data),
  delete: (id) => api.delete(`/admin/videos/${id}`),
};

// Shop
export const shopAPI = {
  getProducts: (category) => api.get('/shop/products', { params: { category } }),
  getProduct: (id) => api.get(`/shop/products/${id}`),
  createProduct: (data) => api.post('/admin/shop/products', data),
  updateProduct: (id, data) => api.put(`/admin/shop/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/admin/shop/products/${id}`),
};

// FAQs
export const faqsAPI = {
  getAll: () => api.get('/faqs'),
  create: (data) => api.post('/admin/faqs', data),
  update: (id, data) => api.put(`/admin/faqs/${id}`, data),
  delete: (id) => api.delete(`/admin/faqs/${id}`),
};

// Results
export const resultsAPI = {
  getAll: () => api.get('/results'),
  create: (data) => api.post('/admin/results', data),
  delete: (id) => api.delete(`/admin/results/${id}`),
};

// Settings
export const settingsAPI = {
  get: () => api.get('/settings'),
  update: (data) => api.put('/admin/settings', data),
};

// Analytics
export const analyticsAPI = {
  trackEvent: (data) => api.post('/analytics/event', data),
  getStats: () => api.get('/admin/analytics'),
};

// Admin
export const adminAPI = {
  getUsers: () => api.get('/admin/users'),
  updateUserRole: (userId, role) => api.put(`/admin/users/${userId}/role?role=${role}`),
  updateUserSubscriptions: (userId, programIds) => api.put(`/admin/users/${userId}/subscriptions`, programIds),
  seedData: () => api.post('/admin/seed'),
};

// Payments
export const paymentsAPI = {
  createSubscriptionCheckout: (programId) => 
    api.post(`/payments/checkout/subscription?program_id=${programId}&origin_url=${window.location.origin}`),
  createProductCheckout: (productId) => 
    api.post(`/payments/checkout/product?product_id=${productId}&origin_url=${window.location.origin}`),
  getStatus: (sessionId) => api.get(`/payments/status/${sessionId}`),
};

export default api;
