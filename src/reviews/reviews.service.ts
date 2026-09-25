import { Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { StorageService } from '../storage/storage.service';
import { PlacesService } from '../places/places.service';
import { Review } from './entities/review.entity';
import { CreateReviewDto } from './dtos/create-reviews.dto';
import { UpdateReviewDto } from './dtos/update-reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(
    private readonly storage: StorageService,
    private readonly placesService: PlacesService,
  ) {}

  async create(placeId: string, dto: CreateReviewDto): Promise<Review> {
    await this.placesService.findOneById(placeId); // 404 si le place n'existe pas

    const db = await this.storage.readJSONFile();
    const reviews = db.reviews as Review[];

    const now = new Date().toISOString();
    const review: Review = {
      id: `rev_${randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`,
      placeId,
      authorName: dto.authorName,
      rating: dto.rating,
      comment: dto.comment,
      createdAt: now,
      updatedAt: now,
    };

    reviews.push(review);
    db.reviews = reviews;
    await this.storage.writeJSONFile(db);
    await this.recomputePlaceStats(placeId);
    return review;
  }

  async findAllForPlace(placeId: string): Promise<Review[]> {
    await this.placesService.findOneById(placeId); // 404 si le place n'existe pas
    const db = await this.storage.readJSONFile();
    return (db.reviews as Review[]).filter((r) => r.placeId === placeId);
  }

  async findOneById(id: string): Promise<Review> {
    const db = await this.storage.readJSONFile();
    const review = (db.reviews as Review[]).find((r) => r.id === id);
    if (!review) throw new NotFoundException(`Review with id "${id}" was not found.`);
    return review;
  }

  async update(id: string, dto: UpdateReviewDto): Promise<Review> {
    const db = await this.storage.readJSONFile();
    const reviews = db.reviews as Review[];
    const index = reviews.findIndex((r) => r.id === id);
    if (index === -1) throw new NotFoundException(`Review with id "${id}" was not found.`);

    const updated: Review = { ...reviews[index], ...dto, updatedAt: new Date().toISOString() };
    reviews[index] = updated;
    db.reviews = reviews;
    await this.storage.writeJSONFile(db);
    await this.recomputePlaceStats(updated.placeId);
    return updated;
  }

  async remove(id: string): Promise<void> {
    const db = await this.storage.readJSONFile();
    const reviews = db.reviews as Review[];
    const review = reviews.find((r) => r.id === id);
    if (!review) throw new NotFoundException(`Review with id "${id}" was not found.`);

    db.reviews = reviews.filter((r) => r.id !== id);
    await this.storage.writeJSONFile(db);
    await this.recomputePlaceStats(review.placeId);
  }

  /**
   * Recalcule averageRating/reviewCount du place parent après tout
   * changement sur ses reviews. Vit ici (pas dans PlacesService) car
   * c'est un effet de bord d'une action sur Review.
   */
  private async recomputePlaceStats(placeId: string): Promise<void> {
    const db = await this.storage.readJSONFile();
    const reviews = (db.reviews as Review[]).filter((r) => r.placeId === placeId);
    const reviewCount = reviews.length;
    const averageRating =
      reviewCount === 0
        ? null
        : Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount) * 100) / 100;

    await this.placesService.patchStats(placeId, { averageRating, reviewCount });
  }
}