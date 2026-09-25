import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { StorageService } from '../storage/storage.service';
import { Place } from './entities/place.entity';
import { PlaceStatusEnum } from './enum/place.status.enum';
import { CreatePlaceDto } from './dtos/create-places.dto';
import { UpdatePlaceDto } from './dtos/update-places.dto';
import { QueryPlacesDto } from './dtos/query-places.dto';

@Injectable()
export class PlacesService {
    constructor(private readonly storage: StorageService) {}

    async findAll(query: QueryPlacesDto) {
        const db = await this.storage.readJSONFile();
        const places = db.places as Place[];

        const filtered = query.category? places.filter((p) => p.category === query.category): places;

        const page = query.page ?? 1;
        const limit = query.limit ?? 10;
        const start = (page - 1) * limit;
        const data = filtered.slice(start, start + limit);

        return {
            data,
            pagination: {
            page,
            limit,
            totalItems: filtered.length,
            totalPages: Math.ceil(filtered.length / limit),
    
            },
        };
    }

    async findOneById(id: string): Promise<Place> {
        const db = await this.storage.readJSONFile();
        const places = db.places as Place[];
        const place = places.find((p) => p.id === id);
        if (!place) {
          throw new NotFoundException(`Place with ID ${id} not found`);
        }
        return place;
    }

    async create(dto: CreatePlaceDto): Promise<Place> {
        const db = await this.storage.readJSONFile();
        const places = db.places as Place[];

        const now = new Date().toISOString();
        const place: Place = {
            id: `plc_${randomUUID().replace(/-/g, '').slice(0, 10).toUpperCase()}`,
            name: dto.name,
            description: dto.description,
            category: dto.category,
            address: dto.address,
            services: dto.services ?? [],
            status: dto.status ?? PlaceStatusEnum.ACTIVE,
            averageRating: null,
            reviewCount: 0,
            createdAt: now,
            updatedAt: now,
        };

        places.push(place);
        db.places = places;
        await this.storage.writeJSONFile(db);
        return place;
    }

    async update(id: string, dto: UpdatePlaceDto): Promise<Place> {
        const db = await this.storage.readJSONFile();
        const places = db.places as Place[];
        const index = places.findIndex((p) => p.id === id);
        if (index === -1) throw new NotFoundException(`Place with id "${id}" was not found.`);

        const updated: Place = { ...places[index], ...dto, updatedAt: new Date().toISOString() };
        places[index] = updated;
        db.places = places;
        await this.storage.writeJSONFile(db);
        return updated;
    }

    async remove(id: string): Promise<void> {
        const db = await this.storage.readJSONFile();
        const places = db.places as Place[];
        const place = places.find((p) => p.id === id);
        if (!place) {
            throw new NotFoundException(`Place with id "${id}" was not found.`);
        }

        const reviews = db.reviews as { placeId: string }[];
        const hasReviews = reviews.some((r) => r.placeId === id);
        if (hasReviews) {
          throw new ConflictException(`Place "${id}" cannot be deleted because it still has associated reviews.`);
        }
    
        db.places = places.filter((p) => p.id !== id);
        await this.storage.writeJSONFile(db);
    }

    async patchStats(id: string, stats: { averageRating: number | null; reviewCount: number }): Promise<void> {
        const db = await this.storage.readJSONFile();
        const places = db.places as Place[];
        const index = places.findIndex((p) => p.id === id);
        if (index === -1) return;

        places[index] = { ...places[index], ...stats };
        db.places = places;
        await this.storage.writeJSONFile(db);
    }
}