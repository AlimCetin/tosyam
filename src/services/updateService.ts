import { Platform, Alert, Linking } from 'react-native';
import api from './api';
import { APP_VERSION } from '../constants/appVersion';

export interface UpdateInfo {
  latestVersion: string;
  currentVersion: string;
  updateRequired: boolean;
  updateMessage?: string;
  forceUpdate?: boolean;
  storeUrl?: {
    android?: string;
    ios?: string;
  };
}

class UpdateService {
  private lastCheckTime: number = 0;
  private readonly CHECK_INTERVAL = 24 * 60 * 60 * 1000; // 24 saat
  private readonly STORAGE_KEY_LAST_CHECK = 'last_update_check';

  /**
   * Mevcut uygulama versiyonunu döndürür
   */
  getCurrentVersion(): string {
    return APP_VERSION;
  }

  /**
   * Backend'den en son versiyon bilgisini kontrol eder
   */
  async checkForUpdate(): Promise<UpdateInfo | null> {
    try {
      const currentVersion = this.getCurrentVersion();
      
      // Backend'den versiyon bilgisi al
      const response = await api.get('/app/version-check', {
        params: {
          currentVersion,
          platform: Platform.OS,
        },
        timeout: 5000, // 5 saniye timeout
      });

      const data = response.data;
      
      const updateInfo: UpdateInfo = {
        currentVersion,
        latestVersion: data.latestVersion || currentVersion,
        updateRequired: this.isUpdateRequired(currentVersion, data.latestVersion),
        updateMessage: data.message || 'Yeni bir güncelleme mevcut.',
        forceUpdate: data.forceUpdate || false,
        storeUrl: {
          android: data.androidStoreUrl || 'https://play.google.com/store/apps/details?id=com.tosyam',
          ios: data.iosStoreUrl || 'https://apps.apple.com/app/idYOUR_APP_ID',
        },
      };

      console.log('📱 Güncelleme kontrolü:', updateInfo);
      
      return updateInfo;
    } catch (error: any) {
      // Backend hatası - sessizce geç, kullanıcıyı rahatsız etme
      console.log('ℹ️ Güncelleme kontrolü yapılamadı:', error.message);
      return null;
    }
  }

  /**
   * Versiyon numaralarını karşılaştırarak güncelleme gerekip gerekmediğini kontrol eder
   */
  private isUpdateRequired(current: string, latest: string): boolean {
    if (!latest || latest === current) {
      return false;
    }

    // Basit versiyon karşılaştırması (örn: "1.0.0" vs "1.0.1")
    const currentParts = current.split('.').map(Number);
    const latestParts = latest.split('.').map(Number);

    for (let i = 0; i < Math.max(currentParts.length, latestParts.length); i++) {
      const currentPart = currentParts[i] || 0;
      const latestPart = latestParts[i] || 0;

      if (latestPart > currentPart) {
        return true;
      } else if (latestPart < currentPart) {
        return false;
      }
    }

    return false;
  }

  /**
   * Güncelleme kontrolü yapılıp yapılmadığını kontrol eder (spam önleme)
   */
  shouldCheckUpdate(): boolean {
    const now = Date.now();
    // Son 24 saat içinde kontrol edildiyse tekrar kontrol etme
    if (now - this.lastCheckTime < this.CHECK_INTERVAL) {
      return false;
    }
    return true;
  }

  /**
   * Güncelleme bildirimi gösterir
   */
  showUpdateAlert(updateInfo: UpdateInfo) {
    const storeUrl = Platform.OS === 'ios' 
      ? updateInfo.storeUrl?.ios 
      : updateInfo.storeUrl?.android;

    const buttons = updateInfo.forceUpdate
      ? [
          {
            text: 'Güncelle',
            onPress: () => {
              if (storeUrl) {
                Linking.openURL(storeUrl).catch(err => {
                  console.error('❌ Mağaza açılamadı:', err);
                  Alert.alert('Hata', 'Mağaza açılamadı. Lütfen manuel olarak uygulama mağazasından güncelleyin.');
                });
              }
            },
          },
        ]
      : [
          {
            text: 'Daha Sonra',
            style: 'cancel' as const,
          },
          {
            text: 'Güncelle',
            onPress: () => {
              if (storeUrl) {
                Linking.openURL(storeUrl).catch(err => {
                  console.error('❌ Mağaza açılamadı:', err);
                  Alert.alert('Hata', 'Mağaza açılamadı. Lütfen manuel olarak uygulama mağazasından güncelleyin.');
                });
              }
            },
          },
        ];

    Alert.alert(
      'Güncelleme Mevcut',
      updateInfo.updateMessage || `Yeni versiyon ${updateInfo.latestVersion} mevcut. Lütfen uygulamayı güncelleyin.`,
      buttons,
      { cancelable: !updateInfo.forceUpdate }
    );

    // Son kontrol zamanını güncelle
    this.lastCheckTime = Date.now();
  }

  /**
   * Güncelleme kontrolü yap ve gerekirse bildirim göster
   */
  async checkAndShowUpdate() {
    // Spam önleme kontrolü
    if (!this.shouldCheckUpdate()) {
      return;
    }

    try {
      const updateInfo = await this.checkForUpdate();
      
      if (updateInfo && updateInfo.updateRequired) {
        this.showUpdateAlert(updateInfo);
      } else {
        // Son kontrol zamanını güncelle (başarılı kontrol)
        this.lastCheckTime = Date.now();
        console.log('✅ Uygulama güncel:', this.getCurrentVersion());
      }
    } catch (error) {
      console.error('❌ Güncelleme kontrolü hatası:', error);
    }
  }
}

export const updateService = new UpdateService();
