import api from './api';
import { User } from '../types';

export const userService = {
  getUser: async (userId: string): Promise<User> => {
    const { data } = await api.get(`/users/${userId}`);
    return data;
  },

  searchUsers: async (query: string): Promise<User[]> => {
    const { data } = await api.get('/users/search', { params: { q: query } });
    return data;
  },

  followUser: async (userId: string) => {
    const { data } = await api.post(`/users/${userId}/follow`);
    return data;
  },

  unfollowUser: async (userId: string) => {
    const { data } = await api.delete(`/users/${userId}/follow`);
    return data;
  },

  blockUser: async (userId: string) => {
    const { data } = await api.post(`/users/${userId}/block`);
    return data;
  },

  unblockUser: async (userId: string) => {
    const { data } = await api.delete(`/users/${userId}/block`);
    return data;
  },

  getBlockedUsers: async (): Promise<User[]> => {
    const { data } = await api.get('/users/blocked/list');
    return data;
  },

  reportUser: async (userId: string, reason: string) => {
    const { data } = await api.post(`/users/${userId}/report`, { reason });
    return data;
  },

  updateProfile: async (data: Partial<User>) => {
    const response = await api.put('/users/profile', data);
    return response.data;
  },

  getFollowers: async (userId: string): Promise<User[]> => {
    const { data } = await api.get(`/users/${userId}/followers`);
    return data;
  },

  getFollowing: async (userId: string): Promise<User[]> => {
    const { data } = await api.get(`/users/${userId}/following`);
    return data;
  },

  deleteAccount: async (): Promise<void> => {
    await api.delete('/users/account');
  },

  getCurrentUser: async (): Promise<User> => {
    const { data } = await api.get('/users/me');
    return data;
  },
};
