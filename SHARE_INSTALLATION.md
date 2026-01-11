# 📤 Gönderi Paylaşım Özelliği - Kurulum Talimatları

## 🎯 Yapılan Değişiklikler

Gönderi paylaşım özelliği güncellendi. Artık gönderiler paylaşılırken:
- ✅ Görsel/video dosyalar düzgün şekilde paylaşılıyor (base64 string değil)
- ✅ Instagram, WhatsApp, Telegram gibi uygulamalarda görsel görünüyor
- ✅ Gönderi açıklaması ve kullanıcı adı da paylaşılıyor

## 📦 Yeni Paketler

Aşağıdaki paketler `package.json`'a eklendi:
- `react-native-share`: ^10.0.2 - Gelişmiş paylaşım özellikleri
- `react-native-fs`: ^2.20.0 - Dosya sistemi işlemleri

## 🔧 Kurulum Adımları

### 1. Paketleri Yükleyin

```bash
npm install
```

### 2. iOS için Pod Kurulumu

```bash
cd ios
pod install
cd ..
```

### 3. Android için Ek Ayarlar

`android/app/src/main/AndroidManifest.xml` dosyasına aşağıdaki izinleri ekleyin (zaten varsa atlayın):

```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE" />
```

### 4. Uygulamayı Yeniden Derleyin

**Android:**
```bash
npm run android
```

**iOS:**
```bash
npm run ios
```

## 🚀 Nasıl Çalışır?

### Paylaşım Akışı:

1. **Base64 Görsel Algılanır**: Gönderi base64 formatında görsel içeriyorsa
2. **Geçici Dosya Oluşturulur**: Base64 string geçici bir dosyaya dönüştürülür
3. **Dosya Paylaşılır**: react-native-share ile dosya paylaşılır
4. **Temizlik**: Paylaşım sonrası geçici dosya otomatik silinir

### Kod Örneği:

```typescript
const handleShare = async (postId: string) => {
  const post = posts.find((p) => p.id === postId);
  
  if (post.image) {
    // Base64'ü dosyaya dönüştür
    const base64Data = post.image.split(',')[1];
    const filePath = `${RNFS.CachesDirectoryPath}/share_${Date.now()}.jpg`;
    await RNFS.writeFile(filePath, base64Data, 'base64');
    
    // Dosyayı paylaş
    await Share.open({
      title: 'Gönderiyi Paylaş',
      message: `${username} bir gönderi paylaştı`,
      url: filePath,
      type: 'image/jpeg',
    });
    
    // Geçici dosyayı sil
    await RNFS.unlink(filePath);
  }
};
```

## 📱 Desteklenen Platformlar

- ✅ **Android**: Tüm paylaşım uygulamaları
- ✅ **iOS**: Tüm paylaşım uygulamaları
- ✅ **Instagram**: Görsel paylaşımı
- ✅ **WhatsApp**: Görsel + metin
- ✅ **Telegram**: Görsel + metin
- ✅ **Facebook**: Görsel + metin

## 🐛 Sorun Giderme

### Metro Bundler Hatası
Eğer "Unable to resolve module" hatası alırsanız:
```bash
npm start -- --reset-cache
```

### Android Build Hatası
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS Build Hatası
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

### Paylaşım Çalışmıyor
1. Uygulamayı tamamen kapatıp yeniden açın
2. Cihazı yeniden başlatın
3. Gerekli izinlerin verildiğinden emin olun

## 📝 Notlar

- Geçici dosyalar `CachesDirectoryPath` içinde oluşturulur
- Dosyalar paylaşım sonrası 2 saniye içinde otomatik silinir
- Base64 olmayan URL'ler doğrudan paylaşılır
- Video paylaşımı da desteklenir

## 🔄 Güncellemeler

- **v1.0**: İlk implementasyon (base64 string paylaşımı)
- **v2.0**: Tam çözüm (dosya olarak paylaşım)

## 📞 Destek

Sorun yaşarsanız:
1. Konsol loglarını kontrol edin
2. `npm run android` veya `npm run ios` çıktısını inceleyin
3. Gerekirse paketleri yeniden yükleyin

