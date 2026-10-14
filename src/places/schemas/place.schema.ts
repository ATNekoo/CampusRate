import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';
import { PlaceCategoryEnum } from '../enum/place.category.enum';
import { PlaceStatusEnum } from '../enum/place.status.enum';

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
export class Place extends Document<string> {
  @Prop({ type: String })
  declare _id: string;

  @Prop({ required: true, trim: true, minlength: 3, maxlength: 120 })
  name!: string;

  @Prop({ required: true, trim: true, minlength: 10, maxlength: 500 })
  description!: string;

  @Prop({ required: true, enum: Object.values(PlaceCategoryEnum), index: true })
  category!: PlaceCategoryEnum;

  @Prop({ required: true, trim: true, minlength: 3, maxlength: 200 })
  address!: string;

  @Prop({ type: [String], default: [] })
  services!: string[];

  @Prop({
    enum: Object.values(PlaceStatusEnum),
    default: PlaceStatusEnum.ACTIVE,
  })
  status!: PlaceStatusEnum;

  @Prop({ type: Number, default: null })
  averageRating!: number | null;

  @Prop({ default: 0 })
  reviewCount!: number;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PlaceSchema = SchemaFactory.createForClass(Place);
PlaceSchema.index({ name: 1, address: 1 }, { unique: true });
