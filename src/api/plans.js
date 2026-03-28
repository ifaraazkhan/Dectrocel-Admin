import apiClient from './client';

const plansAPI = {
  // Fetch plans filtered by plan_type
  getByType: async (plan_type) => {
    const response = await apiClient.get('/admin/subscriptions/plans', {
      params: { plan_type },
    });
    return response.data;
  },

  // Fetch all plans (all types)
  getAll: async () => {
    const response = await apiClient.get('/admin/subscriptions/plans');
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/admin/subscriptions/plans', data);
    return response.data;
  },

  update: async (id, data) => {
    const response = await apiClient.put(`/admin/subscriptions/plans/${id}`, data);
    return response.data;
  },

  delete: async (id) => {
    const response = await apiClient.delete(`/admin/subscriptions/plans/${id}`);
    return response.data;
  },
};

export default plansAPI;
