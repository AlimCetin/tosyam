# Tosyam Backend API (NestJS)

Sosyal medya uygulaması için NestJS backend API.

## 🚀 Kurulum

### Docker ile MongoDB ve Redis

```bash
# MongoDB, Redis ve MongoDB Web UI'yi başlat
docker-compose up -d

# Servis durumunu kontrol et
docker-compose ps

# Servisleri durdur
docker-compose down

# Servisleri ve verileri tamamen silmek için
docker-compose down -v
```

**MongoDB Web Arayüzü:**
- URL: http://localhost:8082
- Kullanıcı adı: `admin`
- Şifre: `admin`

**Redis:**
- Host: `localhost`
- Port: `6379`
- URL: `redis://localhost:6379`

Tarayıcınızda http://localhost:8082 adresine giderek MongoDB veritabanınızı web arayüzünden yönetebilirsiniz.

### Proje Kurulumu

```bash
npm install
```

### Environment Variables (.env dosyası oluşturun)

Proje root dizininde `.env` dosyası oluşturun ve aşağıdaki değişkenleri ekleyin:

```env
# ============================================
# REQUIRED VARIABLES (ZORUNLU)
# ============================================

# JWT Secret Key (min 32 chars for dev, min 64 chars for production)
# Güçlü bir secret oluşturun: openssl rand -base64 64
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-development

# MongoDB Connection URI
MONGODB_URI=mongodb://localhost:27017/tosyam

# ============================================
# OPTIONAL VARIABLES (OPSİYONEL)
# ============================================

# Redis Connection URL (varsayılan: redis://localhost:6379)
# Docker kullanıyorsanız: redis://redis:6379 (docker-compose network içinde)
REDIS_URL=redis://localhost:6379

# JWT Refresh Secret (belirtilmezse JWT_SECRET kullanılır)
# JWT_REFRESH_SECRET=your-refresh-secret-key

# CORS Origins (virgülle ayrılmış liste)
CORS_ORIGIN=http://localhost:3000,http://localhost:19006,http://10.0.2.2:3000

# Rate Limiting Configuration (TTL saniye başına istek limiti)
THROTTLE_TTL=60
THROTTLE_LIMIT=100

# Server Port (varsayılan: 3000)
PORT=3000

# Node Environment (development | production)
NODE_ENV=development
```

**Not:** `.env` dosyası `.gitignore` içinde olduğu için Git'e commit edilmeyecektir.

### Uygulamayı Başlatma

```bash
npm run start:dev
```

## 📡 API Endpoints

### Auth
- `POST /auth/register` - Kayıt
- `POST /auth/login` - Giriş
- `GET /auth/me` - Mevcut kullanıcı

### Users
- `GET /users/:userId` - Kullanıcı bilgisi
- `GET /users/search?q=query` - Kullanıcı arama
- `POST /users/:userId/follow` - Takip et
- `DELETE /users/:userId/follow` - Takipten çık
- `POST /users/:userId/block` - Engelle
- `DELETE /users/:userId/block` - Engeli kaldır
- `PUT /users/profile` - Profil güncelle
- `GET /users/blocked/list` - Engellenen kullanıcılar

### Posts
- `POST /posts` - Gönderi oluştur
- `GET /posts/feed` - Ana akış
- `GET /posts/user/:userId` - Kullanıcı gönderileri
- `POST /posts/:postId/like` - Beğen/Beğenme kaldır
- `GET /posts/:postId/comments` - Yorumlar
- `POST /posts/:postId/comments` - Yorum ekle

### Messages
- `GET /messages/conversations` - Konuşmalar
- `GET /messages/:conversationId` - Mesajlar
- `POST /messages` - Mesaj gönder
- `PUT /messages/:conversationId/read` - Okundu işaretle

### Notifications
- `GET /notifications` - Bildirimler
- `PUT /notifications/:id/read` - Okundu işaretle
- `PUT /notifications/read-all` - Tümünü okundu işaretle

## 🔌 WebSocket

Socket.io ile gerçek zamanlı mesajlaşma:
- `sendMessage` event'i ile mesaj gönderilir
- `newMessage` event'i ile yeni mesaj alınır

## 🔐 Authentication

JWT token ile korumalı endpoint'ler:
```
Authorization: Bearer <token>
```

## 🛠️ Teknolojiler

- NestJS
- MongoDB + Mongoose
- Redis (Cache & Session Storage)
- Socket.io
- JWT Authentication
- TypeScript
- class-validator
- Winston (Logging)

## 📊 Redis Kullanımı

Bu proje Redis'i aşağıdaki amaçlarla kullanmaktadır:

### 🔥 Yüksek Öncelik
- **Feed Cache** - Post feed'i 5 dakika cache'lenir
- **Refresh Token Storage** - Refresh token'lar Redis'te 7 gün saklanır
- **Rate Limiting** - API isteklerini sınırlandırma (in-memory şu an)

### ⚡ Orta Öncelik
- **User Profile Cache** - Kullanıcı profilleri 30 dakika cache'lenir
- **Notification Count Cache** - Okunmamış bildirim sayısı 1 dakika cache'lenir
- **Message Unread Count Cache** - Okunmamış mesaj sayısı 1 dakika cache'lenir
- **User Search Cache** - Arama sonuçları 5 dakika cache'lenir

Detaylı bilgi için: [REDIS_KULLANIM_KILAVUZU.md](./REDIS_KULLANIM_KILAVUZU.md)
