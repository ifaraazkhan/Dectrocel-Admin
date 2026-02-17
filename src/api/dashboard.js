import apiClient from './client';

export const dashboardAPI = {
  getStats: async () => {
    const response = await apiClient.get('/admin/dashboard/stats');
    return response.data;
  },

  getLicensesByCategory: async (category) => {
    const response = await apiClient.get('/admin/dashboard/licenses-by-category', {
      params: { category }
    });
    return response.data;
  },
};

export default dashboardAPI;
