import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class ConfessionComment extends Document {
    @Prop({ required: true, type: String, ref: 'Confession' })
    confessionId: string;

    @Prop({ required: true, type: String, ref: 'User' })
    userId: string;

    @Prop({ required: true, trim: true })
    text: string;

    @Prop({ default: null })
    deletedAt: Date;
}

export const ConfessionCommentSchema = SchemaFactory.createForClass(ConfessionComment);

ConfessionCommentSchema.index({ confessionId: 1, createdAt: -1 });
ConfessionCommentSchema.index({ userId: 1 });
