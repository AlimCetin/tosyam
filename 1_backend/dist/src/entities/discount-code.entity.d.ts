import { Document } from 'mongoose';
export declare class DiscountCode extends Document {
    code: string;
    campaignId: string;
    userId: string;
    isUsed: boolean;
    usedAt: Date;
}
export declare const DiscountCodeSchema: import("mongoose").Schema<DiscountCode, import("mongoose").Model<DiscountCode, any, any, any, (Document<unknown, any, DiscountCode, any, import("mongoose").DefaultSchemaOptions> & DiscountCode & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, DiscountCode, any, import("mongoose").DefaultSchemaOptions> & DiscountCode & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, DiscountCode>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, DiscountCode, Document<unknown, {}, DiscountCode, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DiscountCode & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, DiscountCode, Document<unknown, {}, DiscountCode, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DiscountCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, DiscountCode, Document<unknown, {}, DiscountCode, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DiscountCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    code?: import("mongoose").SchemaDefinitionProperty<string, DiscountCode, Document<unknown, {}, DiscountCode, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DiscountCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    campaignId?: import("mongoose").SchemaDefinitionProperty<string, DiscountCode, Document<unknown, {}, DiscountCode, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DiscountCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    isUsed?: import("mongoose").SchemaDefinitionProperty<boolean, DiscountCode, Document<unknown, {}, DiscountCode, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DiscountCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    usedAt?: import("mongoose").SchemaDefinitionProperty<Date, DiscountCode, Document<unknown, {}, DiscountCode, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<DiscountCode & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, DiscountCode>;
