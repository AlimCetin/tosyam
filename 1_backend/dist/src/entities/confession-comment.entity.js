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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfessionCommentSchema = exports.ConfessionComment = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let ConfessionComment = class ConfessionComment extends mongoose_2.Document {
    confessionId;
    userId;
    text;
    deletedAt;
};
exports.ConfessionComment = ConfessionComment;
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, ref: 'Confession' }),
    __metadata("design:type", String)
], ConfessionComment.prototype, "confessionId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, ref: 'User' }),
    __metadata("design:type", String)
], ConfessionComment.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, trim: true }),
    __metadata("design:type", String)
], ConfessionComment.prototype, "text", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], ConfessionComment.prototype, "deletedAt", void 0);
exports.ConfessionComment = ConfessionComment = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], ConfessionComment);
exports.ConfessionCommentSchema = mongoose_1.SchemaFactory.createForClass(ConfessionComment);
exports.ConfessionCommentSchema.index({ confessionId: 1, createdAt: -1 });
exports.ConfessionCommentSchema.index({ userId: 1 });
//# sourceMappingURL=confession-comment.entity.js.map