import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { PlacesModule } from '../places/places.module';
import { ReviewsController } from './reviews.controller';
import { ReviewsService } from './reviews.service';
import { PlaceReviewsController } from './places-reviews.controller';

@Module({
  imports: [StorageModule, PlacesModule],
  controllers: [PlaceReviewsController, ReviewsController],
  providers: [ReviewsService],
})
export class ReviewsModule {}