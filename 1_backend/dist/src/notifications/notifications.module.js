"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const notifications_controller_1 = require("./notifications.controller");
const notifications_service_1 = require("./notifications.service");
const notification_entity_1 = require("../entities/notification.entity");
const notifications_gateway_1 = require("./gateway/notifications.gateway");
const rabbitmq_consumer_1 = require("./rabbitmq.consumer");
const messages_module_1 = require("../messages/messages.module");
const jwt_1 = require("@nestjs/jwt");
const config_1 = require("@nestjs/config");
const logger_service_1 = require("../common/logger/logger.service");
let NotificationsModule = class NotificationsModule {
};
exports.NotificationsModule = NotificationsModule;
exports.NotificationsModule = NotificationsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([{ name: notification_entity_1.Notification.name, schema: notification_entity_1.NotificationSchema }]),
            jwt_1.JwtModule.registerAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: async (configService) => ({
                    secret: configService.get('JWT_SECRET'),
                    signOptions: { expiresIn: '7d' },
                }),
            }),
            messages_module_1.MessagesModule,
        ],
        controllers: [notifications_controller_1.NotificationsController, rabbitmq_consumer_1.RabbitMQConsumerController],
        providers: [notifications_service_1.NotificationsService, notifications_gateway_1.NotificationsGateway, logger_service_1.AppLoggerService],
        exports: [notifications_gateway_1.NotificationsGateway],
    })
], NotificationsModule);
//# sourceMappingURL=notifications.module.js.map