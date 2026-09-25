import { Body, Controller, Get, HttpStatus, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dtos/create-reviews.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('places/:placeId/reviews')
export class PlaceReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Post()
    async create(
        @Param('placeId') placeId: string,
        @Body() dto: CreateReviewDto,
        @Res({ passthrough: true }) res: Response,
        ) {
        const review = await this.reviewsService.create(placeId, dto);
        res.setHeader('Location', `/reviews/${review.id}`);
        res.status(HttpStatus.CREATED);
        return review;
    }

    @Get()
    findAllForPlace(@Param('placeId') placeId: string) {
        return this.reviewsService.findAllForPlace(placeId);
    }
}