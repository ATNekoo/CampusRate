import { Body, Controller, Delete, Get, HttpStatus, Param, Patch, Post, Query, Res } from '@nestjs/common';
import { Response } from 'express';
import { PlacesService } from './places.service';
import { CreatePlaceDto } from './dtos/create-places.dto';
import { UpdatePlaceDto } from './dtos/update-places.dto';
import { QueryPlacesDto } from './dtos/query-places.dto';

@Controller('places')
export class PlacesController {

    constructor(private readonly placesService: PlacesService) {}

    @Get()
    findAll(@Query() query: QueryPlacesDto) {
        return this.placesService.findAll(query);
    }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.placesService.findOneById(id);
  }


  @Post()
  async create(@Body() dto: CreatePlaceDto, @Res({ passthrough: true }) res: Response) {
    const place = await this.placesService.create(dto);
    res.setHeader('Location', `/places/${place.id}`);
    res.status(HttpStatus.CREATED);
    return place;
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdatePlaceDto) {
    return this.placesService.update(id, dto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    return this.placesService.remove(id);
  }
}


