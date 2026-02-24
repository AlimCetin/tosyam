import api from './api';

export const campaignService = {
    async getCampaigns(city?: string) {
        const response = await api.get('/campaigns', { params: { city } });
        return response.data;
    },

    async getCampaign(id: string) {
        const response = await api.get(`/campaigns/${id}`);
        return response.data;
    },

    async claimCode(id: string) {
        const response = await api.post(`/campaigns/${id}/claim`);
        return response.data;
    },

    async getMyCodes() {
        const response = await api.get('/campaigns/my-codes');
        return response.data;
    },

    async getMyCampaigns() {
        const response = await api.get('/campaigns/me');
        return response.data;
    },

    async createCampaign(data: any) {
        const response = await api.post('/campaigns', data);
        return response.data;
    },

    async updateCampaign(id: string, data: any) {
        const response = await api.patch(`/campaigns/${id}`, data);
        return response.data;
    },

    async deleteCampaign(id: string) {
        const response = await api.delete(`/campaigns/${id}`);
        return response.data;
    }
};
