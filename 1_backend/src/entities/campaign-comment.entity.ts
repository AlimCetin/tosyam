import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class CampaignComment extends Document {
    @Prop({ required: true, type: String, ref: 'Campaign' })
    campaignId: string;

    @Prop({ required: true, type: String, ref: 'User' })
    userId: string;

    @Prop({ required: true })
    text: string;
}

export const CampaignCommentSchema = SchemaFactory.createForClass(CampaignComment);
CampaignCommentSchema.index({ campaignId: 1, createdAt: -1 });
