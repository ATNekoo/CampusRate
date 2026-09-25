import { ArrayUnique, IsArray, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PlaceCategoryEnum } from '../enum/place.category.enum';
import { PlaceStatusEnum } from '../enum/place.status.enum';

export class CreatePlaceDto {
    @IsString()
    @MinLength(3)
    @MaxLength(120)
    name!: string;
  
    @IsString()
    @MinLength(10)
    @MaxLength(500)
    description!: string;

    @IsEnum(PlaceCategoryEnum)
    category!: PlaceCategoryEnum;

    @IsString()
    @MinLength(3)
    @MaxLength(200)
    address!: string;

    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    services?: string[];


    @IsOptional()
    @IsEnum(PlaceStatusEnum)
    status?: PlaceStatusEnum;
}