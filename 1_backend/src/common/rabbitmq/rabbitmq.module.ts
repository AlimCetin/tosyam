import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ClientProxyFactory, Transport } from '@nestjs/microservices';
import { RabbitMQService } from './rabbitmq.service';

@Module({
    imports: [ConfigModule],
    providers: [
        {
            provide: 'RABBITMQ_SERVICE',
            useFactory: (configService: ConfigService) => {
                const url = configService.get<string>('RABBITMQ_URL') || 'amqp://guest:guest@localhost:5672';
                return ClientProxyFactory.create({
                    transport: Transport.RMQ,
                    options: {
                        urls: [url],
                        queue: 'notifications_queue',
                        queueOptions: {
                            durable: true,
                        },
                    },
                });
            },
            inject: [ConfigService],
        },
        RabbitMQService,
    ],
    exports: ['RABBITMQ_SERVICE', RabbitMQService],
})
export class RabbitMQModule { }
