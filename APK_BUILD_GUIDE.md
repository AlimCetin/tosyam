# APK Oluşturma Kılavuzu

Bu kılavuz, React Native uygulamanızı APK olarak hazırlamak için gerekli adımları içerir.

## 🚀 Hızlı Başlangıç (Test APK - Telefona Kurulum)

### Adım 1: APK Oluşturma

Windows PowerShell veya Command Prompt'ta:

```bash
cd android
gradlew.bat assembleRelease
```

**Not:** İlk build 5-10 dakika sürebilir. Sonraki build'ler daha hızlı olacaktır.

### Adım 2: APK Dosyasını Bulma

APK dosyası şu konumda oluşacak:
```
android\app\build\outputs\apk\release\app-release.apk
```

### Adım 3: Telefona Kopyalama ve Kurulum

#### Yöntem 1: USB ile Kopyalama
1. Telefonunuzu USB kablosu ile bilgisayara bağlayın
2. Telefonda "Dosya Aktarımı" (MTP) modunu seçin
3. `app-release.apk` dosyasını telefonunuzun herhangi bir klasörüne kopyalayın (örneğin: İndirilenler/Downloads)
4. Telefonda dosya yöneticisini açın ve APK dosyasına dokunun
5. "Bilinmeyen kaynaklardan uygulama yükleme" izni istenirse, Ayarlar'dan izin verin
6. Kurulum butonuna basın

#### Yöntem 2: E-posta veya Cloud ile
1. APK dosyasını kendinize e-posta ile gönderin veya Google Drive/Dropbox'a yükleyin
2. Telefonda e-postayı açın veya cloud servisinden indirin
3. İndirilen APK dosyasına dokunun ve kurun

#### Yöntem 3: ADB ile Direkt Kurulum (Geliştiriciler için)
```bash
adb install android\app\build\outputs\apk\release\app-release.apk
```

### ⚠️ Önemli Notlar

- **İlk Kurulum:** Telefonda "Bilinmeyen kaynaklardan uygulama yükleme" iznini açmanız gerekebilir
  - Ayarlar → Güvenlik → Bilinmeyen Kaynaklar (Android 7 ve öncesi)
  - Ayarlar → Uygulamalar → Özel Erişim → Bilinmeyen Uygulamaları Yükle (Android 8+)
  
- **Güvenlik Uyarısı:** Bu test APK'sı debug keystore ile imzalanmıştır. Sadece test amaçlıdır.

- **APK Boyutu:** Genellikle 20-50 MB arasındadır

## Production APK (Release Keystore ile)

### 1. Release Keystore Oluşturma

Production için güvenli bir keystore oluşturun:

```bash
cd android/app
keytool -genkeypair -v -storetype PKCS12 -keystore release.keystore -alias tosyam-key -keyalg RSA -keysize 2048 -validity 10000
```

Bu komut sizden şunları soracak:
- Keystore şifresi (unutmayın, önemli!)
- Key şifresi (genelde keystore şifresiyle aynı)
- İsim, organizasyon bilgileri vb.

**ÖNEMLİ:** Keystore dosyasını ve şifrelerini güvenli bir yerde saklayın. Kaybederseniz uygulamanızı güncelleyemezsiniz!

### 2. Keystore Yapılandırması

`android/gradle.properties` dosyasına şu satırları ekleyin:

```properties
MYAPP_RELEASE_STORE_FILE=release.keystore
MYAPP_RELEASE_KEY_ALIAS=tosyam-key
MYAPP_RELEASE_STORE_PASSWORD=your-keystore-password
MYAPP_RELEASE_KEY_PASSWORD=your-key-password
```

**GÜVENLİK UYARISI:** `gradle.properties` dosyasını Git'e commit etmeyin! `.gitignore` dosyasına ekleyin.

### 3. build.gradle Güncelleme

`android/app/build.gradle` dosyasında `signingConfigs` bölümünü güncelleyin:

```gradle
signingConfigs {
    debug {
        storeFile file('debug.keystore')
        storePassword 'android'
        keyAlias 'androiddebugkey'
        keyPassword 'android'
    }
    release {
        if (project.hasProperty('MYAPP_RELEASE_STORE_FILE')) {
            storeFile file(MYAPP_RELEASE_STORE_FILE)
            storePassword MYAPP_RELEASE_STORE_PASSWORD
            keyAlias MYAPP_RELEASE_KEY_ALIAS
            keyPassword MYAPP_RELEASE_KEY_PASSWORD
        }
    }
}
```

Ve `buildTypes` bölümünde release için doğru signing config'i kullanın:

```gradle
buildTypes {
    release {
        signingConfig signingConfigs.release
        minifyEnabled enableProguardInReleaseBuilds
        proguardFiles getDefaultProguardFile("proguard-android.txt"), "proguard-rules.pro"
    }
}
```

### 4. APK Oluşturma

```bash
cd android
./gradlew assembleRelease
```

## APK Dosya Konumları

- **Release APK:** `android/app/build/outputs/apk/release/app-release.apk`
- **Debug APK:** `android/app/build/outputs/apk/debug/app-debug.apk`

## AAB (Android App Bundle) Oluşturma

Google Play Store'a yüklemek için AAB formatı tercih edilir:

```bash
cd android
./gradlew bundleRelease
```

AAB dosyası: `android/app/build/outputs/bundle/release/app-release.aab`

## Sorun Giderme

### Gradle Wrapper Hatası
Windows'ta `./gradlew` yerine `gradlew.bat` kullanın:
```bash
cd android
gradlew.bat assembleRelease
```

### Keystore Bulunamadı
Keystore dosyasının `android/app/` klasöründe olduğundan emin olun.

### Şifre Hatası
`gradle.properties` dosyasındaki şifrelerin doğru olduğundan emin olun.

## Notlar

- İlk build biraz uzun sürebilir (5-10 dakika)
- APK boyutu genellikle 20-50 MB arasındadır
- Production APK'yı test etmeden dağıtmayın
- Her yeni sürüm için `versionCode` ve `versionName`'i `build.gradle`'da güncelleyin

