import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { NotificationsGateway } from './gateway/notifications.gateway';
import { MessagesGateway } from '../messages/messages.gateway';

@Controller()
export class RabbitMQConsumerController {
    constructor(
        private readonly notificationsGateway: NotificationsGateway,
        private readonly messagesGateway: MessagesGateway,
    ) { }

    @EventPattern('notification.like')
    async handleLikeNotification(@Payload() data: any, @Ctx() context: RmqContext) {
        console.log(`Received like notification from RabbitMQ for user ${data.receiverId}`);

        // Emit via WebSocket to the receiver
        this.notificationsGateway.emitToUser(data.receiverId, 'newNotification', {
            type: 'like',
            data: data.notificationData,
        });
    }

    @EventPattern('notification.comment')
    async handleCommentNotification(@Payload() data: any, @Ctx() context: RmqContext) {
        console.log(`Received comment notification from RabbitMQ for user ${data.receiverId}`);

        // Emit via WebSocket to the receiver
        this.notificationsGateway.emitToUser(data.receiverId, 'newNotification', {
            type: 'comment',
            data: data.notificationData,
        });
    }

    @EventPattern('notification.message')
    async handleMessageNotification(@Payload() data: any, @Ctx() context: RmqContext) {
        console.log(`Received message notification from RabbitMQ for user ${data.receiverId}`);

        // Emit new message event so Chat screens can update
        this.messagesGateway.server.to(`user_${data.receiverId}`).emit('newMessage', data.messageData);

        // Also emit a general notification event if needed for global toast alerts outside chat
        this.notificationsGateway.emitToUser(data.receiverId, 'newNotification', {
            type: 'message',
            data: data.messageData,
        });
    }
}
