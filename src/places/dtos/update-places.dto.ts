import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { PlaceStatusEnum } from '../enum/place.status.enum';
import { CreatePlaceDto } from './create-places.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {
  @ApiPropertyOptional({
    description: 'The status of the place',
    enum: PlaceStatusEnum,
    example: PlaceStatusEnum.ACTIVE,
  })
  @IsOptional()
  @IsEnum(PlaceStatusEnum)
  status?: PlaceStatusEnum;
}
