import apiClient from './client';

export const subscriptionsAPI = {
  // Subscription Plans
  getPlans: async () => {
    const response = await apiClient.get('/admin/subscriptions/plans');
    return response.data;
  },

  createPlan: async (planData) => {
    const response = await apiClient.post('/admin/subscriptions/plans', planData);
    return response.data;
  },

  updatePlan: async (planId, planData) => {
    const response = await apiClient.put(`/admin/subscriptions/plans/${planId}`, planData);
    return response.data;
  },

  deletePlan: async (planId) => {
    const response = await apiClient.delete(`/admin/subscriptions/plans/${planId}`);
    return response.data;
  },

  // User Subscriptions
  getUserSubscriptions: async () => {
    const response = await apiClient.get('/admin/subscriptions/users');
    return response.data;
  },

  // Subscription Activity
  getActivity: async () => {
    const response = await apiClient.get('/admin/subscriptions/activity');
    return response.data;
  }
};

export default subscriptionsAPI;
