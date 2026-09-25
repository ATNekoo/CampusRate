import { IsInt, IsString, Max, MaxLength, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateReviewDto {
    @ApiProperty({
        description: 'The name of the reviewer',
        example: 'John Doe',
    })
    @IsString()
    @MinLength(2)
    @MaxLength(80)
    authorName!: string;

    @ApiProperty({
        description: 'The rating for the place',
        example: 5,
        minimum: 1,
        maximum: 5,
    })
    @IsInt()
    @Min(1)
    @Max(5)
    rating!: number;

    @ApiProperty({
        description: 'The comment for the review',
        example: 'Great place to study!',
        minLength: 5,
        maxLength: 300,
    })
    @IsString()
    @MinLength(5)
    @MaxLength(300)
    comment!: string;
}