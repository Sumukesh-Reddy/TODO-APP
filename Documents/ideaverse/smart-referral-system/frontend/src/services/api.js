// frontend/src/services/api.js
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth services
export const authService = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (userData) => api.post('/auth/register', userData),
  getProfile: () => api.get('/auth/profile'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
};

// Referral services
export const referralService = {
  createReferral: (data) => api.post('/referrals', data),
  getReferrals: (params) => api.get('/referrals', { params }),
  getReferralById: (id) => api.get(`/referrals/${id}`),
  acceptReferral: (id, data) => api.put(`/referrals/${id}/accept`, data),
  rejectReferral: (id, data) => api.put(`/referrals/${id}/reject`, data),
  completeConsultation: (id, data) => api.put(`/referrals/${id}/complete`, data),
  getReferralStats: () => api.get('/referrals/stats'),
};

// Doctor services
export const doctorService = {
  getDoctors: (params) => api.get('/doctors', { params }),
  getDoctorById: (id) => api.get(`/doctors/${id}`),
  createDoctor: (data) => api.post('/doctors', data),
  updateDoctor: (id, data) => api.put(`/doctors/${id}`, data),
  getDoctorSchedule: (id) => api.get(`/doctors/${id}/schedule`),
  updateSchedule: (id, data) => api.put(`/doctors/${id}/schedule`, data),
};

// Department services
export const departmentService = {
  getDepartments: () => api.get('/departments'),
  getDepartmentById: (id) => api.get(`/departments/${id}`),
  updateCapacity: (id, data) => api.put(`/departments/${id}/capacity`, data),
};

// Patient services
export const patientService = {
  getPatients: (params) => api.get('/patients', { params }),
  getPatientById: (id) => api.get(`/patients/${id}`),
  createPatient: (data) => api.post('/patients', data),
  updatePatient: (id, data) => api.put(`/patients/${id}`, data),
  getPatientHistory: (id) => api.get(`/patients/${id}/history`),
};

// Dashboard services
export const dashboardService = {
  getManagerDashboard: () => api.get('/dashboard/manager'),
  getDoctorDashboard: () => api.get('/dashboard/doctor'),
  getPhcDashboard: () => api.get('/dashboard/phc'),
  getPatientDashboard: () => api.get('/dashboard/patient'),
  getAnalytics: (params) => api.get('/dashboard/analytics', { params }),
};

export default api;