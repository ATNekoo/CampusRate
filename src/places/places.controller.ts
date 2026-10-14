import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dtos/create-places.dto';
import { UpdatePlaceDto } from './dtos/update-places.dto';
import { QueryPlacesDto } from './dtos/query-places.dto';
import { ApiBadRequestResponse, ApiConflictResponse, ApiCreatedResponse, ApiNoContentResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ProblemDetails } from '../common/dtos/problem-details.dto';

@ApiTags('Places')
@Controller('places')
export class PlacesController {
  constructor(private readonly placesService: PlacesService) {}

  @Get()
  @ApiOperation({ 
    summary: 'List places (filterable by category, paginated)' 
  })
  @ApiOkResponse({ 
    description: 'Paginated list: { data, pagination }. An empty list is a 200, not an error.' 
  })
  @ApiBadRequestResponse({ 
    description: 'Invalid category, page or limit.', type: ProblemDetails
  })
  findAll(@Query() query: QueryPlacesDto) {
    return this.placesService.findAll(query);
  }

  @ApiOperation({ 
    summary: 'Get a place by id' 
  })
  @ApiOkResponse({ 
    description: 'The place.' 
  })
  @ApiNotFoundResponse({ 
    description: 'No place has this id.', type: ProblemDetails 
  })
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placesService.findOneById(id);
  }

  @Post()
  @ApiOperation({ 
    summary: 'Create a place' 
  })
  @ApiCreatedResponse({ 
    description: 'Place created. The Location header holds its URI.' 
  })
  @ApiBadRequestResponse({
    description: 'Missing required property, invalid value, or unknown/forbidden property.',
    type: ProblemDetails,
  })
  async create(
    @Body() dto: CreatePlaceDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const place = await this.placesService.create(dto);
    res.setHeader('Location', `api/v1/places/${place.id}`);
    res.status(HttpStatus.CREATED);
    return place;
  }

  @ApiOperation({ 
    summary: 'Partially update a place' 
  })
  @ApiOkResponse({ 
    description: 'The updated place.'
  })
  @ApiBadRequestResponse({
    description: 'Invalid value, or a server-controlled / unknown property was sent.',
    type: ProblemDetails,
  })
  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePlaceDto) {
    return this.placesService.update(id, dto);
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ 
    summary: 'Delete a place (refused while it has reviews)'
  })
  @ApiNoContentResponse({ 
    description: 'Place deleted.' 
  })
  @ApiNotFoundResponse({ 
    description: 'No place has this id.', type: ProblemDetails 
  })
  @ApiConflictResponse({ 
    description: 'The place still has reviews.', type: ProblemDetails 
  })
  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.placesService.remove(id);
  }
}
