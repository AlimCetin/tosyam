import { ClientProxy } from '@nestjs/microservices';
export declare class RabbitMQService {
    private readonly client;
    constructor(client: ClientProxy);
    publish(pattern: string, data: any): Promise<void>;
    send(pattern: string, data: any): Promise<any>;
}
