# Mobil Uygulama Güncelleme Sistemi

Bu dokümantasyon, uygulamaya eklenen mobil güncelleme kontrol sisteminin nasıl kullanılacağını açıklar.

## 📱 Nasıl Çalışır?

Uygulama her açıldığında (veya backend bağlantısı kurulduktan sonra) otomatik olarak güncelleme kontrolü yapılır:

1. **Backend'e Versiyon Sorgusu**: Mevcut uygulama versiyonu backend'e gönderilir
2. **Versiyon Karşılaştırması**: Backend, en son versiyon ile karşılaştırma yapar
3. **Güncelleme Bildirimi**: Yeni versiyon varsa kullanıcıya bildirim gösterilir
4. **Mağaza Yönlendirme**: Kullanıcı "Güncelle" butonuna tıklarsa ilgili mağazaya yönlendirilir

## 🔧 Kurulum ve Yapılandırma

### 1. Uygulama Versiyonunu Güncelleme

**Frontend (React Native):**
```typescript
// src/constants/appVersion.ts
export const APP_VERSION = '1.0.0'; // Bu değeri güncelle
```

**Android:**
```gradle
// android/app/build.gradle
defaultConfig {
    versionCode 1        // Bu değeri artır (her build için +1)
    versionName "1.0.0"  // Bu değeri APP_VERSION ile senkronize tut
}
```

**iOS:**
- Xcode projesinde `Info.plist` veya Xcode UI'dan `CFBundleShortVersionString` değerini güncelleyin
- `APP_VERSION` ile senkronize tutun

### 2. Backend Versiyon Ayarları

**Backend:**
```typescript
// 1_backend/src/app.controller.ts
private readonly LATEST_VERSION = '1.0.0'; // En son versiyonu buraya yazın
private readonly MIN_SUPPORTED_VERSION = '1.0.0'; // Minimum desteklenen versiyon

// Mağaza URL'lerini güncelleyin
androidStoreUrl: 'https://play.google.com/store/apps/details?id=com.tosyam',
iosStoreUrl: 'https://apps.apple.com/app/idYOUR_APP_ID', // iOS App Store ID'nizi ekleyin
```

### 3. Yeni Versiyon Yayınlarken

**Adımlar:**
1. **Frontend versiyonunu güncelleyin:**
   - `src/constants/appVersion.ts` → `APP_VERSION = '1.0.1'`
   - Android `build.gradle` → `versionName = "1.0.1"`, `versionCode += 1`
   - iOS Xcode → Versiyon numarasını güncelleyin

2. **Backend versiyonunu güncelleyin:**
   - `1_backend/src/app.controller.ts` → `LATEST_VERSION = '1.0.1'`
   - Eğer kritik güvenlik güncellemesi ise: `MIN_SUPPORTED_VERSION` değerini güncelleyin

3. **Yeni APK/IPA oluşturun:**
   ```bash
   # Android
   cd android && ./gradlew assembleRelease

   # iOS
   # Xcode'dan Archive oluşturun
   ```

4. **Mağazaya yükleyin:**
   - Google Play Store (Android)
   - Apple App Store (iOS)

5. **Backend'i deploy edin** (yeni versiyon bilgisi ile)

## 🎯 Özellikler

### Otomatik Kontrol
- Uygulama her açıldığında otomatik kontrol
- Backend bağlantısı kurulduktan sonra kontrol
- 24 saatte bir kontrol (spam önleme)

### Versiyon Karşılaştırması
- Semver formatı: `MAJOR.MINOR.PATCH` (örn: `1.0.0`)
- Otomatik versiyon karşılaştırması
- Zorunlu ve opsiyonel güncellemeler

### Kullanıcı Deneyimi
- **Zorunlu Güncelleme**: Kullanıcı "Daha Sonra" diyemez, direkt mağazaya yönlendirilir
- **Opsiyonel Güncelleme**: Kullanıcı "Daha Sonra" veya "Güncelle" seçeneğini seçebilir
- Mağaza URL'lerine otomatik yönlendirme

## 📡 API Endpoint

### GET `/api/app/version-check`

