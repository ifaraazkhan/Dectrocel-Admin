import apiClient from './client';

export const emailAPI = {
  sendEmail: async ({ recipients, subject, body }) => {
    const response = await apiClient.post('/admin/send-email', { recipients, subject, body });
    return response.data;
  },

  getEmailLogs: async () => {
    const response = await apiClient.get('/admin/email-logs');
    return response.data;
  },
};

export default emailAPI;
