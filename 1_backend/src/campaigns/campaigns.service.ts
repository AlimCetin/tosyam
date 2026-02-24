import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Campaign } from '../entities/campaign.entity';
import { DiscountCode } from '../entities/discount-code.entity';
import { CampaignComment } from '../entities/campaign-comment.entity';
import { User } from '../entities/user.entity';
import { RedisService } from '../common/redis/redis.service';
import * as crypto from 'crypto';

@Injectable()
export class CampaignsService {
    constructor(
        @InjectModel(Campaign.name) private campaignModel: Model<Campaign>,
        @InjectModel(DiscountCode.name) private discountCodeModel: Model<DiscountCode>,
        @InjectModel(CampaignComment.name) private campaignCommentModel: Model<CampaignComment>,
        @InjectModel(User.name) private userModel: Model<User>,
        private readonly redisService: RedisService,
    ) { }

    async findAll(city?: string) {
        const now = new Date();
        const query: any = {
            isActive: true,
            $and: [
                { $or: [{ endDate: { $gt: now } }, { endDate: null }] },
                { $or: [{ startDate: { $lte: now } }, { startDate: null }] },
            ],
        };
        if (city) query.city = city;

        return this.campaignModel.find(query)
            .sort({ isPaid: -1, createdAt: -1 })
            .lean()
            .exec();
    }

    async findOne(id: string) {
        const campaign = await this.campaignModel.findById(id).exec();
        if (!campaign) {
            throw new NotFoundException('Kampanya bulunamadı');
        }
        return campaign;
    }

    async claimCode(campaignId: string, userId: string) {
        const campaign = await this.findOne(campaignId);

        if (!campaign.hasCode) {
            throw new BadRequestException('Bu kampanya için kod gerekmiyor');
        }

        if (campaign.maxClaims && campaign.currentClaims >= campaign.maxClaims) {
            throw new BadRequestException('Kampanya limiti dolmuştur');
        }

        const now = new Date();
        if (campaign.endDate && campaign.endDate < now) {
            throw new BadRequestException('Kampanya süresi dolmuştur');
        }
        if (campaign.startDate && campaign.startDate > now) {
            throw new BadRequestException('Kampanya henüz başlamamıştır');
        }

        const existingCode = await this.discountCodeModel.findOne({ campaignId, userId }).exec();
        if (existingCode) {
            return existingCode;
        }

        const code = crypto.randomBytes(4).toString('hex').toUpperCase();

        const newCode = new this.discountCodeModel({ code, campaignId, userId });
        const savedCode = await newCode.save();

        // Increment currentClaims
        await this.campaignModel.updateOne(
            { _id: campaignId },
            { $inc: { currentClaims: 1 } }
        );

        return savedCode;
    }

    async getMyCodes(userId: string) {
        return this.discountCodeModel.find({ userId })
            .populate('campaignId')
            .sort({ createdAt: -1 })
            .exec();
    }

    async create(createCampaignDto: any, userId: string) {
        const newCampaign = new this.campaignModel({
            ...createCampaignDto,
            createdBy: userId,
        });
        return newCampaign.save();
    }

    async findMyCampaigns(userId: string) {
        return this.campaignModel.find({ createdBy: userId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }

    async update(id: string, userId: string, userRole: string, updateData: any) {
        const campaign = await this.findOne(id);

        // Permission check: owner, admin, or moderator
        const isOwner = (campaign as any).createdBy === userId;
        const isAdmin = userRole === 'admin' || userRole === 'moderator';

        if (!isOwner && !isAdmin) {
            throw new Error('Bu işlemi yapmaya yetkiniz yok');
        }

        Object.assign(campaign, updateData);
        return (campaign as any).save();
    }

    async remove(id: string, userId: string, userRole: string) {
        const campaign = await this.findOne(id);

        // Permission check
        const isOwner = (campaign as any).createdBy === userId;
        const isAdmin = userRole === 'admin' || userRole === 'moderator';

        if (!isOwner && !isAdmin) {
            throw new Error('Bu işlemi yapmaya yetkiniz yok');
        }

        return this.campaignModel.deleteOne({ _id: id }).exec();
    }

    async getComments(campaignId: string) {
        const comments = await this.campaignCommentModel
            .find({ campaignId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();

        const userIds = [...new Set(comments.map(c => c.userId))];
        const users = await this.userModel.find({ _id: { $in: userIds } }).lean();
        const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));

        return comments.map(c => ({
            ...c,
            user: userMap[c.userId] ? {
                _id: userMap[c.userId]._id,
                fullName: (userMap[c.userId] as any).fullName,
                profileImage: (userMap[c.userId] as any).profileImage || null,
            } : null,
        }));
    }

    async addComment(campaignId: string, userId: string, text: string) {
        const comment = new this.campaignCommentModel({ campaignId, userId, text });
        await comment.save();

        // Increment counter on campaign
        await this.campaignModel.updateOne({ _id: campaignId }, { $inc: { commentCount: 1 } });

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

    async toggleLike(campaignId: string, userId: string) {
        const campaign = await this.campaignModel.findById(campaignId);
        if (!campaign) throw new Error('Kampanya bulunamadı');

        const likes: string[] = (campaign as any).likes || [];
        const index = likes.indexOf(userId);
        if (index === -1) {
            likes.push(userId);
        } else {
            likes.splice(index, 1);
        }
        (campaign as any).likes = likes;
        await campaign.save();

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
