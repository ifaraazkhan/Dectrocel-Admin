import apiClient from './client';

export const adminUsersAPI = {
  getAll: async () => {
    const response = await apiClient.get('/admin/admin-users');
    return response.data;
  },

  create: async (data) => {
    const response = await apiClient.post('/admin/admin-users', data);
    return response.data;
  },

  updateStatus: async (id, status) => {
    const response = await apiClient.put(`/admin/admin-users/${id}/status`, { status });
    return response.data;
  },
};

export default adminUsersAPI;
