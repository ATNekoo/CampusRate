import { Module } from '@nestjs/common';
import { PlacesController } from './places.controller';
import { PlacesService } from './places.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Place, PlaceSchema } from './schemas/place.schema';
import { Review, ReviewSchema } from '../reviews/schemas/review.schema';
import { ReviewsRepository } from '../reviews/reviews.repository';
import { PlacesRepository } from './places.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Place.name, schema: PlaceSchema },
      { name: Review.name, schema: ReviewSchema },
    ]),
  ],
  controllers: [PlacesController],
  providers: [PlacesService, PlacesRepository, ReviewsRepository],
  exports: [PlacesService],
})
export class PlacesModule {}
