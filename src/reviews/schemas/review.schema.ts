import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_doc, ret: { _id?: unknown }) => {
      delete ret._id;
      return ret;
    },
  },
})
export class Review extends Document<string> {
  @Prop({ type: String })
  declare _id: string;

  @Prop({ required: true, index: true })
  placeId!: string;

  @Prop({ required: true, trim: true })
  authorName!: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  @Prop({ required: true, trim: true })
  comment!: string;

  createdAt!: Date;
  updatedAt!: Date;
}

export const ReviewSchema = SchemaFactory.createForClass(Review);
