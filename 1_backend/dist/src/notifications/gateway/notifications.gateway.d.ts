import { OnGatewayConnection, OnGatewayDisconnect } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { NotificationsService } from '../notifications.service';
import { MessagesService } from '../../messages/messages.service';
import { AppLoggerService } from '../../common/logger/logger.service';
export declare class NotificationsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    private jwtService;
    private configService;
    private notificationsService;
    private messagesService;
    private logger;
    server: Server;
    constructor(jwtService: JwtService, configService: ConfigService, notificationsService: NotificationsService, messagesService: MessagesService, logger: AppLoggerService);
    handleConnection(client: Socket): Promise<void>;
    handleDisconnect(client: Socket): void;
    emitToUser(userId: string, event: string, data: any): void;
    handleRequestUnreadCounts(client: Socket): Promise<void>;
}
