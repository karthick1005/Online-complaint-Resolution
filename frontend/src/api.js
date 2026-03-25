import axios from 'axios';

const API_BASE_URL = 'https://onlinecomplaint-eisl.onrender.com/api';

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
    const errorPayload = error.response?.data?.error;
    if (errorPayload && typeof errorPayload === 'object') {
      error.response.data = {
        ...error.response.data,
        error: errorPayload.message || 'Request failed',
        errorDetails: errorPayload,
      };
      error.message = errorPayload.message || error.message;
    }

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

export const getResponseData = (response, fallback = null) =>
  response?.data?.data ?? fallback;

export const getResponsePagination = (response) =>
  response?.data?.pagination ?? null;

export const getErrorMessage = (error, fallback = 'Request failed') =>
  error?.response?.data?.error || error?.message || fallback;

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
  getDepartments: (params = {}) => api.get('/departments', { params }),
  getDepartmentById: (id) => api.get(`/departments/${id}`),
  getCategoriesByDepartment: (departmentId) => api.get(`/categories?departmentId=${departmentId}`)
};

export const categoryAPI = {
  getCategories: (params = {}) => api.get('/categories', { params }),
  getCategoriesByDepartment: (departmentId) => api.get(`/categories?departmentId=${departmentId}`)
};

export const analyticsAPI = {
  getDashboardStats: (params = {}) => api.get('/analytics/dashboard/stats', { params })
};

export const userAPI = {
  createUser: (data) => api.post('/users', data),
  getAllUsers: (filters = {}) => api.get('/users', { params: filters }),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, data) => api.put(`/users/${id}`, data),
  deleteUser: (id) => api.delete(`/users/${id}`),
  changePassword: (data) => api.post('/users/change-password', data),
  toggleUserStatus: (id) => api.post(`/users/${id}/toggle-status`),
  getDepartments: (params = {}) => api.get('/users/departments/list', { params })
};

export default api;

export const notificationAPI = {
  getNotifications: (params) => api.get('/notifications', { params }),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  getUnreadCount: () => api.get('/notifications/unread-count')
};
