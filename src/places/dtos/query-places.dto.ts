import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PlaceCategoryEnum } from '../enum/place.category.enum';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class QueryPlacesDto {
    @ApiPropertyOptional({
        description: "The place's category : enumerated values",
        enum: PlaceCategoryEnum,
        example: PlaceCategoryEnum.LIBRARY,
    })
    @IsOptional()
    @IsEnum(PlaceCategoryEnum)
    category?: PlaceCategoryEnum; 

    @ApiPropertyOptional({
        description: 'The page number for pagination (default: 1)',
        example: 1,
        maximum: 30,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({
        description: 'The number of items per page for pagination (default: 10)',
        example: 10,
        maximum: 30,
    })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(30)
    limit?: number = 10;
}