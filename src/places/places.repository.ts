import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model } from 'mongoose';
import { Place } from './schemas/place.schema';

@Injectable()
export class PlacesRepository {
  constructor(
    @InjectModel(Place.name) private readonly placeModel: Model<Place>,
  ) {}

  async create(data: Partial<Place>): Promise<Place> {
    return this.placeModel.create(data);
  }

  async findPage(
    filter: FilterQuery<Place>,
    skip: number,
    limit: number,
  ): Promise<Place[]> {
    return this.placeModel
      .find(filter)
      .sort({ createdAt: 1, _id: 1 })
      .skip(skip)
      .limit(limit)
      .exec();
  }

  async count(filter: FilterQuery<Place>): Promise<number> {
    return this.placeModel.countDocuments(filter).exec();
  }

  async findById(id: string): Promise<Place | null> {
    return this.placeModel.findById(id).exec();
  }

  async updateById(id: string, changes: Partial<Place>): Promise<Place | null> {
    return this.placeModel
      .findByIdAndUpdate(
        id,
        { $set: changes },
        { new: true, runValidators: true },
      )
      .exec();
  }

  async deleteById(id: string): Promise<void> {
    await this.placeModel.findByIdAndDelete(id).exec();
  }

  async setStats(
    id: string,
    stats: { averageRating: number | null; reviewCount: number },
  ): Promise<void> {
    // timestamps: false, so recomputing stats doesn't touch updatedAt (same as TP1)
    await this.placeModel
      .updateOne({ _id: id }, { $set: stats }, { timestamps: false })
      .exec();
  }
}
