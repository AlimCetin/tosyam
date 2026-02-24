import { CampaignsService } from './campaigns.service';
export declare class CampaignsController {
    private readonly campaignsService;
    constructor(campaignsService: CampaignsService);
    findAll(city?: string): Promise<(import("../entities/campaign.entity").Campaign & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    getMyCodes(req: any): Promise<(import("mongoose").Document<unknown, {}, import("../entities/discount-code.entity").DiscountCode, {}, import("mongoose").DefaultSchemaOptions> & import("../entities/discount-code.entity").DiscountCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    })[]>;
    findMyCampaigns(req: any): Promise<(import("../entities/campaign.entity").Campaign & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("../entities/campaign.entity").Campaign, {}, import("mongoose").DefaultSchemaOptions> & import("../entities/campaign.entity").Campaign & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    claimCode(id: string, req: any): Promise<import("mongoose").Document<unknown, {}, import("../entities/discount-code.entity").DiscountCode, {}, import("mongoose").DefaultSchemaOptions> & import("../entities/discount-code.entity").DiscountCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(createCampaignDto: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("../entities/campaign.entity").Campaign, {}, import("mongoose").DefaultSchemaOptions> & import("../entities/campaign.entity").Campaign & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    update(id: string, updateData: any, req: any): Promise<any>;
    remove(id: string, req: any): Promise<import("mongodb").DeleteResult>;
    getComments(id: string): Promise<{
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
    addComment(id: string, text: string, req: any): Promise<{
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
    toggleLike(id: string, req: any): Promise<{
        likeCount: number;
        isLiked: boolean;
    }>;
}
