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
exports.DiscountCodeSchema = exports.DiscountCode = void 0;
const mongoose_1 = require("@nestjs/mongoose");
const mongoose_2 = require("mongoose");
let DiscountCode = class DiscountCode extends mongoose_2.Document {
    code;
    campaignId;
    userId;
    isUsed;
    usedAt;
};
exports.DiscountCode = DiscountCode;
__decorate([
    (0, mongoose_1.Prop)({ required: true, unique: true }),
    __metadata("design:type", String)
], DiscountCode.prototype, "code", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, ref: 'Campaign' }),
    __metadata("design:type", String)
], DiscountCode.prototype, "campaignId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ required: true, type: String, ref: 'User' }),
    __metadata("design:type", String)
], DiscountCode.prototype, "userId", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: false }),
    __metadata("design:type", Boolean)
], DiscountCode.prototype, "isUsed", void 0);
__decorate([
    (0, mongoose_1.Prop)({ default: null }),
    __metadata("design:type", Date)
], DiscountCode.prototype, "usedAt", void 0);
exports.DiscountCode = DiscountCode = __decorate([
    (0, mongoose_1.Schema)({ timestamps: true })
], DiscountCode);
exports.DiscountCodeSchema = mongoose_1.SchemaFactory.createForClass(DiscountCode);
exports.DiscountCodeSchema.index({ code: 1 }, { unique: true });
exports.DiscountCodeSchema.index({ campaignId: 1, userId: 1 });
//# sourceMappingURL=discount-code.entity.js.map