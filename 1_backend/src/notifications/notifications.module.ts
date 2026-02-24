import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { NotificationsService } from './notifications.service';
import { Notification, NotificationSchema } from '../entities/notification.entity';
import { NotificationsGateway } from './gateway/notifications.gateway';
import { RabbitMQConsumerController } from './rabbitmq.consumer';
import { MessagesModule } from '../messages/messages.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppLoggerService } from '../common/logger/logger.service';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Notification.name, schema: NotificationSchema }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
    }),
    MessagesModule,
  ],
  controllers: [NotificationsController, RabbitMQConsumerController],
  providers: [NotificationsService, NotificationsGateway, AppLoggerService],
  exports: [NotificationsGateway],
})
export class NotificationsModule { }

