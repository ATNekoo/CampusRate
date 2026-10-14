import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review } from './schemas/review.schema';

@Injectable()
export class ReviewsRepository {
  constructor(@InjectModel(Review.name) private readonly reviewModel: Model<Review>) {}

  async create(data: Partial<Review>): Promise<Review> {
    return this.reviewModel.create(data);
  }

  async findByPlaceId(placeId: string): Promise<Review[]> {
    return this.reviewModel.find({ placeId }).sort({ createdAt: 1, _id: 1 }).exec();
  }

  async findById(id: string): Promise<Review | null> {
    return this.reviewModel.findById(id).exec();
  }

  async updateById(id: string, changes: Partial<Review>): Promise<Review | null> {
    return this.reviewModel
      .findByIdAndUpdate(id, { $set: changes }, { new: true, runValidators: true })
      .exec();
  }

  async deleteById(id: string): Promise<Review | null> {
    return this.reviewModel.findByIdAndDelete(id).exec();
  }

  async countByPlaceId(placeId: string): Promise<number> {
    return this.reviewModel.countDocuments({ placeId }).exec();
  }

  async aggregateStats(placeId: string): Promise<{ average: number; count: number } | undefined> {
    const [result] = await this.reviewModel.aggregate<{ average: number; count: number }>([
      { $match: { placeId } },
      { $group: { _id: '$placeId', average: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    return result;
  }
}