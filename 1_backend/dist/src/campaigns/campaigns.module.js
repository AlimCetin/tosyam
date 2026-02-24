"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CampaignsModule = void 0;
const common_1 = require("@nestjs/common");
const mongoose_1 = require("@nestjs/mongoose");
const campaigns_service_1 = require("./campaigns.service");
const campaigns_controller_1 = require("./campaigns.controller");
const campaign_entity_1 = require("../entities/campaign.entity");
const discount_code_entity_1 = require("../entities/discount-code.entity");
const campaign_comment_entity_1 = require("../entities/campaign-comment.entity");
const user_entity_1 = require("../entities/user.entity");
let CampaignsModule = class CampaignsModule {
};
exports.CampaignsModule = CampaignsModule;
exports.CampaignsModule = CampaignsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            mongoose_1.MongooseModule.forFeature([
                { name: campaign_entity_1.Campaign.name, schema: campaign_entity_1.CampaignSchema },
                { name: discount_code_entity_1.DiscountCode.name, schema: discount_code_entity_1.DiscountCodeSchema },
                { name: campaign_comment_entity_1.CampaignComment.name, schema: campaign_comment_entity_1.CampaignCommentSchema },
                { name: user_entity_1.User.name, schema: user_entity_1.UserSchema },
            ]),
        ],
        controllers: [campaigns_controller_1.CampaignsController],
        providers: [campaigns_service_1.CampaignsService],
        exports: [campaigns_service_1.CampaignsService],
    })
], CampaignsModule);
//# sourceMappingURL=campaigns.module.js.map