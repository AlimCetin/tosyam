# Tosyam Backend API (NestJS)

Sosyal medya uygulaması için NestJS backend API.

## 🚀 Kurulum

### Docker ile MongoDB

```bash
# MongoDB ve MongoDB Web UI'yi başlat
docker-compose up -d

# MongoDB durumunu kontrol et
docker-compose ps

# MongoDB'yi durdur
docker-compose down

# MongoDB'yi ve verileri tamamen silmek için
docker-compose down -v
```

**MongoDB Web Arayüzü:**
- URL: http://localhost:8081
- Kullanıcı adı: `admin`
- Şifre: `admin`

Tarayıcınızda http://localhost:8081 adresine giderek MongoDB veritabanınızı web arayüzünden yönetebilirsiniz.

### Proje Kurulumu

```bash
npm install
cp .env.example .env
# .env dosyasını düzenleyin
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
- Socket.io
- JWT Authentication
- TypeScript
- class-validator
