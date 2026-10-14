import {
  Body,
  Controller,
  Get,
  HttpStatus,
  Param,
  Post,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dtos/create-reviews.dto';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProblemDetails } from '../common/dtos/problem-details.dto';

@ApiTags('Reviews')
@Controller('places/:placeId/reviews')
export class PlaceReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Post()
  @ApiOperation({
    summary: 'Publish a review for a place',
  })
  @ApiCreatedResponse({
    description: 'Review created. The Location header holds its URI.',
  })
  @ApiBadRequestResponse({
    description:
      'Missing required property, rating outside 1 to 5, or unknown/forbidden property.',
    type: ProblemDetails,
  })
  @ApiNotFoundResponse({
    description: 'No place has this id.',
    type: ProblemDetails,
  })
  async create(
    @Param('placeId') placeId: string,
    @Body() dto: CreateReviewDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const review = await this.reviewsService.create(placeId, dto);
    res.setHeader('Location', `/api/v1/reviews/${review.id}`);
    res.status(HttpStatus.CREATED);
    return review;
  }

  @Get()
  @ApiOperation({
    summary: 'List the reviews of a place',
  })
  @ApiOkResponse({
    description:
      'The reviews of the place. An empty list is a 200, not an error.',
  })
  @ApiNotFoundResponse({
    description: 'No place has this id.',
    type: ProblemDetails,
  })
  findAllForPlace(@Param('placeId') placeId: string) {
    return this.reviewsService.findAllForPlace(placeId);
  }
}
