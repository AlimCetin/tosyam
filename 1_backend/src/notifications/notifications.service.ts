import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification } from '../entities/notification.entity';

@Injectable()
export class NotificationsService {
  constructor(@InjectModel(Notification.name) private notificationModel: Model<Notification>) {}

  async getUserNotifications(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;
    const maxLimit = Math.min(limit, 50);
    
    const notifications = await this.notificationModel.find({ 
      userId,
      deletedAt: null, // Soft delete kontrolü
    })
      .populate('fromUserId', 'fullName avatar')
      // postId'yi populate etme, direkt string olarak kullan
      .select('fromUserId postId type read createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(maxLimit)
      .lean();
    
    return {
      notifications: notifications.map((notification: any) => {
        const fromUserIdObj = notification.fromUserId;
        let fromUserData;
        
        if (typeof fromUserIdObj === 'object' && fromUserIdObj?._id) {
          fromUserData = {
            _id: fromUserIdObj._id,
            fullName: fromUserIdObj.fullName || '',
            avatar: fromUserIdObj.avatar || null,
          };
        } else {
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

  async markAsRead(notificationId: string, userId: string) {
    await this.notificationModel.updateOne(
      { _id: notificationId, userId, deletedAt: null }, 
      { read: true }
    );
  }

  async markAllAsRead(userId: string) {
    await this.notificationModel.updateMany(
      { userId, read: false, deletedAt: null }, 
      { read: true }
    );
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationModel.countDocuments({ 
      userId, 
      read: false,
      deletedAt: null, // Soft delete kontrolü
    });
  }
}

