import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../../prisma/prisma.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(dto: CreateUserDto & { password?: string; passwordHash?: string }) {
    if (!dto.passwordHash && !dto.password) {
      throw new BadRequestException('password or passwordHash is required');
    }
    const passwordHash =
      dto.passwordHash ?? (dto.password ? await bcrypt.hash(dto.password, 10) : undefined);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email.toLowerCase(),
        passwordHash: passwordHash ?? null,
        role: ((dto.role ?? 'CUSTOMER') as 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN'),
      },
      include: { profile: true },
    });
    if ((dto.firstName || dto.lastName) && user) {
      await this.prisma.profile.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
        update: {
          firstName: dto.firstName ?? undefined,
          lastName: dto.lastName ?? undefined,
        },
      });
    }
    return this.prisma.user.findUnique({
      where: { id: user.id },
      include: { profile: true },
    });
  }

  async findUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string, includePassword = false) {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });
    if (!user) return null;
    if (!includePassword) {
      const { passwordHash: _, ...rest } = user;
      return rest;
    }
    return user;
  }

  async updateUser(id: string, dto: UpdateUserDto & { lastLogin?: Date }) {
    await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email?.toLowerCase(),
        emailVerified: dto.emailVerified,
      },
    });
    const profile = await this.prisma.profile.findUnique({ where: { userId: id } });
    if (profile || dto.firstName || dto.lastName || dto.phone || dto.avatar) {
      await this.prisma.profile.upsert({
        where: { userId: id },
        create: {
          userId: id,
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          avatar: dto.avatar,
        },
        update: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          avatar: dto.avatar,
        },
      });
    }
    return this.findUserById(id);
  }

  async deleteUser(id: string): Promise<void> {
    await this.prisma.user.delete({ where: { id } });
  }

  async updatePasswordHash(id: string, passwordHash: string) {
    await this.prisma.user.update({
      where: { id },
      data: { passwordHash },
    });
  }

  async updateBan(id: string, banned: boolean) {
    await this.findUserById(id);
    await this.prisma.user.update({
      where: { id },
      data: { banned },
    });
    return this.findUserById(id);
  }

  async updateRole(id: string, role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN') {
    await this.findUserById(id);
    await this.prisma.user.update({
      where: { id },
      data: { role },
    });
    return this.findUserById(id);
  }

  async findAll(skip: number, take: number) {
    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        skip,
        take,
        include: { profile: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count(),
    ]);
    return { users, total };
  }
}
