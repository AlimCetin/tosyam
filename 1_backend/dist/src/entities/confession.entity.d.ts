import { Document, Types } from 'mongoose';
export declare class Confession extends Document {
    userId: string;
    text: string;
    likes: string[];
    commentCount: number;
    deletedAt: Date;
}
export declare const ConfessionSchema: import("mongoose").Schema<Confession, import("mongoose").Model<Confession, any, any, any, (Document<unknown, any, Confession, any, import("mongoose").DefaultSchemaOptions> & Confession & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, Confession, any, import("mongoose").DefaultSchemaOptions> & Confession & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, Confession>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, Confession, Document<unknown, {}, Confession, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Confession & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, Confession, Document<unknown, {}, Confession, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Confession & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    text?: import("mongoose").SchemaDefinitionProperty<string, Confession, Document<unknown, {}, Confession, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Confession & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    deletedAt?: import("mongoose").SchemaDefinitionProperty<Date, Confession, Document<unknown, {}, Confession, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Confession & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, Confession, Document<unknown, {}, Confession, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Confession & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    likes?: import("mongoose").SchemaDefinitionProperty<string[], Confession, Document<unknown, {}, Confession, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Confession & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    commentCount?: import("mongoose").SchemaDefinitionProperty<number, Confession, Document<unknown, {}, Confession, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<Confession & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, Confession>;
