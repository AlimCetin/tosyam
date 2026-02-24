import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class PlaceComment extends Document {
    @Prop({ required: true, type: String, ref: 'Place' })
    placeId: string;

    @Prop({ required: true, type: String, ref: 'User' })
    userId: string;

    @Prop({ required: true })
    text: string;
}

export const PlaceCommentSchema = SchemaFactory.createForClass(PlaceComment);
PlaceCommentSchema.index({ placeId: 1, createdAt: -1 });
