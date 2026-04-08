import apiClient from './client';

export const reportsAPI = {
  getLicenseManagement: async (params) => {
    const response = await apiClient.get('/admin/reports/license-management', { params });
    return response.data;
  },

  getUsageMetrics: async () => {
    const response = await apiClient.get('/admin/reports/usage-metrics');
    return response.data;
  },

  getRevenuePayment: async (params) => {
    const response = await apiClient.get('/admin/reports/revenue-payment', { params });
    return response.data;
  },

  getAIAnalysis: async () => {
    const response = await apiClient.get('/admin/reports/ai-analysis');
    return response.data;
  },

  getUserActivity: async () => {
    const response = await apiClient.get('/admin/reports/user-activity');
    return response.data;
  },

  getDesktopSync: async () => {
    const response = await apiClient.get('/admin/reports/desktop-sync');
    return response.data;
  },

  getSystemHealth: async (product = 'xray') => {
    const response = await apiClient.get('/admin/reports/system-health', { params: { product } });
    return response.data;
  },

  getNotifications: async () => {
    const response = await apiClient.get('/admin/reports/notifications');
    return response.data;
  },

  getAuditLogs: async (params) => {
    const response = await apiClient.get('/admin/audit-logs', { params });
    return response.data;
  },

  getDemoRequests: async (params) => {
    const response = await apiClient.get('/admin/reports/demo-requests', { params });
    return response.data;
  },
};

export default reportsAPI;
