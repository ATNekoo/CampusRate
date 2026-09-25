import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PlaceCategoryEnum } from '../enum/place.category.enum';

export class QueryPlacesDto {
    @IsOptional()
    @IsEnum(PlaceCategoryEnum)
    category?: PlaceCategoryEnum; 
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;
  
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(30)
    limit?: number = 10;
}