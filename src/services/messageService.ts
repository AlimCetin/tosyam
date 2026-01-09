import api from './api';
import { Message, Conversation } from '../types';

export const messageService = {
  getConversations: async (page = 1, limit = 20): Promise<{ conversations: Conversation[]; pagination: any }> => {
    const { data } = await api.get('/messages/conversations', { params: { page, limit } });
    // Backend artık { conversations: [...], pagination: {...} } formatında dönüyor
    return data.conversations ? data : { conversations: data, pagination: { page, limit, hasMore: false } };
  },

  getMessages: async (conversationId: string, page = 1, limit = 20): Promise<{ messages: Message[]; pagination: any }> => {
    const { data } = await api.get(`/messages/${conversationId}`, { params: { page, limit } });
    // Backend artık { messages: [...], pagination: {...} } formatında dönüyor
    return data.messages ? data : { messages: data, pagination: { page, limit, hasMore: false } };
  },

  sendMessage: async (receiverId: string, text: string, image?: string) => {
    const { data } = await api.post('/messages', { receiverId, text, image });
    return data;
  },

  markAsRead: async (conversationId: string) => {
    const { data } = await api.put(`/messages/${conversationId}/read`);
    return data;
  },

  getUnreadCount: async (): Promise<number> => {
    const { data } = await api.get('/messages/unread/count');
    return data.count || 0;
  },
};
