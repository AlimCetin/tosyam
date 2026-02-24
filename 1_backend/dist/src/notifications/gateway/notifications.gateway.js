"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsGateway = void 0;
const websockets_1 = require("@nestjs/websockets");
const socket_io_1 = require("socket.io");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const websockets_2 = require("@nestjs/websockets");
const notifications_service_1 = require("../notifications.service");
const messages_service_1 = require("../../messages/messages.service");
const logger_service_1 = require("../../common/logger/logger.service");
let NotificationsGateway = class NotificationsGateway {
    jwtService;
    configService;
    notificationsService;
    messagesService;
    logger;
    server;
    constructor(jwtService, configService, notificationsService, messagesService, logger) {
        this.jwtService = jwtService;
        this.configService = configService;
        this.notificationsService = notificationsService;
        this.messagesService = messagesService;
        this.logger = logger;
    }
    async handleConnection(client) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }
            const secret = this.configService.get('JWT_SECRET');
            if (!secret) {
                client.disconnect();
                return;
            }
            const payload = this.jwtService.verify(token, { secret });
            if (!payload || !payload.id) {
                client.disconnect();
                return;
            }
            const userId = payload.id;
            client.data.userId = userId;
            client.join(`user_${userId}`);
            this.logger.log(`Client connected to NotificationsGateway: ${client.id}, userId: ${userId}`, 'NotificationsGateway');
        }
        catch (error) {
            this.logger.error(`WebSocket connection error: ${error.message}`, error.stack, 'NotificationsGateway');
            client.disconnect();
        }
    }
    handleDisconnect(client) {
        this.logger.log(`Client disconnected from NotificationsGateway: ${client.id}`, 'NotificationsGateway');
    }
    emitToUser(userId, event, data) {
        this.server.to(`user_${userId}`).emit(event, data);
    }
    async handleRequestUnreadCounts(client) {
        try {
            const userId = client.data.userId;
            if (!userId) {
                this.logger.warn('WebSocket requestUnreadCounts: userId bulunamadı', 'NotificationsGateway');
                return;
            }
            const [notificationCount, messageCount] = await Promise.all([
                this.notificationsService.getUnreadCount(userId),
                this.messagesService.getUnreadMessagesCount(userId),
            ]);
            this.logger.log(`📤 WebSocket üzerinden verilere cevap veriliyor [User: ${userId}]: ${JSON.stringify({ notificationCount, messageCount })}`, 'NotificationsGateway');
            client.emit('unreadCounts', {
                notificationCount,
                messageCount,
            });
        }
        catch (error) {
            this.logger.error(`Error fetching unread counts via WebSocket: ${error.message}`, error.stack, 'NotificationsGateway');
        }
    }
};
exports.NotificationsGateway = NotificationsGateway;
__decorate([
    (0, websockets_1.WebSocketServer)(),
    __metadata("design:type", socket_io_1.Server)
], NotificationsGateway.prototype, "server", void 0);
__decorate([
    (0, websockets_2.SubscribeMessage)('requestUnreadCounts'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [socket_io_1.Socket]),
    __metadata("design:returntype", Promise)
], NotificationsGateway.prototype, "handleRequestUnreadCounts", null);
exports.NotificationsGateway = NotificationsGateway = __decorate([
    (0, websockets_1.WebSocketGateway)({
        cors: {
            origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:19006', 'http://10.0.2.2:3000'],
            credentials: true,
        },
    }),
    __metadata("design:paramtypes", [jwt_1.JwtService,
        config_1.ConfigService,
        notifications_service_1.NotificationsService,
        messages_service_1.MessagesService,
        logger_service_1.AppLoggerService])
], NotificationsGateway);
//# sourceMappingURL=notifications.gateway.js.map