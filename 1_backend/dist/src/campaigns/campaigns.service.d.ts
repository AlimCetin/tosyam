import { Model } from 'mongoose';
import { Campaign } from '../entities/campaign.entity';
import { DiscountCode } from '../entities/discount-code.entity';
import { CampaignComment } from '../entities/campaign-comment.entity';
import { User } from '../entities/user.entity';
import { RedisService } from '../common/redis/redis.service';
export declare class CampaignsService {
    private campaignModel;
    private discountCodeModel;
    private campaignCommentModel;
    private userModel;
    private readonly redisService;
    constructor(campaignModel: Model<Campaign>, discountCodeModel: Model<DiscountCode>, campaignCommentModel: Model<CampaignComment>, userModel: Model<User>, redisService: RedisService);
    findAll(city?: string): Promise<(Campaign & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, Campaign, {}, import("mongoose").DefaultSchemaOptions> & Campaign & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    claimCode(campaignId: string, userId: string): Promise<import("mongoose").Document<unknown, {}, DiscountCode, {}, import("mongoose").DefaultSchemaOptions> & DiscountCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    getMyCodes(userId: string): Promise<(import("mongoose").Document<unknown, {}, DiscountCode, {}, import("mongoose").DefaultSchemaOptions> & DiscountCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    create(createCampaignDto: any, userId: string): Promise<import("mongoose").Document<unknown, {}, Campaign, {}, import("mongoose").DefaultSchemaOptions> & Campaign & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findMyCampaigns(userId: string): Promise<(Campaign & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    update(id: string, userId: string, userRole: string, updateData: any): Promise<any>;
    remove(id: string, userId: string, userRole: string): Promise<import("mongodb").DeleteResult>;
    getComments(campaignId: string): Promise<{
        user: {
            _id: import("mongoose").Types.ObjectId;
            fullName: any;
            profileImage: any;
        } | null;
        campaignId: string;
        userId: string;
        text: string;
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }[]>;
    addComment(campaignId: string, userId: string, text: string): Promise<{
        user: {
            _id: import("mongoose").Types.ObjectId;
            fullName: any;
            profileImage: any;
        } | null;
        campaignId: string;
        userId: string;
        text: string;
        _id: import("mongoose").Types.ObjectId;
        $locals: Record<string, unknown>;
        $op: "save" | "validate" | "remove" | null;
        $where: Record<string, unknown>;
        baseModelName?: string;
        collection: import("mongoose").Collection;
        db: import("mongoose").Connection;
        errors?: import("mongoose").Error.ValidationError;
        isNew: boolean;
        schema: import("mongoose").Schema;
        __v: number;
    }>;
    toggleLike(campaignId: string, userId: string): Promise<{
        likeCount: number;
        isLiked: boolean;
    }>;
    invalidateFeedCache(userId: string): Promise<void>;
}
