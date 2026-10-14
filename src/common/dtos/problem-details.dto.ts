import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class ProblemDetails {
  @ApiProperty({ example: 'https://campusrate.example/errors/not-found' })
  type!: string;

  @ApiProperty({ example: 'https://campusrate.example/errors/not-found' })
  title!: string;

  @ApiProperty({ example: 404 })
  status!: number;

  @ApiProperty({ example: 'Place with ID plc_ABC123 not found' })
  detail!: string;

  @ApiProperty({ example: '/api/v1/places/plc_ABC123' })
  instance!: string;
  
  @ApiPropertyOptional({
    type: [String],
    example: ['name must be longer than or equal to 3 characters'],
  })
  errors?: string[];
}

