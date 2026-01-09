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
exports.NotificationsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const notification_entity_1 = require("../entities/notification.entity");
let NotificationsService = class NotificationsService {
    notificationModel;
    constructor(notificationModel) {
        this.notificationModel = notificationModel;
    }
    async getUserNotifications(userId, page = 1, limit = 20) {
        const skip = (page - 1) * limit;
        const maxLimit = Math.min(limit, 50);
        const notifications = await this.notificationModel.find({
            userId,
            deletedAt: null,
        })
            .populate('fromUserId', 'fullName avatar')
            .select('fromUserId postId type read createdAt')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(maxLimit)
            .lean();
        return {
            notifications: notifications.map((notification) => {
                const fromUserIdObj = notification.fromUserId;
                let fromUserData;
                if (typeof fromUserIdObj === 'object' && fromUserIdObj?._id) {
                    fromUserData = {
                        _id: fromUserIdObj._id,
                        fullName: fromUserIdObj.fullName || '',
                        avatar: fromUserIdObj.avatar || null,
                    };
                }
                else {
                    fromUserData = {
                        _id: fromUserIdObj || notification.fromUserId,
                        fullName: '',
                        avatar: null,
                    };
                }
                return {
                    id: notification._id.toString(),
                    type: notification.type,
                    fromUser: {
                        id: fromUserData._id.toString(),
                        username: fromUserData.fullName || '',
                        fullName: fromUserData.fullName || '',
                        avatar: fromUserData.avatar || null,
                    },
                    postId: notification.postId ? notification.postId.toString() : null,
                    read: notification.read || false,
                    createdAt: notification.createdAt,
                };
            }),
            pagination: {
                page,
                limit: maxLimit,
                hasMore: notifications.length === maxLimit,
            },
        };
    }
    async markAsRead(notificationId, userId) {
        await this.notificationModel.updateOne({ _id: notificationId, userId, deletedAt: null }, { read: true });
    }
    async markAllAsRead(userId) {
        await this.notificationModel.updateMany({ userId, read: false, deletedAt: null }, { read: true });
    }
    async getUnreadCount(userId) {
        return await this.notificationModel.countDocuments({
            userId,
            read: false,
            deletedAt: null,
        });
    }
};
exports.NotificationsService = NotificationsService;
exports.NotificationsService = NotificationsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(notification_entity_1.Notification.name)),
    __metadata("design:paramtypes", [mongoose_2.Model])
], NotificationsService);
//# sourceMappingURL=notifications.service.js.map