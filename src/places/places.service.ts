import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { PlaceStatusEnum } from './enum/place.status.enum';
import { CreatePlaceDto } from './dtos/create-places.dto';
import { UpdatePlaceDto } from './dtos/update-places.dto';
import { QueryPlacesDto } from './dtos/query-places.dto';
import { PlacesRepository } from './places.repository';
import { ReviewsRepository } from '../reviews/reviews.repository';
import { Place } from './schemas/place.schema';
import { FilterQuery } from 'mongoose';

const EDITABLE_FIELDS = [
  'name',
  'description',
  'category',
  'address',
  'services',
  'status',
] as const;

@Injectable()
export class PlacesService {
  constructor(
    private readonly placesRepository: PlacesRepository,
    private readonly reviewsRepository: ReviewsRepository,
  ) {}

  async findAll(query: QueryPlacesDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;

    const filter: FilterQuery<Place> = {};
    if (query.category) filter.category = query.category;

    const [data, totalItems] = await Promise.all([
      this.placesRepository.findPage(filter, (page - 1) * limit, limit),
      this.placesRepository.count(filter),
    ]);

    return {
      data,
      pagination: {
        page,
        limit,
        totalItems,
        totalPages: Math.ceil(totalItems / limit),
      },
    };
  }

  async findOneById(id: string): Promise<Place> {
    const place = await this.placesRepository.findById(id);
    if (!place) {
      throw new NotFoundException(`Place with ID ${id} not found`);
    }
    return place;
  }

  async create(dto: CreatePlaceDto): Promise<Place> {
    return this.placesRepository.create({
      _id: `plc_${randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`,
      name: dto.name,
      description: dto.description,
      category: dto.category,
      address: dto.address,
      services: dto.services ?? [],
      status: dto.status ?? PlaceStatusEnum.ACTIVE,
    });
  }

  async update(id: string, dto: UpdatePlaceDto): Promise<Place> {
    const changes = Object.fromEntries(
      EDITABLE_FIELDS.filter((field) => dto[field] !== undefined).map(
        (field) => [field, dto[field]],
      ),
    );
    if (Object.values(changes).includes(null)) {
      throw new BadRequestException('null values are not allowed.');
    }
    const place = await this.placesRepository.updateById(id, changes);
    if (!place)
      throw new NotFoundException(`Place with id "${id}" was not found.`);
    return place;
  }

  async remove(id: string): Promise<void> {
    await this.findOneById(id);

    if ((await this.reviewsRepository.countByPlaceId(id)) > 0) {
      throw new ConflictException(
        `Place "${id}" cannot be deleted because it still has associated reviews.`,
      );
    }
    await this.placesRepository.deleteById(id);
  }

  async patchStats(
    id: string,
    stats: { averageRating: number | null; reviewCount: number },
  ): Promise<void> {
    await this.placesRepository.setStats(id, stats);
  }
}
