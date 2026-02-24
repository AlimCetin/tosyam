import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';
import { Campaign, CampaignSchema } from '../entities/campaign.entity';
import { DiscountCode, DiscountCodeSchema } from '../entities/discount-code.entity';
import { CampaignComment, CampaignCommentSchema } from '../entities/campaign-comment.entity';
import { User, UserSchema } from '../entities/user.entity';

@Module({
    imports: [
        MongooseModule.forFeature([
            { name: Campaign.name, schema: CampaignSchema },
            { name: DiscountCode.name, schema: DiscountCodeSchema },
            { name: CampaignComment.name, schema: CampaignCommentSchema },
            { name: User.name, schema: UserSchema },
        ]),
    ],
    controllers: [CampaignsController],
    providers: [CampaignsService],
    exports: [CampaignsService],
})
export class CampaignsModule { }
