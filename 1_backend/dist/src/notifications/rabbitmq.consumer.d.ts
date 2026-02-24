import { RmqContext } from '@nestjs/microservices';
import { NotificationsGateway } from './gateway/notifications.gateway';
import { MessagesGateway } from '../messages/messages.gateway';
export declare class RabbitMQConsumerController {
    private readonly notificationsGateway;
    private readonly messagesGateway;
    constructor(notificationsGateway: NotificationsGateway, messagesGateway: MessagesGateway);
    handleLikeNotification(data: any, context: RmqContext): Promise<void>;
    handleCommentNotification(data: any, context: RmqContext): Promise<void>;
    handleMessageNotification(data: any, context: RmqContext): Promise<void>;
}
