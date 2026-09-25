import { IsInt, IsOptional, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {

    @ApiPropertyOptional({
        description: 'The rating for the place',
        example: 5,
        minimum: 1,
        maximum: 5,
    })
    @IsOptional()
    @IsInt()
    @Min(1)
    @Max(5)
    rating?: number;

    @ApiPropertyOptional({
        description: 'The comment for the review',
        example: 'Great place to study!',
        minLength: 5,
        maxLength: 300,
    })
    @IsOptional()
    @IsString()
    @MinLength(5)
    @MaxLength(300)
    comment?: string;
}