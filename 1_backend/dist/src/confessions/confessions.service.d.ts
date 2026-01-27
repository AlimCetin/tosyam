import { Model, Types } from 'mongoose';
import { Confession } from '../entities/confession.entity';
import { ConfessionComment } from '../entities/confession-comment.entity';
import { User } from '../entities/user.entity';
import { Notification } from '../entities/notification.entity';
import { Report } from '../entities/report.entity';
import { RedisService } from '../common/redis/redis.service';
export declare class ConfessionsService {
    private confessionModel;
    private commentModel;
    private userModel;
    private notificationModel;
    private reportModel;
    private readonly redisService;
    constructor(confessionModel: Model<Confession>, commentModel: Model<ConfessionComment>, userModel: Model<User>, notificationModel: Model<Notification>, reportModel: Model<Report>, redisService: RedisService);
    create(userId: string, text: string): Promise<import("mongoose").Document<unknown, {}, Confession, {}, import("mongoose").DefaultSchemaOptions> & Confession & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(page?: number, limit?: number, currentUserId?: string): Promise<{
        id: any;
        text: any;
        likeCount: any;
        commentCount: any;
        isLiked: any;
        createdAt: any;
    }[]>;
    findMe(userId: string, page?: number, limit?: number): Promise<{
        id: any;
        text: any;
        likeCount: any;
        commentCount: any;
        isLiked: any;
        createdAt: any;
    }[]>;
    like(confessionId: string, userId: string): Promise<{
        message: string;
    }>;
    getComments(confessionId: string, page?: number, limit?: number): Promise<{
        id: any;
        text: any;
        userInitials: any;
        createdAt: any;
    }[]>;
    addComment(confessionId: string, userId: string, text: string): Promise<{
        id: string;
        text: string;
        userInitials: string;
        createdAt: any;
    }>;
    report(confessionId: string, reporterId: string, reason: string): Promise<{
        message: string;
    }>;
}
