import axios from 'axios';
import { API_BASE_URL } from '../constants/config';
import { authService } from './authService';
import { Confession, ConfessionComment } from '../types';

const getHeaders = async () => {
    const token = await authService.getToken();
    return {
        Authorization: `Bearer ${token}`,
    };
};

export const confessionService = {
    getConfessions: async (page = 1, limit = 20): Promise<Confession[]> => {
        const headers = await getHeaders();
        const response = await axios.get(`${API_BASE_URL}/confessions`, {
            params: { page, limit },
            headers,
        });
        return response.data;
    },

    getMyConfessions: async (page = 1, limit = 20): Promise<Confession[]> => {
        const headers = await getHeaders();
        const response = await axios.get(`${API_BASE_URL}/confessions/me`, {
            params: { page, limit },
            headers,
        });
        return response.data;
    },

    createConfession: async (text: string): Promise<Confession> => {
        const headers = await getHeaders();
        const response = await axios.post(`${API_BASE_URL}/confessions`, { text }, { headers });
        return response.data;
    },

    likeConfession: async (id: string): Promise<any> => {
        const headers = await getHeaders();
        const response = await axios.post(`${API_BASE_URL}/confessions/${id}/like`, {}, { headers });
        return response.data;
    },

    getComments: async (id: string, page = 1, limit = 20): Promise<ConfessionComment[]> => {
        const headers = await getHeaders();
        const response = await axios.get(`${API_BASE_URL}/confessions/${id}/comments`, {
            params: { page, limit },
            headers,
        });
        return response.data;
    },

    addComment: async (id: string, text: string): Promise<ConfessionComment> => {
        const headers = await getHeaders();
        const response = await axios.post(`${API_BASE_URL}/confessions/${id}/comments`, { text }, { headers });
        return response.data;
    },

    reportConfession: async (id: string, reason: string): Promise<any> => {
        const headers = await getHeaders();
        const response = await axios.post(`${API_BASE_URL}/confessions/${id}/report`, { reason }, { headers });
        return response.data;
    },

    getConfessionById: async (id: string): Promise<Confession> => {
        const headers = await getHeaders();
        const response = await axios.get(`${API_BASE_URL}/confessions/${id}`, { headers });
        return response.data;
    },

    deleteConfession: async (id: string): Promise<any> => {
        const headers = await getHeaders();
        const response = await axios.delete(`${API_BASE_URL}/confessions/${id}`, { headers });
        return response.data;
    },
};
