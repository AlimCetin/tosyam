import api from './api';

export const adminService = {
  getDashboard: async () => {
    const { data } = await api.get('/admin/dashboard');
    return data;
  },

  getUsers: async (page = 1, limit = 20, search?: string, role?: string, isBanned?: boolean) => {
    const params: any = { page, limit };
    if (search) params.search = search;
    if (role) params.role = role;
    if (isBanned !== undefined) params.isBanned = isBanned;
    const { data } = await api.get('/admin/users', { params });
    return data;
  },

  getUserById: async (userId: string) => {
    const { data } = await api.get(`/admin/users/${userId}`);
    return data;
  },

  banUser: async (userId: string, banData: { isPermanent?: boolean; bannedUntil?: string; reason?: string }) => {
    const { data } = await api.post(`/admin/users/${userId}/ban`, banData);
    return data;
  },

  unbanUser: async (userId: string) => {
    const { data } = await api.post(`/admin/users/${userId}/unban`);
    return data;
  },

  warnUser: async (userId: string, reason?: string) => {
    const { data } = await api.post(`/admin/users/${userId}/warn`, { reason });
    return data;
  },

  changeUserRole: async (userId: string, role: string) => {
    const { data } = await api.put(`/admin/users/${userId}/role`, { role });
    return data;
  },

  deletePost: async (postId: string, reason?: string) => {
    const { data } = await api.delete(`/admin/posts/${postId}`, { data: { reason } });
    return data;
  },

  getActivityLogs: async (page = 1, limit = 20, adminId?: string, activityType?: string) => {
    const params: any = { page, limit };
    if (adminId) params.adminId = adminId;
    if (activityType) params.activityType = activityType;
    const { data } = await api.get('/admin/activity-logs', { params });
    return data;
  },
};

