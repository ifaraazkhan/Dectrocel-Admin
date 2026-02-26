import apiClient from './client';

// ─── CT License Management ─────────────────────────────────────────────────────

export const ctLicensesAPI = {
  getAll: async (params) => {
    const response = await apiClient.get('/admin/ct/licenses', { params });
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/admin/ct/licenses', data);
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/admin/ct/licenses/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/admin/ct/licenses/${id}`, data);
    return response.data;
  },
};

// ─── CT Dashboard ─────────────────────────────────────────────────────────────

export const ctDashboardAPI = {
  getStats: async () => {
    const response = await apiClient.get('/admin/ct/dashboard');
    return response.data;
  },
};

// ─── CT Reports ───────────────────────────────────────────────────────────────

export const ctReportsAPI = {
  getAnalyses: async (params) => {
    const response = await apiClient.get('/admin/ct/reports/analyses', { params });
    return response.data;
  },

  getLicenses: async (params) => {
    const response = await apiClient.get('/admin/ct/reports/licenses', { params });
    return response.data;
  },
};
