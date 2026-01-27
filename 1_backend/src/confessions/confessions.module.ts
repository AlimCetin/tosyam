import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfessionsController } from './confessions.controller';
import { ConfessionsService } from './confessions.service';
import { Confession, ConfessionSchema } from '../entities/confession.entity';
import { ConfessionComment, ConfessionCommentSchema } from '../entities/confession-comment.entity';
import { User, UserSchema } from '../entities/user.entity';
import { Notification, NotificationSchema } from '../entities/notification.entity';
import { Report, ReportSchema } from '../entities/report.entity';


@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Confession.name, schema: ConfessionSchema },
            { name: ConfessionComment.name, schema: ConfessionCommentSchema },
            { name: User.name, schema: UserSchema },
            { name: Notification.name, schema: NotificationSchema },
            { name: Report.name, schema: ReportSchema },
        ]),

    ],
    controllers: [ConfessionsController],
    providers: [ConfessionsService],
})
export class ConfessionsModule { }
