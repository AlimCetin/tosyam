import axios, { AxiosRequestConfig } from 'axios';
import { Storage } from '../utils/storage';
import { API_BASE_URL } from '../constants/config';
import { reset } from '../navigation/navigationRef';
import { authService } from './authService';

// Extended AxiosRequestConfig to include _retry flag
interface ExtendedAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

// API base URL'ini console'da göster
console.log('🌐 Axios API Base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 saniye timeout
});

// Request interceptor - token ekleme
api.interceptors.request.use(
  (config) => {
    const token = Storage.getString('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Tam URL'i oluştur
    const fullUrl = `${config.baseURL}${config.url}`;

    // Request log
    console.log('📤 REQUEST:', {
      Method: config.method?.toUpperCase(),
      URL: fullUrl,
      Data: config.data || null,
    });

    return config;
  },
  (error) => {
    console.error('❌ REQUEST ERROR:', error);
    return Promise.reject(error);
  }
);

// Response interceptor - hata yakalama ve loglama
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (error?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(prom => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });

  failedQueue = [];
};

api.interceptors.response.use(
  (response) => {
    const fullUrl = `${response.config.baseURL}${response.config.url}`;

    // Response log
    console.log('✅ RESPONSE:', {
      Method: response.config.method?.toUpperCase(),
      URL: fullUrl,
      Status: response.status,
      Data: response.data,
    });

    return response;
  },
  async (error: any) => {
    const originalRequest: ExtendedAxiosRequestConfig = error.config;

    if (error.response) {
      // Sunucudan hata yanıtı geldi
      const fullUrl = `${error.config?.baseURL}${error.config?.url}`;
      const status = error.response.status;

      console.error('❌ RESPONSE ERROR:', {
        Method: error.config?.method?.toUpperCase(),
        URL: fullUrl,
        Status: status,
        Error: error.response.data,
      });

      // 401 Unauthorized hatası - token geçersiz veya süresi dolmuş
      if (status === 401 && originalRequest && !originalRequest._retry) {
        // Refresh token endpoint'ine yapılan isteklerde döngü oluşmasını engelle
        if (originalRequest.url?.includes('/auth/refresh')) {
          console.log('🔒 Refresh token geçersiz, logout yapılıyor...');
          authService.logout();
          reset(0, [{ name: 'Login' }]);
          return Promise.reject(error);
        }

        if (isRefreshing) {
          // Zaten refresh işlemi devam ediyor, kuyruğa ekle
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject });
          })
            .then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return api(originalRequest);
            })
            .catch(err => {
              return Promise.reject(err);
            });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          console.log('🔄 Access token yenileniyor...');
          const refreshed = await authService.refreshToken();

          if (refreshed) {
            const newToken = Storage.getString('token');
            processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            isRefreshing = false;
            return api(originalRequest);
          } else {
            throw new Error('Token refresh failed');
          }
        } catch (refreshError) {
          processQueue(refreshError, null);
          isRefreshing = false;
          console.log('🔒 Token yenilenemedi, logout yapılıyor...');
          authService.logout();
          reset(0, [{ name: 'Login' }]);
          return Promise.reject(refreshError);
        }
      }
    } else if (error.request) {
      // İstek gönderildi ama yanıt alınamadı (network hatası)
      const fullUrl = `${error.config?.baseURL}${error.config?.url}`;
      console.error('❌ NETWORK ERROR:', {
        Method: error.config?.method?.toUpperCase(),
        URL: fullUrl,
        Status: 'No Response',
        Error: error.message,
      });
    } else {
      // İstek hazırlanırken hata oluştu
      console.error('❌ REQUEST ERROR:', error.message);
    }
    return Promise.reject(error);
  }
);

export default api;
