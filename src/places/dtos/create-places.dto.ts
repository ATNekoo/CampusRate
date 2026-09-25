import { ArrayUnique, IsArray, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { PlaceCategoryEnum } from '../enum/place.category.enum';
import { PlaceStatusEnum } from '../enum/place.status.enum';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePlaceDto {
    @ApiProperty({
        description: 'The name of the place',
        example: 'Library',
        maxLength: 120,
    })
    @IsString()
    @MinLength(3)
    @MaxLength(120)
    name!: string;

    @ApiProperty({
        description: 'Brief description of the place',
        example: 'Huge library with many books.',
        maxLength: 100,
    })
    @IsString()
    @MinLength(10)
    @MaxLength(500)
    description!: string;

    @ApiProperty({
        description: "The place's category : enumerated values",
        enum: PlaceCategoryEnum,
        example: PlaceCategoryEnum.LIBRARY,
    })
    @IsEnum(PlaceCategoryEnum)
    category!: PlaceCategoryEnum;

    @ApiProperty({
        description: 'The address of the place',
        example: 'Building S, local S021, Cegep Marie-Victorin',
        maxLength: 100,
    })
    @IsString()
    @MinLength(3)
    @MaxLength(200)
    address!: string;

     @ApiProperty({
        description: "The place's services, without duplicates",
        isArray: true,
        example: ['WIFI', 'POWER_OUTLETS', 'COMPUTERS'],
        required: false,
        default: [],
    })
    @IsOptional()
    @IsArray()
    @ArrayUnique()
    @IsString({ each: true })
    services?: string[];

    @ApiPropertyOptional({
        description: 'The status of the place',
        enum: PlaceStatusEnum,
        example: PlaceStatusEnum.ACTIVE,
        default: PlaceStatusEnum.ACTIVE,
    })
    @IsOptional()
    @IsEnum(PlaceStatusEnum)
    status?: PlaceStatusEnum;
}