**Query Parameters:**
- `currentVersion` (string, optional): Mevcut uygulama versiyonu
- `platform` (string, optional): Platform bilgisi (`android` veya `ios`)

**Response:**
```json
{
  "currentVersion": "1.0.0",
  "latestVersion": "1.0.1",
  "updateRequired": true,
  "forceUpdate": false,
  "message": "Yeni versiyon 1.0.1 mevcut. Önerilen özellikler ve hata düzeltmeleri için lütfen güncelleyin.",
  "androidStoreUrl": "https://play.google.com/store/apps/details?id=com.tosyam",
  "iosStoreUrl": "https://apps.apple.com/app/idYOUR_APP_ID",
  "platform": "android"
}
```

**Response Alanları:**
- `updateRequired` (boolean): Güncelleme gerekip gerekmediği
- `forceUpdate` (boolean): Zorunlu güncelleme mi (kritik güvenlik)
- `message` (string): Kullanıcıya gösterilecek mesaj
- `androidStoreUrl` (string): Android Play Store URL'i
- `iosStoreUrl` (string): iOS App Store URL'i

## 🔄 Manuel Güncelleme Kontrolü

Kod içinde manuel olarak güncelleme kontrolü yapmak için:

```typescript
import { updateService } from './src/services/updateService';

// Güncelleme kontrolü yap ve bildirim göster
await updateService.checkAndShowUpdate();

// Sadece güncelleme bilgisini al (bildirim gösterme)
const updateInfo = await updateService.checkForUpdate();
if (updateInfo?.updateRequired) {
  console.log('Yeni versiyon mevcut:', updateInfo.latestVersion);
}
```

## 📝 Önemli Notlar

1. **Versiyon Senkronizasyonu**: Frontend, Android ve iOS versiyonlarını her zaman senkronize tutun
2. **Backend Versiyonu**: Backend'deki `LATEST_VERSION` değeri, mağazada yayınlanan en son versiyonla eşleşmeli
3. **Zorunlu Güncelleme**: Kritik güvenlik açıkları için `MIN_SUPPORTED_VERSION` kullanın
4. **Mağaza URL'leri**: iOS App Store ID'nizi mutlaka güncelleyin
5. **Test**: Yeni versiyon yayınlamadan önce güncelleme kontrolünü test edin

## 🧪 Test Etme

### Güncelleme Kontrolünü Test Etme

1. **Backend'de versiyonu yükseltin:**
   ```typescript
   // 1_backend/src/app.controller.ts
   LATEST_VERSION = '1.0.1' // Frontend'den daha yüksek yapın
   ```

2. **Uygulamayı açın** - Güncelleme bildirimi görünmeli

3. **"Güncelle" butonuna tıklayın** - Mağaza URL'si açılmalı

### Zorunlu Güncellemeyi Test Etme

1. **Backend'de minimum versiyonu yükseltin:**
   ```typescript
   MIN_SUPPORTED_VERSION = '1.0.1' // Mevcut versiyondan yüksek yapın
   ```

2. **Uygulamayı açın** - "Daha Sonra" seçeneği olmayan zorunlu güncelleme bildirimi görünmeli

## 📚 Dosya Yapısı

```
src/
  ├── constants/
  │   └── appVersion.ts          # Uygulama versiyonu sabiti
  ├── services/
  │   └── updateService.ts       # Güncelleme kontrol servisi
  └── ...

1_backend/src/
  └── app.controller.ts          # Versiyon kontrol endpoint'i
```

## ❓ Sorun Giderme

**Güncelleme bildirimi görünmüyor:**
- Backend bağlantısını kontrol edin
- Console loglarını kontrol edin
- `updateService.checkAndShowUpdate()` fonksiyonunun çağrıldığından emin olun

**Yanlış versiyon gösteriliyor:**
- `APP_VERSION` değerini kontrol edin
- Backend'deki `LATEST_VERSION` değerini kontrol edin
- Uygulamayı yeniden başlatın

**Mağaza URL'i açılmıyor:**
- Store URL'lerinin doğru olduğundan emin olun
- iOS için App Store ID'yi güncelleyin
- Android için package name'i kontrol edin (`com.tosyam`)
