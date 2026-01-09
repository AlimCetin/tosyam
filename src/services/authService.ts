import axios from 'axios';
import { Storage } from '../utils/storage';
import { API_BASE_URL } from '../constants/config';
import api from './api';

const refreshApi = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

export const authService = {
  login: async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    
    console.log('🔑 Login response:', { 
      hasAccessToken: !!data.accessToken, 
      hasRefreshToken: !!data.refreshToken,
      accessToken: data.accessToken?.substring(0, 20) + '...',
      refreshToken: data.refreshToken?.substring(0, 20) + '...',
    });
    
    if (data.accessToken) {
      Storage.setString('token', data.accessToken);
      const saved = Storage.getString('token');
      console.log('✅ Access token kaydedildi:', saved ? 'EVET' : 'HAYIR', saved?.substring(0, 20) + '...');
    }
    
    if (data.refreshToken) {
      Storage.setString('refreshToken', data.refreshToken);
      const saved = Storage.getString('refreshToken');
      console.log('✅ Refresh token kaydedildi:', saved ? 'EVET' : 'HAYIR', saved?.substring(0, 20) + '...');
    }
    
    if (data.user) {
      Storage.setObject('user', data.user);
    }
    
    // Tüm storage keys'i kontrol et
    const allKeys = Storage.getAllKeys();
    console.log('📦 Storage keys:', allKeys);
    
    return data;
  },

  register: async (email: string, password: string, fullName: string) => {
    const { data } = await api.post('/auth/register', { email, password, fullName });
    
    console.log('🔑 Register response:', { 
      hasAccessToken: !!data.accessToken, 
      hasRefreshToken: !!data.refreshToken,
      accessToken: data.accessToken?.substring(0, 20) + '...',
      refreshToken: data.refreshToken?.substring(0, 20) + '...',
    });
    
    if (data.accessToken) {
      Storage.setString('token', data.accessToken);
      const saved = Storage.getString('token');
      console.log('✅ Access token kaydedildi:', saved ? 'EVET' : 'HAYIR', saved?.substring(0, 20) + '...');
    }
    
    if (data.refreshToken) {
      Storage.setString('refreshToken', data.refreshToken);
      const saved = Storage.getString('refreshToken');
      console.log('✅ Refresh token kaydedildi:', saved ? 'EVET' : 'HAYIR', saved?.substring(0, 20) + '...');
    }
    
    if (data.user) {
      Storage.setObject('user', data.user);
    }
    
    // Tüm storage keys'i kontrol et
    const allKeys = Storage.getAllKeys();
    console.log('📦 Storage keys:', allKeys);
    
    return data;
  },

  refreshToken: async (): Promise<boolean> => {
    try {
      const allKeys = Storage.getAllKeys();
      console.log('🔄 Refresh token kontrolü - Tüm keys:', allKeys);
      
      const refreshToken = Storage.getString('refreshToken');
      const accessToken = Storage.getString('token');
      
      console.log('🔄 Token durumu:', { 
        hasRefreshToken: !!refreshToken,
        hasAccessToken: !!accessToken,
        refreshTokenLength: refreshToken?.length || 0,
        accessTokenLength: accessToken?.length || 0,
      });
      
      if (!refreshToken) {
        console.log('❌ Refresh token bulunamadı');
        return false;
      }

      const { data } = await refreshApi.post('/auth/refresh', { refreshToken });
      
      if (data.accessToken && data.refreshToken) {
        Storage.setString('token', data.accessToken);
        Storage.setString('refreshToken', data.refreshToken);
        console.log('✅ Token başarıyla yenilendi');
        return true;
      }
      
      return false;
    } catch (error: any) {
      console.error('❌ Refresh token failed:', error.response?.data || error.message);
      return false;
    }
  },

  logout: () => {
    Storage.delete('token');
    Storage.delete('refreshToken');
    Storage.delete('user');
    console.log('🚪 Logout yapıldı, storage temizlendi');
  },

  getCurrentUser: () => {
    return Storage.getObject('user');
  },

  setCurrentUser: (user: any) => {
    Storage.setObject('user', user);
  },
};
