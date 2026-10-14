import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { UpdateReviewDto } from './dtos/update-reviews.dto';
import {
  ApiBadRequestResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ProblemDetails } from '../common/dtos/problem-details.dto';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get(':id')
  @ApiOperation({
    summary: 'Get a review by id',
  })
  @ApiOkResponse({
    description: 'The review.',
  })
  @ApiNotFoundResponse({
    description: 'No review has this id.',
    type: ProblemDetails,
  })
  findOne(@Param('id') id: string) {
    return this.reviewsService.findOneById(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Partially update a review (rating and comment only)',
  })
  @ApiOkResponse({
    description: 'The updated review. The place statistics are recomputed.',
  })
  @ApiBadRequestResponse({
    description:
      'Invalid value, null value, or a non-editable / unknown property was sent.',
    type: ProblemDetails,
  })
  @ApiNotFoundResponse({
    description: 'No review has this id.',
    type: ProblemDetails,
  })
  update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
    return this.reviewsService.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete a review',
  })
  @ApiNoContentResponse({
    description: 'Review deleted. The place statistics are recomputed.',
  })
  @ApiNotFoundResponse({
    description: 'No review has this id.',
    type: ProblemDetails,
  })
  async remove(@Param('id') id: string): Promise<void> {
    await this.reviewsService.remove(id);
  }
}
