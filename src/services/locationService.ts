import { Platform, PermissionsAndroid } from 'react-native';
import Geolocation from '@react-native-community/geolocation';
import { MMKV } from 'react-native-mmkv';
import axios from 'axios';

const storage = new MMKV();
const CITY_CACHE_KEY = 'user_detected_city';

export const locationService = {
    async requestPermission() {
        if (Platform.OS === 'ios') {
            return new Promise<boolean>((resolve) => {
                Geolocation.requestAuthorization(
                    () => resolve(true),
                    () => resolve(false)
                );
            });
        }

        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Konum İzni',
                    message: 'Size özel yerel içerikleri göstermek için konumunuza ihtiyacımız var.',
                    buttonNeutral: 'Sonra Sor',
                    buttonNegative: 'İptal',
                    buttonPositive: 'Tamam',
                },
            );
            return granted === PermissionsAndroid.RESULTS.GRANTED;
        }

        return false;
    },

    async getCurrentCity(): Promise<string> {
        // Cache kullanma - her açılışta GPS'ten taze konum al
        const hasPermission = await this.requestPermission();
        if (!hasPermission) {
            // İzin yoksa son bilinen şehre dön (fallback)
            return storage.getString(CITY_CACHE_KEY) || '';
        }

        return new Promise((resolve) => {
            Geolocation.getCurrentPosition(
                async (position) => {
                    try {
                        const { latitude, longitude } = position.coords;
                        // Ücretsiz Reverse Geocoding API (Nominatim)
                        const response = await axios.get(
                            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`,
                            { headers: { 'User-Agent': 'TosyamApp' } }
                        );

                        console.log('🗺️ Nominatim address fields:', JSON.stringify(response.data.address, null, 2));

                        // Nominatim Türkiye için: province=il, town/city=ilçe
                        const il = response.data.address.province || '';
                        const ilce = response.data.address.town ||
                            response.data.address.city ||
                            response.data.address.county || '';

                        // "Kastamonu - Tosya" formatında birleştir
                        const fullLocation = il && ilce ? `${il} - ${ilce}` : il || ilce;

                        console.log('📍 Tespit edilen konum:', { il, ilce, fullLocation });

                        if (fullLocation) {
                            storage.set(CITY_CACHE_KEY, fullLocation);
                        }
                        resolve(fullLocation);
                    } catch (error) {
                        console.error('City detection error:', error);
                        // API hatasında son bilinen şehri döndür
                        resolve(storage.getString(CITY_CACHE_KEY) || '');
                    }
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    // GPS hatasında son bilinen şehri döndür
                    resolve(storage.getString(CITY_CACHE_KEY) || '');
                },
                { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
            );
        });
    },

    clearCache() {
        storage.delete(CITY_CACHE_KEY);
    }
};
