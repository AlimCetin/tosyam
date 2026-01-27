import { Document, Types } from 'mongoose';
export declare class ConfessionComment extends Document {
    confessionId: string;
    userId: string;
    text: string;
    deletedAt: Date;
}
export declare const ConfessionCommentSchema: import("mongoose").Schema<ConfessionComment, import("mongoose").Model<ConfessionComment, any, any, any, (Document<unknown, any, ConfessionComment, any, import("mongoose").DefaultSchemaOptions> & ConfessionComment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, ConfessionComment, any, import("mongoose").DefaultSchemaOptions> & ConfessionComment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}), any, ConfessionComment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, ConfessionComment, Document<unknown, {}, ConfessionComment, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ConfessionComment & Required<{
    _id: Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<Types.ObjectId, ConfessionComment, Document<unknown, {}, ConfessionComment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ConfessionComment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    text?: import("mongoose").SchemaDefinitionProperty<string, ConfessionComment, Document<unknown, {}, ConfessionComment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ConfessionComment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    deletedAt?: import("mongoose").SchemaDefinitionProperty<Date, ConfessionComment, Document<unknown, {}, ConfessionComment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ConfessionComment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, ConfessionComment, Document<unknown, {}, ConfessionComment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ConfessionComment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    confessionId?: import("mongoose").SchemaDefinitionProperty<string, ConfessionComment, Document<unknown, {}, ConfessionComment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<ConfessionComment & Required<{
        _id: Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, ConfessionComment>;
