import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Campaign extends Document {
    @Prop({ required: true })
    businessName: string;

    @Prop({ required: true })
    title: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true })
    imageUrl: string;

    @Prop({ required: true })
    discountRate: string;

    @Prop({ required: true, index: true })
    city: string;

    @Prop({ default: false })
    isPaid: boolean;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ required: true, type: String, ref: 'User' })
    createdBy: string;

    @Prop({ default: null })
    startDate: Date;

    @Prop({ default: null })
    endDate: Date;

    @Prop({ type: [String], default: [] })
    likes: string[];

    @Prop({ default: 0 })
    commentCount: number;

    @Prop({ default: null })
    maxClaims: number;

    @Prop({ default: 0 })
    currentClaims: number;

    @Prop({ default: true })
    hasCode: boolean;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
CampaignSchema.index({ city: 1, isActive: 1, isPaid: -1 });
