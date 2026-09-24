import { PartialType } from '@nestjs/mapped-types';
import { IsEnum, IsOptional } from 'class-validator';
import { PlaceStatusEnum } from '../enum/place.status.enum';
import { CreatePlaceDto } from './create-places.dto';


export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {
  @IsOptional()
  @IsEnum(PlaceStatusEnum)
  status?: PlaceStatusEnum;
}