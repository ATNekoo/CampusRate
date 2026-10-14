import { Module } from '@nestjs/common';
import { ReviewsModule } from './reviews/reviews.module';
import { PlacesModule } from './places/places.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from 'joi';
import databaseConfig from './config/database.config';
import { MongooseModule } from '@nestjs/mongoose';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig],
      validationSchema: Joi.object({
        MONGO_URI: Joi.string().required(),
        PORT: Joi.number().default(3000),
        CORS_ORIGINS: Joi.string().default(''),
      }),
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        uri: config.get<string>('database.uri'),
        autoIndex: process.env.NODE_ENV !== 'production',
      }),
    }),
    ReviewsModule,
    PlacesModule,
  ],
})
export class AppModule {}
