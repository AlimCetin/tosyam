# 🧪 Paylaşım Özelliği Test Rehberi

## ✅ Kurulum Tamamlandı!

Paketler başarıyla yüklendi. Şimdi uygulamayı test edebilirsiniz.

## 🔄 Uygulamayı Yeniden Derleyin

Native modüller eklendiği için uygulamayı yeniden derlemeniz gerekiyor:

### Android için:
```bash
# Metro bundler'ı durdurun (Ctrl+C)
# Sonra:
npm run android
```

### iOS için:
```bash
cd ios
pod install
cd ..
npm run ios
```

## 📱 Test Adımları

1. **Uygulamayı Açın**
   - Ana sayfaya gidin
   - Bir gönderi görün

2. **Paylaşım Butonuna Tıklayın**
   - Post kartındaki paylaşım ikonuna (üç nokta veya share ikonu) tıklayın

3. **Paylaşım Menüsü Açılacak**
   - Instagram, WhatsApp, Telegram vb. seçenekleri göreceksiniz

4. **Bir Uygulama Seçin**
   - Örneğin WhatsApp seçin
   - Görselin düzgün görüntülendiğini kontrol edin ✅

## 🎯 Beklenen Sonuç

### ❌ Önceki Durum (Hatalı):
```
Ahmet Yılmaz bir gönderi paylaştı
data:image/jpeg;base64,/9j/4AAQSkZJRg...
```

### ✅ Şimdiki Durum (Doğru):
- Görsel düzgün şekilde görünür
- Altında kullanıcı adı ve açıklama yazar:
```
Ahmet Yılmaz bir gönderi paylaştı: [gönderi açıklaması]
```

## 🔍 Konsol Logları

Paylaşım işlemi sırasında konsolda şunları göreceksiniz:

```
📤 Paylaş butonuna tıklandı, postId: 123456
✅ Gönderi paylaşıldı
✅ Geçici dosya silindi: /cache/share_1234567890.jpg
```

## 🐛 Sorun mu Var?

### "Module not found" Hatası
```bash
npm start -- --reset-cache
```

### Android'de Çalışmıyor
```bash
cd android
./gradlew clean
cd ..
npm run android
```

### iOS'ta Çalışmıyor
```bash
cd ios
pod deintegrate
pod install
cd ..
npm run ios
```

## 📊 Test Senaryoları

| Senaryo | Beklenen Sonuç |
|---------|----------------|
| Base64 görsel paylaş | ✅ Görsel dosya olarak paylaşılır |
| URL görsel paylaş | ✅ Doğrudan URL paylaşılır |
| Video paylaş | ✅ Video dosya olarak paylaşılır |
| Sadece metin paylaş | ✅ Metin paylaşılır |
| Instagram'a paylaş | ✅ Görsel Instagram'da görünür |
| WhatsApp'a paylaş | ✅ Görsel + metin |
| Paylaşımı iptal et | ✅ Hata vermeden kapanır |

## 💡 İpuçları

1. **İlk test için WhatsApp kullanın**: En güvenilir platform
2. **Görselli bir gönderi seçin**: Boş gönderi paylaşmayın
3. **Geçici dosyalar otomatik silinir**: Cache klasörü dolmaz

## 🎨 Farklı Platformlarda Test

### Instagram
- Görsel Story veya Post olarak paylaşılabilir
- Caption otomatik eklenir

### WhatsApp
- Kişi seçildikten sonra görsel + metin gönderilir
- Düzenleme yapılabilir

### Telegram
- Görsel + caption birlikte gönderilir
- Kalite korunur

## ✨ Yeni Özellikler

- 🖼️ Görsel dosya olarak paylaşım
- 🎥 Video paylaşım desteği
- 🧹 Otomatik geçici dosya temizliği
- 📝 Kullanıcı adı + açıklama ekleme
- ❌ Hata yönetimi

## 🎉 Tebrikler!

Paylaşım özelliği artık Instagram gibi çalışıyor! 🚀

