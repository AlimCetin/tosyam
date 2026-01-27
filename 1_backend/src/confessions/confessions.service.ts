import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Confession } from '../entities/confession.entity';
import { ConfessionComment } from '../entities/confession-comment.entity';
import { User } from '../entities/user.entity';
import { Notification } from '../entities/notification.entity';
import { Report } from '../entities/report.entity';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class ConfessionsService {
    constructor(
        @InjectModel(Confession.name) private confessionModel: Model<Confession>,
        @InjectModel(ConfessionComment.name) private commentModel: Model<ConfessionComment>,
        @InjectModel(User.name) private userModel: Model<User>,
        @InjectModel(Notification.name) private notificationModel: Model<Notification>,
        @InjectModel(Report.name) private reportModel: Model<Report>,
        private readonly redisService: RedisService,
    ) { }

    async create(userId: string, text: string) {
        if (!text || text.trim().length === 0) {
            throw new BadRequestException('Text is required');
        }

        const confession = await this.confessionModel.create({
            userId,
            text: text.trim(),
        });

        return confession;
    }

    async findAll(page: number = 1, limit: number = 20, currentUserId?: string) {
        const skip = (page - 1) * limit;
        const maxLimit = Math.min(limit, 50);

        const confessions = await this.confessionModel
            .find({ deletedAt: null })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(maxLimit)
            .lean();

        return confessions.map((c: any) => ({
            id: c._id.toString(),
            text: c.text,
            likeCount: c.likes?.length || 0,
            commentCount: c.commentCount || 0,
            isLiked: currentUserId ? (c.likes || []).includes(currentUserId) : false,
            createdAt: c.createdAt,
        }));
    }

    async findMe(userId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const maxLimit = Math.min(limit, 50);

        const confessions = await this.confessionModel
            .find({ userId, deletedAt: null })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(maxLimit)
            .lean();

        return confessions.map((c: any) => ({
            id: c._id.toString(),
            text: c.text,
            likeCount: c.likes?.length || 0,
            commentCount: c.commentCount || 0,
            isLiked: (c.likes || []).includes(userId),
            createdAt: c.createdAt,
        }));
    }

    async like(confessionId: string, userId: string) {
        const confession = await this.confessionModel.findOne({ _id: confessionId, deletedAt: null });
        if (!confession) throw new NotFoundException('Confession not found');

        const isLiked = confession.likes.includes(userId);
        if (!isLiked) {
            await this.confessionModel.updateOne(
                { _id: confessionId },
                { $addToSet: { likes: userId } }
            );

            // Notification
            if (confession.userId !== userId) {
                await this.notificationModel.create({
                    userId: confession.userId,
                    fromUserId: userId,
                    type: 'like',
                    postId: confessionId, // Using postId field for simplicity if it fits the schema
                    // We might need a 'confessionId' field in Notification entity, but for now let's use postId if it exists
                });

                // Invalidate notification cache
                await this.redisService.del(`notification:unread:${confession.userId}`);
            }
            return { message: 'Liked' };
        } else {
            await this.confessionModel.updateOne(
                { _id: confessionId },
                { $pull: { likes: userId } }
            );
            return { message: 'Unliked' };
        }
    }

    async getComments(confessionId: string, page: number = 1, limit: number = 20) {
        const skip = (page - 1) * limit;
        const maxLimit = Math.min(limit, 50);

        const comments = await this.commentModel
            .find({ confessionId, deletedAt: null })
            .populate('userId', 'fullName')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(maxLimit)
            .lean();

        return comments.map((c: any) => {
            const fullName = c.userId?.fullName || 'Anonim Kullanıcı';
            const parts = fullName.split(' ');
            const initials = parts.map((p: string) => p.charAt(0).toUpperCase() + '.').join(' ');

            return {
                id: c._id.toString(),
                text: c.text,
                userInitials: initials,
                createdAt: c.createdAt,
            };
        });
    }

    async addComment(confessionId: string, userId: string, text: string) {
        if (!text || text.trim().length === 0) {
            throw new BadRequestException('Comment text is required');
        }

        const confession = await this.confessionModel.findOne({ _id: confessionId, deletedAt: null });
        if (!confession) throw new NotFoundException('Confession not found');

        const comment = await this.commentModel.create({
            confessionId,
            userId,
            text: text.trim(),
        });

        await this.confessionModel.updateOne(
            { _id: confessionId },
            { $inc: { commentCount: 1 } }
        );

        // Notification
        if (confession.userId !== userId) {
            await this.notificationModel.create({
                userId: confession.userId,
                fromUserId: userId,
                type: 'comment',
                postId: confessionId,
            });
            await this.redisService.del(`notification:unread:${confession.userId}`);
        }

        const user = await this.userModel.findById(userId).select('fullName').lean();
        const fullName = user?.fullName || 'Anonim Kullanıcı';
        const parts = fullName.split(' ');
        const initials = parts.map((p: string) => p.charAt(0).toUpperCase() + '.').join(' ');

        return {
            id: comment._id.toString(),
            text: comment.text,
            userInitials: initials,
            createdAt: (comment as any).createdAt,
        };
    }

    async report(confessionId: string, reporterId: string, reason: string) {
        const confession = await this.confessionModel.findOne({ _id: confessionId, deletedAt: null });
        if (!confession) throw new NotFoundException('Confession not found');

        await this.reportModel.create({
            reporterId,
            reportedId: confessionId,
            type: 'post', // Confession acts like a post for reports
            reason: reason || 'other',
            description: 'Reported from Confessions section',
            status: 'pending',
            priority: 'medium',
        });

        return { message: 'Reported successfully' };
    }

    async findOne(id: string, currentUserId?: string) {
        const confession = await this.confessionModel.findOne({ _id: id, deletedAt: null }).lean();
        if (!confession) throw new NotFoundException('Confession not found');

        return {
            id: confession._id.toString(),
            text: confession.text,
            userId: confession.userId,
            likeCount: confession.likes?.length || 0,
            commentCount: confession.commentCount || 0,
            isLiked: currentUserId ? (confession.likes || []).includes(currentUserId) : false,
            createdAt: (confession as any).createdAt,
        };
    }

    async delete(id: string, userId: string) {
        const confession = await this.confessionModel.findOne({ _id: id, deletedAt: null });
        if (!confession) throw new NotFoundException('Confession not found');

        if (confession.userId !== userId) {
            throw new ForbiddenException('You can only delete your own confessions');
        }

        confession.deletedAt = new Date();
        await confession.save();

        return { success: true };
    }
}
