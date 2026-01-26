// Android emülatör için localhost yerine 10.0.2.2 kullanılmalı
// iOS simülatör ve gerçek cihazlar için localhost çalışır
import { Platform } from 'react-native';

// Development modunu kontrol et
// NOT: Production build'lerde sadece release build'lerde production URL kullanılır
// Development için her zaman localhost kullan
//const USE_PRODUCTION_API = true; // Development için false, production build için true yapın
const USE_PRODUCTION_API = false;

const getBaseUrl = () => {
  // Production API kullanılacaksa
  if (USE_PRODUCTION_API) {
    const url = 'https://simpsons-variables-salary-starts.trycloudflare.com/api';
    // const url= 'https://api.tosyam.com/api'
    console.log('🔧 Using PRODUCTION API URL:', url);
    return url;
  }

  // Development - her zaman local backend kullan
  if (Platform.OS === 'android') {
    // Android emülatör için özel IP
    const url = 'http://10.0.2.2:3000/api';
    console.log('🔧 Using Android emulator API URL:', url);
    return url;
  }

  // iOS simülatör ve gerçek cihazlar için localhost
  const url = 'http://localhost:3000/api';
  console.log('🔧 Using localhost API URL:', url);
  return url;
};

const getSocketUrl = () => {
  if (USE_PRODUCTION_API) {
    // return'https://api.tosyam.com'
    return 'https://simpsons-variables-salary-starts.trycloudflare.com';
  }

  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:3000';
  }
  return 'http://localhost:3000';
};

export const API_BASE_URL = getBaseUrl();
export const SOCKET_URL = getSocketUrl();

// URL'in doğru olduğunu console'da göster
console.log('📡 API Base URL:', API_BASE_URL);
console.log('📡 Socket URL:', SOCKET_URL);
console.log('🔍 __DEV__:', __DEV__);
console.log('🔍 USE_PRODUCTION_API:', USE_PRODUCTION_API);
