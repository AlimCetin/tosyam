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
exports.ConfessionsController = void 0;
const common_1 = require("@nestjs/common");
const confessions_service_1 = require("./confessions.service");
const jwt_guard_1 = require("../guards/jwt.guard");
let ConfessionsController = class ConfessionsController {
    confessionsService;
    constructor(confessionsService) {
        this.confessionsService = confessionsService;
    }
    async create(req, text) {
        return this.confessionsService.create(req.user.id, text);
    }
    async findAll(req, page, limit) {
        return this.confessionsService.findAll(Number(page) || 1, Number(limit) || 20, req.user.id);
    }
    async findMe(req, page, limit) {
        return this.confessionsService.findMe(req.user.id, Number(page) || 1, Number(limit) || 20);
    }
    async like(req, id) {
        return this.confessionsService.like(id, req.user.id);
    }
    async getComments(id, page, limit) {
        return this.confessionsService.getComments(id, Number(page) || 1, Number(limit) || 20);
    }
    async addComment(req, id, text) {
        return this.confessionsService.addComment(id, req.user.id, text);
    }
    async report(req, id, reason) {
        return this.confessionsService.report(id, req.user.id, reason);
    }
};
exports.ConfessionsController = ConfessionsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ConfessionsController.prototype, "create", null);
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ConfessionsController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('me'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ConfessionsController.prototype, "findMe", null);
__decorate([
    (0, common_1.Post)(':id/like'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ConfessionsController.prototype, "like", null);
__decorate([
    (0, common_1.Get)(':id/comments'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], ConfessionsController.prototype, "getComments", null);
__decorate([
    (0, common_1.Post)(':id/comments'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('text')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ConfessionsController.prototype, "addComment", null);
__decorate([
    (0, common_1.Post)(':id/report'),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Param)('id')),
    __param(2, (0, common_1.Body)('reason')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ConfessionsController.prototype, "report", null);
exports.ConfessionsController = ConfessionsController = __decorate([
    (0, common_1.Controller)('confessions'),
    (0, common_1.UseGuards)(jwt_guard_1.JwtAuthGuard),
    __metadata("design:paramtypes", [confessions_service_1.ConfessionsService])
], ConfessionsController);
//# sourceMappingURL=confessions.controller.js.map