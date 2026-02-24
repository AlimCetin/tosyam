import { ConfessionsService } from './confessions.service';
export declare class ConfessionsController {
    private readonly confessionsService;
    constructor(confessionsService: ConfessionsService);
    create(req: any, text: string): Promise<import("mongoose").Document<unknown, {}, import("../entities/confession.entity").Confession, {}, import("mongoose").DefaultSchemaOptions> & import("../entities/confession.entity").Confession & Required<{
        _id: import("mongoose").Types.ObjectId;
    }> & {
        __v: number;
    } & {
        id: string;
    }>;
    findAll(req: any, page: string, limit: string): Promise<{
        id: any;
        text: any;
        likeCount: any;
        commentCount: any;
        isLiked: any;
        createdAt: any;
    }[]>;
    findMe(req: any, page: string, limit: string): Promise<{
        id: any;
        text: any;
        likeCount: any;
        commentCount: any;
        isLiked: any;
        createdAt: any;
    }[]>;
    like(req: any, id: string): Promise<{
        message: string;
    }>;
    getComments(id: string, page: string, limit: string): Promise<{
        id: any;
        text: any;
        userInitials: any;
        createdAt: any;
    }[]>;
    addComment(req: any, id: string, text: string): Promise<{
        id: string;
        text: string;
        userInitials: string;
        createdAt: any;
    }>;
    report(req: any, id: string, reason: string): Promise<{
        message: string;
    }>;
    findOne(req: any, id: string): Promise<{
        id: string;
        text: string;
        userId: string;
        likeCount: number;
        commentCount: number;
        isLiked: boolean;
        createdAt: any;
    }>;
    delete(req: any, id: string): Promise<{
        success: boolean;
    }>;
}
