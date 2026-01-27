"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfessionsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const confessions_controller_1 = require("./confessions.controller");
const confessions_service_1 = require("./confessions.service");
const confession_entity_1 = require("../entities/confession.entity");
const confession_comment_entity_1 = require("../entities/confession-comment.entity");
const user_entity_1 = require("../entities/user.entity");
const notification_entity_1 = require("../entities/notification.entity");
const report_entity_1 = require("../entities/report.entity");
let ConfessionsModule = class ConfessionsModule {
};
exports.ConfessionsModule = ConfessionsModule;
exports.ConfessionsModule = ConfessionsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: confession_entity_1.Confession.name, schema: confession_entity_1.ConfessionSchema },
                { name: confession_comment_entity_1.ConfessionComment.name, schema: confession_comment_entity_1.ConfessionCommentSchema },
                { name: user_entity_1.User.name, schema: user_entity_1.UserSchema },
                { name: notification_entity_1.Notification.name, schema: notification_entity_1.NotificationSchema },
                { name: report_entity_1.Report.name, schema: report_entity_1.ReportSchema },
            ]),
        ],
        controllers: [confessions_controller_1.ConfessionsController],
        providers: [confessions_service_1.ConfessionsService],
    })
], ConfessionsModule);
//# sourceMappingURL=confessions.module.js.map