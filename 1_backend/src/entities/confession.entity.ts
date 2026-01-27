import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
export class Confession extends Document {
    @Prop({ required: true, type: String, ref: 'User' })
    userId: string;

    @Prop({ required: true, trim: true })
    text: string;

    @Prop({ type: [{ type: String, ref: 'User' }], default: [] })
    likes: string[];

    @Prop({ default: 0 })
    commentCount: number;

    @Prop({ default: null })
    deletedAt: Date;
}

export const ConfessionSchema = SchemaFactory.createForClass(Confession);

ConfessionSchema.index({ createdAt: -1 });
ConfessionSchema.index({ userId: 1 });
