import { Injectable, Inject } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class RabbitMQService {
    constructor(
        @Inject('RABBITMQ_SERVICE') private readonly client: ClientProxy,
    ) { }

    async publish(pattern: string, data: any): Promise<void> {
        try {
            // Use emit for fire-and-forget events
            this.client.emit(pattern, data);
        } catch (error) {
            console.error(`Error publishing message to RabbitMQ [${pattern}]:`, error);
        }
    }

    // Use send if you need a response (RPC style)
    async send(pattern: string, data: any): Promise<any> {
        try {
            return await firstValueFrom(this.client.send(pattern, data));
        } catch (error) {
            console.error(`Error sending message to RabbitMQ [${pattern}]:`, error);
            throw error;
        }
    }
}
