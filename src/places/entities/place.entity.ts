import { PlaceCategoryEnum } from '../enum/place.category.enum.js';
import { PlaceStatusEnum } from '../enum/place.status.enum.js';

export class Place {
  id: string;
  name: string;
  description: string;
  category: PlaceCategoryEnum;
  address: string;
  services: string[];
  status: PlaceStatusEnum;
  averageRating: number | null;
  reviewCount: number;
  createdAt: string;
  updatedAt: string;
}
