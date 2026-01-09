import { MMKV } from 'react-native-mmkv';

// Storage interface
interface StorageInterface {
  set(key: string, value: string | number | boolean): void;
  getString(key: string): string | undefined;
  getBoolean(key: string): boolean | undefined;
  getNumber(key: string): number | undefined;
  delete(key: string): void;
  clearAll(): void;
  contains(key: string): boolean;
  getAllKeys(): string[];
}

// In-memory fallback storage (sadece remote debugger için)
class InMemoryStorage implements StorageInterface {
  private data: Map<string, string> = new Map();

  set(key: string, value: string | number | boolean): void {
    this.data.set(key, String(value));
  }

  getString(key: string): string | undefined {
    return this.data.get(key);
  }

  getBoolean(key: string): boolean | undefined {
    const value = this.data.get(key);
    return value === 'true' ? true : value === 'false' ? false : undefined;
  }

  getNumber(key: string): number | undefined {
    const value = this.data.get(key);
    const num = Number(value);
    return isNaN(num) ? undefined : num;
  }

  delete(key: string): void {
    this.data.delete(key);
  }

  clearAll(): void {
    this.data.clear();
  }

  contains(key: string): boolean {
    return this.data.has(key);
  }

  getAllKeys(): string[] {
    return Array.from(this.data.keys());
  }
}

// Remote debugger kontrolü
const isRemoteDebuggerActive = (): boolean => {
  try {
    // Chrome remote debugger aktifse bu true döner
    return typeof (global as any).__REMOTE_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined' ||
           typeof (window as any).__REACT_DEVTOOLS_GLOBAL_HOOK__ !== 'undefined';
  } catch {
    return false;
  }
};

// MMKV Storage - Remote debugger varsa fallback kullan
let storage: StorageInterface;
let usingFallback = false;

try {
  // Remote debugger kontrolü
  if (isRemoteDebuggerActive()) {
    console.warn('⚠️ Remote debugger aktif, in-memory storage kullanılıyor (veriler uygulama yeniden başlatıldığında kaybolur)');
    storage = new InMemoryStorage();
    usingFallback = true;
  } else {
    // MMKV instance oluştur
    storage = new MMKV({
      id: 'tosyam-storage',
      encryptionKey: 'tosyam-encryption-key',
    });
    console.log('✅ MMKV storage başarıyla başlatıldı');
  }
} catch (error: any) {
  const errorMessage = error?.message || 'Unknown error';
  
  // MMKV hatası ve remote debugger yoksa fallback kullan
  if (errorMessage.includes('JSI') || errorMessage.includes('on-device')) {
    console.warn('⚠️ MMKV başlatılamadı (remote debugger?), in-memory storage kullanılıyor');
    storage = new InMemoryStorage();
    usingFallback = true;
  } else {
    console.error('❌ MMKV başlatılamadı:', error);
    throw new Error(`MMKV storage başlatılamadı: ${errorMessage}`);
  }
}

export const Storage = {
  setString: (key: string, value: string) => {
    try {
      storage.set(key, value);
    } catch (error) {
      console.error(`Storage.setString hatası (${key}):`, error);
      throw error;
    }
  },

  getString: (key: string): string | undefined => {
    try {
      return storage.getString(key);
    } catch (error) {
      console.error(`Storage.getString hatası (${key}):`, error);
      return undefined;
    }
  },

  setObject: <T>(key: string, value: T) => {
    try {
      storage.set(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Storage.setObject hatası (${key}):`, error);
      throw error;
    }
  },

  getObject: <T>(key: string): T | undefined => {
    try {
      const value = storage.getString(key);
      return value ? JSON.parse(value) : undefined;
    } catch (error) {
      console.error(`Storage.getObject hatası (${key}):`, error);
      return undefined;
    }
  },

  setBoolean: (key: string, value: boolean) => {
    try {
      storage.set(key, value);
    } catch (error) {
      console.error(`Storage.setBoolean hatası (${key}):`, error);
      throw error;
    }
  },

  getBoolean: (key: string): boolean | undefined => {
    try {
      return storage.getBoolean(key);
    } catch (error) {
      console.error(`Storage.getBoolean hatası (${key}):`, error);
      return undefined;
    }
  },

  setNumber: (key: string, value: number) => {
    try {
      storage.set(key, value);
    } catch (error) {
      console.error(`Storage.setNumber hatası (${key}):`, error);
      throw error;
    }
  },

  getNumber: (key: string): number | undefined => {
    try {
      return storage.getNumber(key);
    } catch (error) {
      console.error(`Storage.getNumber hatası (${key}):`, error);
      return undefined;
    }
  },

  delete: (key: string) => {
    try {
      storage.delete(key);
    } catch (error) {
      console.error(`Storage.delete hatası (${key}):`, error);
    }
  },

  clearAll: () => {
    try {
      storage.clearAll();
    } catch (error) {
      console.error('Storage.clearAll hatası:', error);
    }
  },

  contains: (key: string): boolean => {
    try {
      return storage.contains(key);
    } catch (error) {
      console.error(`Storage.contains hatası (${key}):`, error);
      return false;
    }
  },

  getAllKeys: (): string[] => {
    try {
      return storage.getAllKeys();
    } catch (error) {
      console.error('Storage.getAllKeys hatası:', error);
      return [];
    }
  },

  // Debug: Hangi storage kullanılıyor?
  isUsingFallback: () => usingFallback,
};
