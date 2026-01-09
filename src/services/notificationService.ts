import api from './api';
import { Notification } from '../types';

export const notificationService = {
  getNotifications: async (page = 1, limit = 20): Promise<{ notifications: Notification[]; pagination: any }> => {
    const { data } = await api.get('/notifications', { params: { page, limit } });
    // Backend artık { notifications: [...], pagination: {...} } formatında dönüyor
    return data.notifications ? data : { notifications: data, pagination: { page, limit, hasMore: false } };
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get('/notifications/unread/count');
    return data.count || 0;
  },

  markAsRead: async (notificationId: string) => {
    const { data } = await api.put(`/notifications/${notificationId}/read`);
    return data;
  },

  markAllAsRead: async () => {
    const { data } = await api.put('/notifications/read-all');
    return data;
  },
};
