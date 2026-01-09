import api from './api';

export const reportService = {
  createReport: async (reportedId: string, type: 'user' | 'post' | 'comment' | 'message', reason: string, description?: string) => {
    const { data } = await api.post('/reports', {
      reportedId,
      type,
      reason,
      description,
    });
    return data;
  },

  getReports: async (page = 1, limit = 20, status?: string, type?: string, priority?: string) => {
    const params: any = { page, limit };
    if (status) params.status = status;
    if (type) params.type = type;
    if (priority) params.priority = priority;
    const { data } = await api.get('/reports', { params });
    return data;
  },

  getReportById: async (reportId: string) => {
    const { data } = await api.get(`/reports/${reportId}`);
    return data;
  },

  updateReport: async (reportId: string, updateData: { status?: string; priority?: string; adminNote?: string }) => {
    const { data } = await api.put(`/reports/${reportId}`, updateData);
    return data;
  },

  getStatistics: async () => {
    const { data } = await api.get('/reports/statistics');
    return data;
  },
};

