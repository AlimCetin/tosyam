"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PlacesService = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
const place_entity_1 = require("../entities/place.entity");
const place_comment_entity_1 = require("../entities/place-comment.entity");
const user_entity_1 = require("../entities/user.entity");
const redis_service_1 = require("../common/redis/redis.service");
let PlacesService = class PlacesService {
    placeModel;
    placeCommentModel;
    userModel;
    redisService;
    constructor(placeModel, placeCommentModel, userModel, redisService) {
        this.placeModel = placeModel;
        this.placeCommentModel = placeCommentModel;
        this.userModel = userModel;
        this.redisService = redisService;
    }
    async findAll(city, category) {
        const query = { isActive: true };
        if (city)
            query.city = city;
        if (category)
            query.category = category;
        return this.placeModel.find(query)
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
    async findOne(id) {
        const place = await this.placeModel.findById(id).exec();
        if (!place) {
            throw new common_1.NotFoundException('Yer bulunamadı');
        }
        return place;
    }
    async create(createPlaceDto, userId) {
        const newPlace = new this.placeModel({
            ...createPlaceDto,
            createdBy: userId,
        });
        return newPlace.save();
    }
    async findMyPlaces(userId) {
        return this.placeModel.find({ createdBy: userId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
    }
    async update(id, userId, userRole, updateData) {
        const place = await this.findOne(id);
        const isOwner = place.createdBy === userId;
        const isAdmin = userRole === 'admin' || userRole === 'moderator';
        if (!isOwner && !isAdmin) {
            throw new Error('Bu işlemi yapmaya yetkiniz yok');
        }
        Object.assign(place, updateData);
        return place.save();
    }
    async remove(id, userId, userRole) {
        const place = await this.findOne(id);
        const isOwner = place.createdBy === userId;
        const isAdmin = userRole === 'admin' || userRole === 'moderator';
        if (!isOwner && !isAdmin) {
            throw new Error('Bu işlemi yapmaya yetkiniz yok');
        }
        return this.placeModel.deleteOne({ _id: id }).exec();
    }
    async getComments(placeId) {
        const comments = await this.placeCommentModel
            .find({ placeId })
            .sort({ createdAt: -1 })
            .lean()
            .exec();
        const userIds = [...new Set(comments.map(c => c.userId))];
        const users = await this.userModel.find({ _id: { $in: userIds } }).lean();
        const userMap = Object.fromEntries(users.map(u => [u._id.toString(), u]));
        return comments.map(c => ({
            ...c,
            user: userMap[c.userId] ? {
                _id: userMap[c.userId]._id,
                fullName: userMap[c.userId].fullName,
                profileImage: userMap[c.userId].profileImage || null,
            } : null,
        }));
    }
    async addComment(placeId, userId, text) {
        const comment = new this.placeCommentModel({ placeId, userId, text });
        await comment.save();
        await this.placeModel.updateOne({ _id: placeId }, { $inc: { commentCount: 1 } });
        await this.invalidateFeedCache(userId);
        const user = await this.userModel.findById(userId).lean();
        return {
            ...comment.toObject(),
            user: user ? {
                _id: user._id,
                fullName: user.fullName,
                profileImage: user.profileImage || null,
            } : null,
        };
    }
    async toggleLike(placeId, userId) {
        const place = await this.placeModel.findById(placeId);
        if (!place)
            throw new Error('Yer bulunamadı');
        const likes = place.likes || [];
        const index = likes.indexOf(userId);
        if (index === -1) {
            likes.push(userId);
        }
        else {
            likes.splice(index, 1);
        }
        place.likes = likes;
        await place.save();
        await this.invalidateFeedCache(userId);
        return { likeCount: likes.length, isLiked: index === -1 };
    }
    async invalidateFeedCache(userId) {
        try {
            const keys = await this.redisService.keys(`feed:${userId}:*`);
            if (keys.length > 0) {
                await this.redisService.mdel(keys);
            }
        }
        catch (error) {
            console.error('Error invalidating feed cache:', error);
        }
    }
};
exports.PlacesService = PlacesService;
exports.PlacesService = PlacesService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, mongoose_1.InjectModel)(place_entity_1.Place.name)),
    __param(1, (0, mongoose_1.InjectModel)(place_comment_entity_1.PlaceComment.name)),
    __param(2, (0, mongoose_1.InjectModel)(user_entity_1.User.name)),
    __metadata("design:paramtypes", [mongoose_2.Model,
        mongoose_2.Model,
        mongoose_2.Model,
        redis_service_1.RedisService])
], PlacesService);
//# sourceMappingURL=places.service.js.map