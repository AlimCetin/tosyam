import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class DiscountCode extends Document {
    @Prop({ required: true, unique: true })
    code: string;

    @Prop({ required: true, type: String, ref: 'Campaign' })
    campaignId: string;

    @Prop({ required: true, type: String, ref: 'User' })
    userId: string;

    @Prop({ default: false })
    isUsed: boolean;

    @Prop({ default: null })
    usedAt: Date;
}

export const DiscountCodeSchema = SchemaFactory.createForClass(DiscountCode);
DiscountCodeSchema.index({ code: 1 }, { unique: true });
DiscountCodeSchema.index({ campaignId: 1, userId: 1 });
