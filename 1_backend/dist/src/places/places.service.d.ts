import { Model } from 'mongoose';
import { Place } from '../entities/place.entity';
import { PlaceComment } from '../entities/place-comment.entity';
import { User } from '../entities/user.entity';
import { RedisService } from '../common/redis/redis.service';
export declare class PlacesService {
    private placeModel;
    private placeCommentModel;
    private userModel;
    private readonly redisService;
    constructor(placeModel: Model<Place>, placeCommentModel: Model<PlaceComment>, userModel: Model<User>, redisService: RedisService);
    findAll(city?: string, category?: string): Promise<(Place & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, Place, {}, import("mongoose").DefaultSchemaOptions> & Place & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(createPlaceDto: any, userId: string): Promise<import("mongoose").Document<unknown, {}, Place, {}, import("mongoose").DefaultSchemaOptions> & Place & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findMyPlaces(userId: string): Promise<(Place & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    update(id: string, userId: string, userRole: string, updateData: any): Promise<any>;
    remove(id: string, userId: string, userRole: string): Promise<import("mongodb").DeleteResult>;
    getComments(placeId: string): Promise<{
        user: {
            _id: import("mongoose").Types.ObjectId;
            fullName: string;
            profileImage: any;
        } | null;
        placeId: string;
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
    addComment(placeId: string, userId: string, text: string): Promise<{
        user: {
            _id: import("mongoose").Types.ObjectId;
            fullName: any;
            profileImage: any;
        } | null;
        placeId: string;
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
    toggleLike(placeId: string, userId: string): Promise<{
        likeCount: number;
        isLiked: boolean;
    }>;
    invalidateFeedCache(userId: string): Promise<void>;
}
