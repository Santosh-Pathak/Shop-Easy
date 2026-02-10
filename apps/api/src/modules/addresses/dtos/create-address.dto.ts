import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum AddressTypeEnum {
  SHIPPING = 'SHIPPING',
  BILLING = 'BILLING',
}

export class CreateAddressDto {
  @ApiProperty({ enum: AddressTypeEnum })
  @IsEnum(AddressTypeEnum)
  type: AddressTypeEnum;

  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  state?: string;

  @ApiProperty()
  @IsString()
  country: string;

  @ApiProperty({ description: 'Postal / ZIP code' })
  @IsString()
  postalCode: string;

  @ApiPropertyOptional({ default: false })
  @IsOptional()
  isDefault?: boolean;
}
