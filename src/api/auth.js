import apiClient from './client';

export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post('/admin/login', credentials);
    return response.data;
  },
};

export default authAPI;
