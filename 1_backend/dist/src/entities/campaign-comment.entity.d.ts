import { Document } from 'mongoose';
export declare class CampaignComment extends Document {
    campaignId: string;
    userId: string;
    text: string;
}
export declare const CampaignCommentSchema: import("mongoose").Schema<CampaignComment, import("mongoose").Model<CampaignComment, any, any, any, (Document<unknown, any, CampaignComment, any, import("mongoose").DefaultSchemaOptions> & CampaignComment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, CampaignComment, any, import("mongoose").DefaultSchemaOptions> & CampaignComment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, CampaignComment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, CampaignComment, Document<unknown, {}, CampaignComment, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<CampaignComment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, CampaignComment, Document<unknown, {}, CampaignComment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<CampaignComment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    text?: import("mongoose").SchemaDefinitionProperty<string, CampaignComment, Document<unknown, {}, CampaignComment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<CampaignComment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, CampaignComment, Document<unknown, {}, CampaignComment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<CampaignComment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    campaignId?: import("mongoose").SchemaDefinitionProperty<string, CampaignComment, Document<unknown, {}, CampaignComment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<CampaignComment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, CampaignComment>;
