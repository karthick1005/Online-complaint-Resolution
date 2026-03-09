import axios from 'axios';

const API_BASE_URL = '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Store logout callback
let onLogout = null;

export const setLogoutCallback = (callback) => {
  onLogout = callback;
};

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle response errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Call logout callback instead of hard reload
      if (onLogout) {
        onLogout();
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (email, password) => api.post('/auth/login', { email, password }),
  getMe: () => api.get('/auth/me')
};

export const complaintAPI = {
  createComplaint: (data, files) => {
    const formData = new FormData();
    Object.keys(data).forEach((key) => {
      formData.append(key, data[key]);
    });
    if (files) {
      files.forEach((file) => {
        formData.append('files', file);
      });
    }
    return api.post('/complaints', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  getComplaints: (filters = {}) => api.get('/complaints', { params: filters }),
  getComplaintById: (id) => api.get(`/complaints/${id}`),
  updateStatus: (id, status, comment, files = []) => {
    const formData = new FormData();
    formData.append('status', status);
    formData.append('comment', comment);
    files.forEach(file => {
      formData.append('files', file);
    });
    return api.put(`/complaints/${id}/status`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },
  assignComplaint: (id, staffId) =>
    api.post(`/complaints/${id}/assign`, { staffId }),
  addFeedback: (id, rating, comment) =>
    api.post(`/complaints/${id}/feedback`, { rating, comment }),
  getStaff: (filters = {}) => api.get('/complaints/meta/staff', { params: filters }),
  
  // Attachment APIs
  getAttachments: (id) => api.get(`/complaints/${id}/attachments`),
  downloadAttachment: (attachmentId) =>
    api.get(`/complaints/attachment/${attachmentId}/download`, {
      responseType: 'blob'
    }),
  downloadStatusFile: (fileId) =>
    api.get(`/complaints/status-file/${fileId}/download`, {
      responseType: 'blob'
    }),
  
  // Comments APIs
  addComment: (id, comment) =>
    api.post(`/complaints/${id}/comments`, { comment }),
  getComments: (id) => api.get(`/complaints/${id}/comments`),
  
  // Escalation API
  escalateComplaint: (id, reason) =>
    api.post(`/complaints/${id}/escalate`, { reason }),
  
  // Reopen complaint API
  reopenComplaint: (id, reason) =>
    api.post(`/complaints/${id}/reopen`, { reason })
};

export const departmentAPI = {
  getDepartments: () => api.get('/departments'),
  getDepartmentById: (id) => api.get(`/departments/${id}`),
  getCategoriesByDepartment: (departmentId) => api.get(`/categories?departmentId=${departmentId}`)
};

export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  getCategoriesByDepartment: (departmentId) => api.get(`/categories?departmentId=${departmentId}`)
};

export const analyticsAPI = {
  getDashboardStats: () => api.get('/analytics/dashboard/stats')
};

export const userAPI = {
  createUser: (data) => api.post('/users', data),
  getAllUsers: (filters = {}) => api.get('/users', { params: filters }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  changePassword: (data) => api.post('/users/change-password', data),
  toggleUserStatus: (id) => api.post(`/users/${id}/toggle-status`),
  getDepartments: () => api.get('/users/departments/list')
};

export default api;
