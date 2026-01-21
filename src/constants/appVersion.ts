// Uygulama versiyon bilgisi
// package.json'dan gelen versiyon veya manuel olarak güncellenebilir
// Production build'lerde build.gradle (Android) ve Info.plist/Xcode (iOS) 
// versiyonlarıyla senkronize tutulmalıdır

// package.json'dan versiyon al (development için)
// Not: React Native'de package.json'dan otomatik almak için 
// ek paketler gerekir, bu yüzden manuel olarak tutuyoruz

export const APP_VERSION = '1.0.0';

// Versiyon formatı: MAJOR.MINOR.PATCH (örn: 1.0.0, 1.0.1, 1.1.0, 2.0.0)
// - MAJOR: Büyük değişiklikler (API değişiklikleri)
// - MINOR: Yeni özellikler (geriye uyumlu)
// - PATCH: Hata düzeltmeleri
