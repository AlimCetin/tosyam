import { WebSocketGateway, WebSocketServer, OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { SubscribeMessage } from '@nestjs/websockets';
import { NotificationsService } from '../notifications.service';
import { MessagesService } from '../../messages/messages.service';

import { AppLoggerService } from '../../common/logger/logger.service';

@WebSocketGateway({
    cors: {
        origin: process.env.CORS_ORIGIN?.split(',') || ['http://localhost:3000', 'http://localhost:19006', 'http://10.0.2.2:3000'],
        credentials: true,
    },
})
export class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;

    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
        private notificationsService: NotificationsService,
        private messagesService: MessagesService,
        private logger: AppLoggerService,
    ) { }

    async handleConnection(client: Socket) {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(' ')[1];
            if (!token) {
                client.disconnect();
                return;
            }

            const secret = this.configService.get<string>('JWT_SECRET');
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

            // Join a room specific to this user to easily emit events to them
            client.join(`user_${userId}`);
            this.logger.log(`Client connected to NotificationsGateway: ${client.id}, userId: ${userId}`, 'NotificationsGateway');
        } catch (error) {
            this.logger.error(`WebSocket connection error: ${error.message}`, error.stack, 'NotificationsGateway');
            client.disconnect();
        }
    }

    handleDisconnect(client: Socket) {
        this.logger.log(`Client disconnected from NotificationsGateway: ${client.id}`, 'NotificationsGateway');
    }

    // Method called by the RabbitMQ consumer to emit events
    emitToUser(userId: string, event: string, data: any) {
        this.server.to(`user_${userId}`).emit(event, data);
    }

    @SubscribeMessage('requestUnreadCounts')
    async handleRequestUnreadCounts(client: Socket) {
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
        } catch (error) {
            this.logger.error(`Error fetching unread counts via WebSocket: ${error.message}`, error.stack, 'NotificationsGateway');
        }
    }
}
