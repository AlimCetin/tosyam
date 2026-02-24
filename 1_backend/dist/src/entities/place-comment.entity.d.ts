import { Document } from 'mongoose';
export declare class PlaceComment extends Document {
    placeId: string;
    userId: string;
    text: string;
}
export declare const PlaceCommentSchema: import("mongoose").Schema<PlaceComment, import("mongoose").Model<PlaceComment, any, any, any, (Document<unknown, any, PlaceComment, any, import("mongoose").DefaultSchemaOptions> & PlaceComment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
} & {
    id: string;
}) | (Document<unknown, any, PlaceComment, any, import("mongoose").DefaultSchemaOptions> & PlaceComment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}), any, PlaceComment>, {}, {}, {}, {}, import("mongoose").DefaultSchemaOptions, PlaceComment, Document<unknown, {}, PlaceComment, {
    id: string;
}, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<PlaceComment & Required<{
    _id: import("mongoose").Types.ObjectId;
}> & {
    __v: number;
}, "id"> & {
    id: string;
}, {
    _id?: import("mongoose").SchemaDefinitionProperty<import("mongoose").Types.ObjectId, PlaceComment, Document<unknown, {}, PlaceComment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<PlaceComment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    text?: import("mongoose").SchemaDefinitionProperty<string, PlaceComment, Document<unknown, {}, PlaceComment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<PlaceComment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    userId?: import("mongoose").SchemaDefinitionProperty<string, PlaceComment, Document<unknown, {}, PlaceComment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<PlaceComment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
    placeId?: import("mongoose").SchemaDefinitionProperty<string, PlaceComment, Document<unknown, {}, PlaceComment, {
        id: string;
    }, import("mongoose").ResolveSchemaOptions<import("mongoose").DefaultSchemaOptions>> & Omit<PlaceComment & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    }, "id"> & {
        id: string;
    }> | undefined;
}, PlaceComment>;
