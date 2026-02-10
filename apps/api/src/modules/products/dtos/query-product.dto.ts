import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { CONSTANTS } from '../../../common/constants';

export class QueryProductDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: CONSTANTS.DEFAULT_PAGE_SIZE, maximum: CONSTANTS.MAX_PAGE_SIZE })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(CONSTANTS.MAX_PAGE_SIZE)
  limit?: number = CONSTANTS.DEFAULT_PAGE_SIZE;

  @ApiPropertyOptional({ description: 'Filter by category slug or id' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Search in name, description, brand' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ enum: ['price-asc', 'price-desc', 'newest', 'name'] })
  @IsOptional()
  @IsString()
  sort?: string;

  @ApiPropertyOptional({ description: 'Filter active only', default: true })
  @IsOptional()
  @Type(() => Boolean)
  isActive?: boolean = true;
}
