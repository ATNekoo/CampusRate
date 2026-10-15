import { Module } from '@nestjs/common';
import { PlacesModule } from '../places/places.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PlaceReviewsController } from './places-reviews.controller';
import { Review, ReviewSchema } from './schemas/review.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { ReviewsRepository } from './reviews.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: Review.name,
        schema: ReviewSchema,
      },
    ]),
    PlacesModule,
  ],
  controllers: [PlaceReviewsController, ReviewsController],
  providers: [ReviewsService, ReviewsRepository],
})
export class ReviewsModule {}
