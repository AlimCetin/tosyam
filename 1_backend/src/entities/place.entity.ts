import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Place extends Document {
    @Prop({ required: true })
    name: string;

    @Prop({ required: true })
    description: string;

    @Prop({ required: true, index: true })
    city: string;

    @Prop({ required: true })
    category: string; // museum, monument, nature, historic, religious, etc.

    @Prop({ required: true })
    imageUrl: string;

    @Prop({ default: '' })
    address: string;

    @Prop({ type: Number, default: 0 })
    latitude: number;

    @Prop({ type: Number, default: 0 })
    longitude: number;

    @Prop({ default: 'Sürekli Açık' })
    workingHours: string;

    @Prop({ default: 'Ücretsiz' })
    entryFee: string;

    @Prop({ default: true })
    isActive: boolean;

    @Prop({ type: [String], default: [] })
    likes: string[];

    @Prop({ default: 0 })
    commentCount: number;

    @Prop({ type: String, ref: 'User' })
    createdBy: string;
}

export const PlaceSchema = SchemaFactory.createForClass(Place);
PlaceSchema.index({ city: 1, category: 1 });
