import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAddressDto } from './dtos/create-address.dto';
import { UpdateAddressDto } from './dtos/update-address.dto';
import { AddressType } from '@prisma/client';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.address.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  async findOne(id: string, userId: string) {
    const address = await this.prisma.address.findUnique({ where: { id } });
    if (!address) throw new NotFoundException('Address not found');
    if (address.userId !== userId) throw new ForbiddenException('Not your address');
    return address;
  }

  async create(userId: string, dto: CreateAddressDto) {
    if (dto.isDefault) await this.clearDefaultForUser(userId);
    return this.prisma.address.create({
      data: {
        userId,
        type: dto.type as AddressType,
        street: dto.street,
        city: dto.city,
        state: dto.state ?? null,
        country: dto.country,
        postalCode: dto.postalCode,
        isDefault: dto.isDefault ?? false,
      },
    });
  }

  async update(id: string, userId: string, dto: UpdateAddressDto) {
    await this.findOne(id, userId);
    if (dto.isDefault) await this.clearDefaultForUser(userId);
    return this.prisma.address.update({
      where: { id },
      data: {
        ...(dto.type !== undefined && { type: dto.type as AddressType }),
        ...(dto.street !== undefined && { street: dto.street }),
        ...(dto.city !== undefined && { city: dto.city }),
        ...(dto.state !== undefined && { state: dto.state }),
        ...(dto.country !== undefined && { country: dto.country }),
        ...(dto.postalCode !== undefined && { postalCode: dto.postalCode }),
        ...(dto.isDefault !== undefined && { isDefault: dto.isDefault }),
      },
    });
  }

  async remove(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.prisma.address.delete({ where: { id } });
    return { message: 'Address deleted' };
  }

  async setDefault(id: string, userId: string) {
    await this.findOne(id, userId);
    await this.clearDefaultForUser(userId);
    await this.prisma.address.update({
      where: { id },
      data: { isDefault: true },
    });
    return this.prisma.address.findUnique({ where: { id } });
  }

  private async clearDefaultForUser(userId: string) {
    await this.prisma.address.updateMany({
      where: { userId },
      data: { isDefault: false },
    });
  }
}
