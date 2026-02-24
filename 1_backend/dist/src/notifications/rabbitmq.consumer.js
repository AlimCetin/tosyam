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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RabbitMQConsumerController = void 0;
const common_1 = require("@nestjs/common");
const microservices_1 = require("@nestjs/microservices");
const notifications_gateway_1 = require("./gateway/notifications.gateway");
const messages_gateway_1 = require("../messages/messages.gateway");
let RabbitMQConsumerController = class RabbitMQConsumerController {
    notificationsGateway;
    messagesGateway;
    constructor(notificationsGateway, messagesGateway) {
        this.notificationsGateway = notificationsGateway;
        this.messagesGateway = messagesGateway;
    }
    async handleLikeNotification(data, context) {
        console.log(`Received like notification from RabbitMQ for user ${data.receiverId}`);
        this.notificationsGateway.emitToUser(data.receiverId, 'newNotification', {
            type: 'like',
            data: data.notificationData,
        });
    }
    async handleCommentNotification(data, context) {
        console.log(`Received comment notification from RabbitMQ for user ${data.receiverId}`);
        this.notificationsGateway.emitToUser(data.receiverId, 'newNotification', {
            type: 'comment',
            data: data.notificationData,
        });
    }
    async handleMessageNotification(data, context) {
        console.log(`Received message notification from RabbitMQ for user ${data.receiverId}`);
        this.messagesGateway.server.to(`user_${data.receiverId}`).emit('newMessage', data.messageData);
        this.notificationsGateway.emitToUser(data.receiverId, 'newNotification', {
            type: 'message',
            data: data.messageData,
        });
    }
};
exports.RabbitMQConsumerController = RabbitMQConsumerController;
__decorate([
    (0, microservices_1.EventPattern)('notification.like'),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], RabbitMQConsumerController.prototype, "handleLikeNotification", null);
__decorate([
    (0, microservices_1.EventPattern)('notification.comment'),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], RabbitMQConsumerController.prototype, "handleCommentNotification", null);
__decorate([
    (0, microservices_1.EventPattern)('notification.message'),
    __param(0, (0, microservices_1.Payload)()),
    __param(1, (0, microservices_1.Ctx)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, microservices_1.RmqContext]),
    __metadata("design:returntype", Promise)
], RabbitMQConsumerController.prototype, "handleMessageNotification", null);
exports.RabbitMQConsumerController = RabbitMQConsumerController = __decorate([
    (0, common_1.Controller)(),
    __metadata("design:paramtypes", [notifications_gateway_1.NotificationsGateway,
        messages_gateway_1.MessagesGateway])
], RabbitMQConsumerController);
//# sourceMappingURL=rabbitmq.consumer.js.map