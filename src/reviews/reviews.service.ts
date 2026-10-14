import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PlacesService } from '../places/places.service';
import { ReviewsRepository } from './reviews.repository';
import { Review } from './schemas/review.schema';
import { CreateReviewDto } from './dtos/create-reviews.dto';
import { UpdateReviewDto } from './dtos/update-reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly reviewsRepository: ReviewsRepository,
    private readonly placesService: PlacesService,
  ) {}

  async create(placeId: string, dto: CreateReviewDto): Promise<Review> {
    await this.placesService.findOneById(placeId); // 404 si le place n'existe pas

    const review = await this.reviewsRepository.create({
      _id: `rev_${randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`,
      placeId,
      authorName: dto.authorName,
      rating: dto.rating,
      comment: dto.comment,
    });
    await this.recomputePlaceStats(placeId);
    return review;
  }

  async findAllForPlace(placeId: string): Promise<Review[]> {
    await this.placesService.findOneById(placeId); // 404 si le place n'existe pas
    return this.reviewsRepository.findByPlaceId(placeId);
  }

  async findOneById(id: string): Promise<Review> {
    const review = await this.reviewsRepository.findById(id);
    if (!review)
      throw new NotFoundException(`Review with id "${id}" was not found.`);
    return review;
  }

  async update(id: string, dto: UpdateReviewDto): Promise<Review> {
    const changes: { rating?: number; comment?: string } = {};
    if (dto.rating !== undefined) changes.rating = dto.rating;
    if (dto.comment !== undefined) changes.comment = dto.comment;

    const review = await this.reviewsRepository.findById(id);
    if (!review) {
      throw new NotFoundException(`Review with id "${id}" was not found.`);
    }

    await this.recomputePlaceStats(review.placeId);
    return review;
  }

  async remove(id: string): Promise<void> {
    const review = await this.reviewsRepository.findById(id);
    if (!review) {
      throw new NotFoundException(`Review with id "${id}" was not found.`);
    }

    await this.recomputePlaceStats(review.placeId);
  }

  private async recomputePlaceStats(placeId: string): Promise<void> {
    const stats = await this.reviewsRepository.aggregateStats(placeId);
    await this.placesService.patchStats(placeId, {
      averageRating: stats ? Math.round(stats.average * 100) / 100 : null,
      reviewCount: stats ? stats.count : 0,
    });
  }
}
