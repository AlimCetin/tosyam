import { MongooseModule } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';

export const DatabaseModule = MongooseModule.forRootAsync({
  inject: [ConfigService],
  useFactory: (configService: ConfigService) => {
    const uri = configService.get<string>('MONGODB_URI');
    if (!uri) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    return {
      uri,
    };
  },
});
