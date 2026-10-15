import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ProblemDetails {
  @ApiProperty({
    example: 'https://campusrate.example/errors/validation-failed',
  })
  type!: string;

  @ApiProperty({ example: 'Validation failed' })
  title!: string;

  @ApiProperty({ example: 400 })
  status!: number;

  @ApiProperty({ example: 'The request contains invalid data.' })
  detail!: string;

  @ApiProperty({ example: '/api/v1/places' })
  instance!: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['name must be longer than or equal to 3 characters'],
  })
  errors?: string[];
}
