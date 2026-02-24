import { PlacesService } from './places.service';
export declare class PlacesController {
    private readonly placesService;
    constructor(placesService: PlacesService);
    findAll(city?: string, category?: string): Promise<(import("../entities/place.entity").Place & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findMyPlaces(req: any): Promise<(import("../entities/place.entity").Place & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    })[]>;
    findOne(id: string): Promise<import("mongoose").Document<unknown, {}, import("../entities/place.entity").Place, {}, import("mongoose").DefaultSchemaOptions> & import("../entities/place.entity").Place & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    create(createPlaceDto: any, req: any): Promise<import("mongoose").Document<unknown, {}, import("../entities/place.entity").Place, {}, import("mongoose").DefaultSchemaOptions> & import("../entities/place.entity").Place & Required<{
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
    addComment(id: string, text: string, req: any): Promise<{
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
    toggleLike(id: string, req: any): Promise<{
        likeCount: number;
        isLiked: boolean;
    }>;
}
