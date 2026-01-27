/**
 * Tosyam App
 * @format
 */

import React, { useState, useEffect, useRef } from 'react';
import { StatusBar, useColorScheme, ActivityIndicator, View, Alert, BackHandler, Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import NetInfo from '@react-native-community/netinfo';
import { AppNavigator } from './src/navigation/AppNavigator';
import { Storage } from './src/utils/storage';
import { ToastProvider } from './src/context/ToastContext';
import { API_BASE_URL } from './src/constants/config';
import api from './src/services/api';
import { updateService } from './src/services/updateService';

function App() {
  const isDarkMode = useColorScheme() === 'dark';
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const connectionCheckInterval = useRef<NodeJS.Timeout | null>(null);
  const isCheckingConnection = useRef(false);

  useEffect(() => {
    checkAuth();
    const cleanup = setupConnectionMonitoring();

    // Uygulama açıldığında güncelleme kontrolü yap (backend bağlantısı kurulduktan sonra)
    const checkUpdateAfterConnection = async () => {
      const isConnected = await checkBackendConnection();
      if (isConnected) {
        // Backend bağlantısı başarılı ise güncelleme kontrolü yap
        // Küçük bir gecikme ekle ki auth kontrolü tamamlansın
        setTimeout(() => {
          updateService.checkAndShowUpdate();
        }, 2000);
      }
    };

    // İlk kontrol - backend bağlantısı kurulduktan sonra
    checkUpdateAfterConnection();

    return () => {
      if (cleanup) {
        cleanup();
      }
      if (connectionCheckInterval.current) {
        clearInterval(connectionCheckInterval.current);
      }
    };
  }, []);

  const checkAuth = async () => {
    try {
      const token = Storage.getString('token');
      setIsAuthenticated(!!token);
    } catch (error) {
      console.error('Auth kontrolü hatası:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  const checkBackendConnection = async (): Promise<boolean> => {
    if (isCheckingConnection.current) {
      return true; // Zaten kontrol ediliyor, tekrar kontrol etme
    }

    try {
      isCheckingConnection.current = true;

      // Network durumunu kontrol et
      const netInfo = await NetInfo.fetch();
      if (!netInfo.isConnected) {
        console.log('❌ İnternet bağlantısı yok');
        return false;
      }

      // Backend'e ping at (health check endpoint)
      try {
        const response = await api.get('/health', { timeout: 5000 });
        if (response.status === 200) {
          console.log('✅ Backend bağlantısı aktif');
          return true;
        }
      } catch (apiError: any) {
        // Timeout veya network hatası - backend'e ulaşılamıyor
        console.log('❌ Backend bağlantı hatası:', apiError.message);
        return false;
      }

      return false;
    } catch (error) {
      console.error('❌ Backend bağlantı kontrolü hatası:', error);
      return false;
    } finally {
      isCheckingConnection.current = false;
    }
  };

  const handleConnectionLoss = () => {
    Alert.alert(
      'Bağlantı Hatası',
      'Backend sunucusu ile bağlantı kesildi. Uygulama kapatılacak.',
      [
        {
          text: 'Tamam',
          onPress: () => {
            if (Platform.OS === 'android') {
              BackHandler.exitApp();
            } else {
              // iOS'ta programatik kapatma mümkün değil, ama en azından kullanıcıya bilgi verildi
              console.log('iOS: Uygulama kapatılamaz, kullanıcı manuel olarak kapatmalı');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const setupConnectionMonitoring = () => {
    // İlk kontrol
    checkBackendConnection().then((isConnected) => {
      if (!isConnected) {
        handleConnectionLoss();
      }
    });

    // Network durumu değişikliklerini dinle
    const unsubscribe = NetInfo.addEventListener((state) => {
      if (!state.isConnected) {
        console.log('❌ İnternet bağlantısı kesildi');
        handleConnectionLoss();
      } else {
        // İnternet bağlantısı geri geldi, backend'i kontrol et
        checkBackendConnection().then((isConnected) => {
          if (!isConnected) {
            handleConnectionLoss();
          }
        });
      }
    });

    // Periyodik olarak backend bağlantısını kontrol et (30 saniyede bir)
    connectionCheckInterval.current = setInterval(async () => {
      const isConnected = await checkBackendConnection();
      if (!isConnected) {
        handleConnectionLoss();
        if (connectionCheckInterval.current) {
          clearInterval(connectionCheckInterval.current);
        }
      }
    }, 30000); // 30 saniye

    return () => {
      unsubscribe();
      if (connectionCheckInterval.current) {
        clearInterval(connectionCheckInterval.current);
      }
    };
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' }}>
        <ActivityIndicator size="large" color="#0095f6" />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <ToastProvider>
        <AppNavigator initialRouteName={isAuthenticated ? 'MainTabs' : 'Login'} />
      </ToastProvider>
    </SafeAreaProvider>
  );
}

export default App;
