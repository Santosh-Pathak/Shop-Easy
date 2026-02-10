import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UpdateAddressDto } from './dtos/update-address.dto';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('addresses')
@Controller('addresses')
@ApiBearerAuth()
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get()
  @ApiOperation({ summary: 'List my addresses' })
  async list(@CurrentUser('userId') userId: string) {
    const data = await this.addressesService.findAll(userId);
    return { data };
  }

  @Post()
  @ApiOperation({ summary: 'Create address' })
  async create(@CurrentUser('userId') userId: string, @Body() dto: CreateAddressDto) {
    const address = await this.addressesService.create(userId, dto);
    return { message: 'Address created', data: address };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get address by ID' })
  async findOne(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    const data = await this.addressesService.findOne(id, userId);
    return { data };
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update address' })
  async update(
    @Param('id') id: string,
    @CurrentUser('userId') userId: string,
    @Body() dto: UpdateAddressDto,
  ) {
    const data = await this.addressesService.update(id, userId, dto);
    return { message: 'Address updated', data };
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete address' })
  async remove(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    return this.addressesService.remove(id, userId);
  }

  @Patch(':id/set-default')
  @ApiOperation({ summary: 'Set address as default' })
  async setDefault(@Param('id') id: string, @CurrentUser('userId') userId: string) {
    const data = await this.addressesService.setDefault(id, userId);
    return { message: 'Default address updated', data };
  }
}
