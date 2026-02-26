import apiClient from './client';

export const licensesAPI = {
  getAll: async (params) => {
    const response = await apiClient.get('/admin/licenses', { params });
    return response.data;
  },

  getById: async (id) => {
    const response = await apiClient.get(`/admin/licenses/${id}`);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/admin/licenses/${id}`, data);
    return response.data;
  },

  // Create a single X-ray license with manual credits (no plan required)
  createSingle: async (data) => {
    const response = await apiClient.post('/admin/licenses/create', data);
    return response.data;
  },

  // Bulk create X-ray licenses with manual credits (no plan required)
  bulkCreate: async (data) => {
    const response = await apiClient.post('/admin/licenses/bulk-create', data);
    return response.data;
  },

  // Legacy: keep bulkGenerate for any existing callers that still use plan_id
  bulkGenerate: async (data) => {
    const response = await apiClient.post('/admin/licenses/bulk-generate', data);
    return response.data;
  },

  carryForward: async (id) => {
    const response = await apiClient.post(`/admin/licenses/${id}/carry-forward`);
    return response.data;
  },

  getPlans: async () => {
    const response = await apiClient.get('/admin/plans');
    return response.data;
  },
};

export default licensesAPI;
