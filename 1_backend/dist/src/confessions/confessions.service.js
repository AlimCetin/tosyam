"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfessionsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const confession_entity_1 = require("../entities/confession.entity");
const confession_comment_entity_1 = require("../entities/confession-comment.entity");
const user_entity_1 = require("../entities/user.entity");
const notification_entity_1 = require("../entities/notification.entity");
const report_entity_1 = require("../entities/report.entity");
const redis_service_1 = require("../common/redis/redis.service");
let ConfessionsService = class ConfessionsService {
    confessionModel;
    commentModel;
    userModel;
    notificationModel;
    reportModel;
    redisService;
    constructor(confessionModel, commentModel, userModel, notificationModel, reportModel, redisService) {
        this.confessionModel = confessionModel;
        this.commentModel = commentModel;
        this.userModel = userModel;
        this.notificationModel = notificationModel;
        this.reportModel = reportModel;
        this.redisService = redisService;
    }
    async create(userId, text) {
        if (!text || text.trim().length === 0) {
            throw new common_1.BadRequestException('Text is required');
        }
        const confession = await this.confessionModel.create({
            userId,
            text: text.trim(),
        });
        return confession;
    }
    async findAll(page = 1, limit = 20, currentUserId) {
        const skip = (page - 1) * limit;
        const maxLimit = Math.min(limit, 50);
        const confessions = await this.confessionModel
            .find({ deletedAt: null })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(maxLimit)
            .lean();
        return confessions.map((c) => ({
            id: c._id.toString(),
            text: c.text,
            likeCount: c.likes?.length || 0,
            commentCount: c.commentCount || 0,
            isLiked: currentUserId ? (c.likes || []).includes(currentUserId) : false,
            createdAt: c.createdAt,
        }));
    }
    async findMe(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const maxLimit = Math.min(limit, 50);
        const confessions = await this.confessionModel
            .find({ userId, deletedAt: null })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(maxLimit)
            .lean();
        return confessions.map((c) => ({
            id: c._id.toString(),
            text: c.text,
            likeCount: c.likes?.length || 0,
            commentCount: c.commentCount || 0,
            isLiked: (c.likes || []).includes(userId),
            createdAt: c.createdAt,
        }));
    }
    async like(confessionId, userId) {
        const confession = await this.confessionModel.findOne({ _id: confessionId, deletedAt: null });
        if (!confession)
            throw new common_1.NotFoundException('Confession not found');
        const isLiked = confession.likes.includes(userId);
        if (!isLiked) {
            await this.confessionModel.updateOne({ _id: confessionId }, { $addToSet: { likes: userId } });
            if (confession.userId !== userId) {
                await this.notificationModel.create({
                    userId: confession.userId,
                    fromUserId: userId,
                    type: 'like',
                    postId: confessionId,
                });
                await this.redisService.del(`notification:unread:${confession.userId}`);
            }
            return { message: 'Liked' };
        }
        else {
            await this.confessionModel.updateOne({ _id: confessionId }, { $pull: { likes: userId } });
            return { message: 'Unliked' };
        }
    }
    async getComments(confessionId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const maxLimit = Math.min(limit, 50);
        const comments = await this.commentModel
            .find({ confessionId, deletedAt: null })
            .populate('userId', 'fullName')
            .sort({ createdAt: 1 })
            .skip(skip)
            .limit(maxLimit)
            .lean();
        return comments.map((c) => {
            const fullName = c.userId?.fullName || 'Anonim Kullanıcı';
            const parts = fullName.split(' ');
            const initials = parts.map((p) => p.charAt(0).toUpperCase() + '.').join(' ');
            return {
                id: c._id.toString(),
                text: c.text,
                userInitials: initials,
                createdAt: c.createdAt,
            };
        });
    }
    async addComment(confessionId, userId, text) {
        if (!text || text.trim().length === 0) {
            throw new common_1.BadRequestException('Comment text is required');
        }
        const confession = await this.confessionModel.findOne({ _id: confessionId, deletedAt: null });
        if (!confession)
            throw new common_1.NotFoundException('Confession not found');
        const comment = await this.commentModel.create({
            confessionId,
            userId,
            text: text.trim(),
        });
        await this.confessionModel.updateOne({ _id: confessionId }, { $inc: { commentCount: 1 } });
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
        const initials = parts.map((p) => p.charAt(0).toUpperCase() + '.').join(' ');
        return {
            id: comment._id.toString(),
            text: comment.text,
            userInitials: initials,
            createdAt: comment.createdAt,
        };
    }
    async report(confessionId, reporterId, reason) {
        const confession = await this.confessionModel.findOne({ _id: confessionId, deletedAt: null });
        if (!confession)
            throw new common_1.NotFoundException('Confession not found');
        await this.reportModel.create({
            reporterId,
            reportedId: confessionId,
            type: 'post',
            reason: reason || 'other',
            description: 'Reported from Confessions section',
            status: 'pending',
            priority: 'medium',
        });
        return { message: 'Reported successfully' };
    }
    async findOne(id, currentUserId) {
        const confession = await this.confessionModel.findOne({ _id: id, deletedAt: null }).lean();
        if (!confession)
            throw new common_1.NotFoundException('Confession not found');
        return {
            id: confession._id.toString(),
            text: confession.text,
            userId: confession.userId,
            likeCount: confession.likes?.length || 0,
            commentCount: confession.commentCount || 0,
            isLiked: currentUserId ? (confession.likes || []).includes(currentUserId) : false,
            createdAt: confession.createdAt,
        };
    }
    async delete(id, userId) {
        const confession = await this.confessionModel.findOne({ _id: id, deletedAt: null });
        if (!confession)
            throw new common_1.NotFoundException('Confession not found');
        if (confession.userId !== userId) {
            throw new common_1.ForbiddenException('You can only delete your own confessions');
        }
        confession.deletedAt = new Date();
        await confession.save();
        return { success: true };
    }
};
exports.ConfessionsService = ConfessionsService;
exports.ConfessionsService = ConfessionsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(confession_entity_1.Confession.name)),
    __param(1, (0, mongoose_1.InjectModel)(confession_comment_entity_1.ConfessionComment.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __param(3, (0, mongoose_1.InjectModel)(notification_entity_1.Notification.name)),
    __param(4, (0, mongoose_1.InjectModel)(report_entity_1.Report.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        redis_service_1.RedisService])
], ConfessionsService);
//# sourceMappingURL=confessions.service.js.map