import { Body, Controller, Delete, Get, HttpCode, HttpStatus, Param, Patch } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { UpdateReviewDto } from './dtos/update-reviews.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewsController {
    constructor(private readonly reviewsService: ReviewsService) {}

    @Get(':id')
    findOne(@Param('id') id: string) {
      return this.reviewsService.findOneById(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateReviewDto) {
      return this.reviewsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    async remove(@Param('id') id: string): Promise<void> {
      await this.reviewsService.remove(id);
    }
}