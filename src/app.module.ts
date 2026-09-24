import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { StorageModule } from './storage/storage.module';
import { ReviewsModule } from './reviews/reviews.module';
import { PlacesModule } from './places/places.module';

@Module({
  imports: [StorageModule, ReviewsModule, PlacesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
