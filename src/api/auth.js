import apiClient from './client';

export const authAPI = {
  login: async (credentials) => {
    const response = await apiClient.post('/admin/login', credentials);
    return response.data;
  },

  verifyOtp: async ({ mobile, otp, password }) => {
    const response = await apiClient.post('/admin/verify-otp', { mobile, otp, password });
    return response.data;
  },

  get2FASetting: async () => {
    const response = await apiClient.get('/admin/settings/2fa');
    return response.data;
  },

  set2FASetting: async (enabled) => {
    const response = await apiClient.put('/admin/settings/2fa', { enabled });
    return response.data;
  },
};

export default authAPI;
