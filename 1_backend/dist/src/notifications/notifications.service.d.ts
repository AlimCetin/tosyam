import { Model } from 'mongoose';
import { Notification } from '../entities/notification.entity';
export declare class NotificationsService {
    private notificationModel;
    constructor(notificationModel: Model<Notification>);
    getUserNotifications(userId: string, page?: number, limit?: number): Promise<{
        notifications: {
            id: any;
            type: any;
            fromUser: {
                id: any;
                username: any;
                fullName: any;
                avatar: any;
            };
            postId: any;
            read: any;
            createdAt: any;
        }[];
        pagination: {
            page: number;
            limit: number;
            hasMore: boolean;
        };
    }>;
    markAsRead(notificationId: string, userId: string): Promise<void>;
    markAllAsRead(userId: string): Promise<void>;
    getUnreadCount(userId: string): Promise<number>;
}
