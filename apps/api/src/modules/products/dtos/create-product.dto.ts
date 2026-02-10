import { IsString, IsOptional, IsBoolean, IsArray, ValidateNested, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateProductVariantDto {
  @ApiProperty()
  @IsString()
  sku: string;

  @ApiProperty()
  @Min(0)
  price: number;

  @ApiPropertyOptional()
  @IsOptional()
  @Min(0)
  comparePrice?: number;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Min(0)
  stock?: number;

  @ApiPropertyOptional({ example: { size: 'M', color: 'Blue' } })
  @IsOptional()
  attributes?: Record<string, string>;
}

export class CreateProductDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty()
  @IsString()
  categoryId: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  brand?: string;

  @ApiPropertyOptional({ default: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @ApiProperty({ type: [CreateProductVariantDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateProductVariantDto)
  variants: CreateProductVariantDto[];
}
