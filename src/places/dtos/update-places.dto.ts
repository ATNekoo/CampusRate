import { PartialType } from '@nestjs/swagger';
import { CreatePlaceDto } from './create-places.dto';

export class UpdatePlaceDto extends PartialType(CreatePlaceDto) {}
