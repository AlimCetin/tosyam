import api from './api';

export const placeService = {
    async getPlaces(city?: string, category?: string) {
        const response = await api.get('/places', { params: { city, category } });
        return response.data;
    },

    async getPlace(id: string) {
        const response = await api.get(`/places/${id}`);
        return response.data;
    },

    async getMyPlaces() {
        const response = await api.get('/places/me');
        return response.data;
    },

    async createPlace(data: any) {
        const response = await api.post('/places', data);
        return response.data;
    },

    async updatePlace(id: string, data: any) {
        const response = await api.patch(`/places/${id}`, data);
        return response.data;
    },

    async deletePlace(id: string) {
        const response = await api.delete(`/places/${id}`);
        return response.data;
    }
};
