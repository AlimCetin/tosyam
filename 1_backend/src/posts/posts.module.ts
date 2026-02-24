import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { Post, PostSchema } from '../entities/post.entity';
import { Comment, CommentSchema } from '../entities/comment.entity';
import { Notification, NotificationSchema } from '../entities/notification.entity';
import { User, UserSchema } from '../entities/user.entity';
import { Ad, AdSchema } from '../entities/ad.entity';
import { Campaign, CampaignSchema } from '../entities/campaign.entity';
import { Place, PlaceSchema } from '../entities/place.entity';
import { NotBlockedGuard } from '../common/guards/not-blocked.guard';
import { RabbitMQModule } from '../common/rabbitmq/rabbitmq.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Post.name, schema: PostSchema },
      { name: Comment.name, schema: CommentSchema },
      { name: Notification.name, schema: NotificationSchema },
      { name: User.name, schema: UserSchema },
      { name: Ad.name, schema: AdSchema },
      { name: Campaign.name, schema: CampaignSchema },
      { name: Place.name, schema: PlaceSchema },
    ]),
    RabbitMQModule,
  ],
  controllers: [PostsController],
  providers: [PostsService, NotBlockedGuard],
  exports: [PostsService],
})
export class PostsModule { }
