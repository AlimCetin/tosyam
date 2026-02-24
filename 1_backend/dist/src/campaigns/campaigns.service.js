"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const campaign_entity_1 = require("../entities/campaign.entity");
const discount_code_entity_1 = require("../entities/discount-code.entity");
const campaign_comment_entity_1 = require("../entities/campaign-comment.entity");
const user_entity_1 = require("../entities/user.entity");
const redis_service_1 = require("../common/redis/redis.service");
const crypto = __importStar(require("crypto"));
let CampaignsService = class CampaignsService {
    campaignModel;
    discountCodeModel;
    campaignCommentModel;
    userModel;
    redisService;
    constructor(campaignModel, discountCodeModel, campaignCommentModel, userModel, redisService) {
        this.campaignModel = campaignModel;
        this.discountCodeModel = discountCodeModel;
        this.campaignCommentModel = campaignCommentModel;
        this.userModel = userModel;
        this.redisService = redisService;
    }
    async findAll(city) {
        const now = new Date();
        const query = {
            isActive: true,
            $and: [
                { $or: [{ endDate: { $gt: now } }, { endDate: null }] },
                { $or: [{ startDate: { $lte: now } }, { startDate: null }] },
            ],
        };
        if (city)
            query.city = city;
        return this.campaignModel.find(query)
            .sort({ isPaid: -1, createdAt: -1 })
            .lean()
            .exec();
    }
    async findOne(id) {
        const campaign = await this.campaignModel.findById(id).exec();
        if (!campaign) {
            throw new common_1.NotFoundException('Kampanya bulunamadı');
        }
        return campaign;
    }
    async claimCode(campaignId, userId) {
        const campaign = await this.findOne(campaignId);
        if (!campaign.hasCode) {
            throw new common_1.BadRequestException('Bu kampanya için kod gerekmiyor');
        }
        if (campaign.maxClaims && campaign.currentClaims >= campaign.maxClaims) {
            throw new common_1.BadRequestException('Kampanya limiti dolmuştur');
        }
        const now = new Date();
        if (campaign.endDate && campaign.endDate < now) {
            throw new common_1.BadRequestException('Kampanya süresi dolmuştur');
        }
        if (campaign.startDate && campaign.startDate > now) {
            throw new common_1.BadRequestException('Kampanya henüz başlamamıştır');
        }
        const existingCode = await this.discountCodeModel.findOne({ campaignId, userId }).exec();
        if (existingCode) {
            return existingCode;
        }
        const code = crypto.randomBytes(4).toString('hex').toUpperCase();
        const newCode = new this.discountCodeModel({ code, campaignId, userId });
        const savedCode = await newCode.save();
        await this.campaignModel.updateOne({ _id: campaignId }, { $inc: { currentClaims: 1 } });
        return savedCode;
    }
    async getMyCodes(userId) {
        return this.discountCodeModel.find({ userId })
            .populate('campaignId')
            .sort({ createdAt: -1 })
            .exec();
    }
    async create(createCampaignDto, userId) {
        const newCampaign = new this.campaignModel({
            ...createCampaignDto,
            createdBy: userId,
        });
        return newCampaign.save();
    }
    async findMyCampaigns(userId) {
        return this.campaignModel.find({ createdBy: userId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
    async update(id, userId, userRole, updateData) {
        const campaign = await this.findOne(id);
        const isOwner = campaign.createdBy === userId;
        const isAdmin = userRole === 'admin' || userRole === 'moderator';
        if (!isOwner && !isAdmin) {
            throw new Error('Bu işlemi yapmaya yetkiniz yok');
        }
        Object.assign(campaign, updateData);
        return campaign.save();
    }
    async remove(id, userId, userRole) {
        const campaign = await this.findOne(id);
        const isOwner = campaign.createdBy === userId;
        const isAdmin = userRole === 'admin' || userRole === 'moderator';
        if (!isOwner && !isAdmin) {
            throw new Error('Bu işlemi yapmaya yetkiniz yok');
        }
        return this.campaignModel.deleteOne({ _id: id }).exec();
    }
    async getComments(campaignId) {
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
                fullName: userMap[c.userId].fullName,
                profileImage: userMap[c.userId].profileImage || null,
            } : null,
        }));
    }
    async addComment(campaignId, userId, text) {
        const comment = new this.campaignCommentModel({ campaignId, userId, text });
        await comment.save();
        await this.campaignModel.updateOne({ _id: campaignId }, { $inc: { commentCount: 1 } });
        await this.invalidateFeedCache(userId);
        const user = await this.userModel.findById(userId).lean();
        return {
            ...comment.toObject(),
            user: user ? {
                _id: user._id,
                fullName: user.fullName,
                profileImage: user.profileImage || null,
            } : null,
        };
    }
    async toggleLike(campaignId, userId) {
        const campaign = await this.campaignModel.findById(campaignId);
        if (!campaign)
            throw new Error('Kampanya bulunamadı');
        const likes = campaign.likes || [];
        const index = likes.indexOf(userId);
        if (index === -1) {
            likes.push(userId);
        }
        else {
            likes.splice(index, 1);
        }
        campaign.likes = likes;
        await campaign.save();
        await this.invalidateFeedCache(userId);
        return { likeCount: likes.length, isLiked: index === -1 };
    }
    async invalidateFeedCache(userId) {
        try {
            const keys = await this.redisService.keys(`feed:${userId}:*`);
            if (keys.length > 0) {
                await this.redisService.mdel(keys);
            }
        }
        catch (error) {
            console.error('Error invalidating feed cache:', error);
        }
    }
};
exports.CampaignsService = CampaignsService;
exports.CampaignsService = CampaignsService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(campaign_entity_1.Campaign.name)),
    __param(1, (0, mongoose_1.InjectModel)(discount_code_entity_1.DiscountCode.name)),
    __param(2, (0, mongoose_1.InjectModel)(campaign_comment_entity_1.CampaignComment.name)),
    __param(3, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        redis_service_1.RedisService])
], CampaignsService);
//# sourceMappingURL=campaigns.service.js.map