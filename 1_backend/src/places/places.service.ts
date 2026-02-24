import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Place } from '../entities/place.entity';
import { PlaceComment } from '../entities/place-comment.entity';
import { User } from '../entities/user.entity';
import { RedisService } from '../common/redis/redis.service';

@Injectable()
export class PlacesService {
    constructor(
        @InjectModel(Place.name) private placeModel: Model<Place>,
        @InjectModel(PlaceComment.name) private placeCommentModel: Model<PlaceComment>,
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly redisService: RedisService,
    ) { }

    async findAll(city?: string, category?: string) {
        const query: any = { isActive: true };
        if (city) query.city = city;
        if (category) query.category = category;

        return this.placeModel.find(query)
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    async findOne(id: string) {
        const place = await this.placeModel.findById(id).exec();
        if (!place) {
            throw new NotFoundException('Yer bulunamadı');
        }
        return place;
    }

    async create(createPlaceDto: any, userId: string) {
        const newPlace = new this.placeModel({
            ...createPlaceDto,
            createdBy: userId,
        });
        return newPlace.save();
    }

    async findMyPlaces(userId: string) {
        return this.placeModel.find({ createdBy: userId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    async update(id: string, userId: string, userRole: string, updateData: any) {
        const place = await this.findOne(id);

        // Permission check: owner, admin, or moderator
        const isOwner = (place as any).createdBy === userId;
        const isAdmin = userRole === 'admin' || userRole === 'moderator';

        if (!isOwner && !isAdmin) {
            throw new Error('Bu işlemi yapmaya yetkiniz yok');
        }

        Object.assign(place, updateData);
        return (place as any).save();
    }

    async remove(id: string, userId: string, userRole: string) {
        const place = await this.findOne(id);

        // Permission check
        const isOwner = (place as any).createdBy === userId;
        const isAdmin = userRole === 'admin' || userRole === 'moderator';

        if (!isOwner && !isAdmin) {
            throw new Error('Bu işlemi yapmaya yetkiniz yok');
        }

        return this.placeModel.deleteOne({ _id: id }).exec();
    }

    async getComments(placeId: string) {
        const comments = await this.placeCommentModel
            .find({ placeId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        // Populate user info
        const userIds = [...new Set(comments.map(c => c.userId))];
        const users = await this.userModel.find({ _id: { $in: userIds } }).lean();
        const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

        return comments.map(c => ({
            ...c,
            user: userMap[c.userId] ? {
                _id: userMap[c.userId]._id,
                fullName: userMap[c.userId].fullName,
                profileImage: (userMap[c.userId] as any).profileImage || null,
            } : null,
        }));
    }

    async addComment(placeId: string, userId: string, text: string) {
        const comment = new this.placeCommentModel({ placeId, userId, text });
        await comment.save();

        // Increment counter on place
        await this.placeModel.updateOne({ _id: placeId }, { $inc: { commentCount: 1 } });

        // Invalidate feed cache for this user
        await this.invalidateFeedCache(userId);

        const user = await this.userModel.findById(userId).lean();
        return {
            ...comment.toObject(),
            user: user ? {
                _id: user._id,
                fullName: (user as any).fullName,
                profileImage: (user as any).profileImage || null,
            } : null,
        };
    }

    async toggleLike(placeId: string, userId: string) {
        const place = await this.placeModel.findById(placeId);
        if (!place) throw new Error('Yer bulunamadı');

        const likes: string[] = (place as any).likes || [];
        const index = likes.indexOf(userId);
        if (index === -1) {
            likes.push(userId);
        } else {
            likes.splice(index, 1);
        }
        (place as any).likes = likes;
        await place.save();

        // Invalidate feed cache for this user
        await this.invalidateFeedCache(userId);

        return { likeCount: likes.length, isLiked: index === -1 };
    }

    async invalidateFeedCache(userId: string): Promise<void> {
        try {
            const keys = await this.redisService.keys(`feed:${userId}:*`);
            if (keys.length > 0) {
                await this.redisService.mdel(keys);
            }
        } catch (error) {
            console.error('Error invalidating feed cache:', error);
        }
    }
}
