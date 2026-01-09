import api from './api';

export const adService = {
  getAds: async (page = 1, limit = 20, status?: string) => {
    const params: any = { page, limit };
    if (status) params.status = status;
    const { data } = await api.get('/ads', { params });
    return data;
  },

  getActiveAds: async () => {
    const { data } = await api.get('/ads/active');
    return data;
  },

  getAdById: async (adId: string) => {
    const { data } = await api.get(`/ads/${adId}`);
    return data;
  },

  createAd: async (adData: {
    title: string;
    type: 'image' | 'video';
    mediaUrl: string;
    linkUrl: string;
    description?: string;
    startDate: string;
    endDate: string;
    status?: string;
    maxImpressions?: number;
    budget?: number;
  }) => {
    const { data } = await api.post('/ads', adData);
    return data;
  },

  updateAd: async (adId: string, updateData: {
    title?: string;
    mediaUrl?: string;
    linkUrl?: string;
    description?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    maxImpressions?: number;
    budget?: number;
  }) => {
    const { data } = await api.put(`/ads/${adId}`, updateData);
    return data;
  },

  deleteAd: async (adId: string) => {
    const { data } = await api.delete(`/ads/${adId}`);
    return data;
  },

  recordImpression: async (adId: string) => {
    await api.post(`/ads/${adId}/impression`);
  },

  recordClick: async (adId: string) => {
    await api.post(`/ads/${adId}/click`);
  },

  recordView: async (adId: string) => {
    await api.post(`/ads/${adId}/view`);
  },

  getStatistics: async (adId?: string) => {
    const params = adId ? { adId } : {};
    const { data } = await api.get('/ads/statistics', { params });
    return data;
  },
};

