import {
  BadRequestException,
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseIntPipe,
  DefaultValuePipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UsersService } from '../services/users.service';
import { CreateUserDto } from '../dtos/create-user.dto';
import { UpdateUserDto } from '../dtos/update-user.dto';
import { Public, AdminOnly } from '../../../common/decorators/authorization.decorator';
import { CurrentUser } from '../../../common/decorators/current-user.decorator';
import { ApiPaginationQuery } from '../../../common/decorators/api-pagination.decorator';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get my profile (current user)' })
  async getMe(@CurrentUser('userId') userId: string) {
    const user = await this.usersService.findUserById(userId);
    const { passwordHash: _, ...rest } = user;
    return { data: rest };
  }

  @Delete('me')
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete my account (current user)' })
  async deleteAccount(@CurrentUser('userId') userId: string) {
    await this.usersService.deleteUser(userId);
    return { message: 'Account deleted' };
  }

  @Post()
  @AdminOnly()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create user (Admin only)' })
  async create(@Body() dto: CreateUserDto) {
    if (!dto.password) throw new BadRequestException('Password is required');
    const user = await this.usersService.createUser(dto);
    return { message: 'User created', data: user };
  }

  @Get()
  @AdminOnly()
  @ApiBearerAuth()
  @ApiPaginationQuery()
  @ApiOperation({ summary: 'List users (Admin only)' })
  async findAll(
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number,
  ) {
    const skip = (page - 1) * limit;
    const { users, total } = await this.usersService.findAll(skip, limit);
    const data = users.map((u) => {
      const { passwordHash: _, ...rest } = u;
      return rest;
    });
    return {
      data,
      meta: {
        totalCount: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        limit,
        results: data.length,
      },
    };
  }

  @Get(':id')
  @AdminOnly()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findUserById(id);
    const { passwordHash: _, ...rest } = user;
    return { data: rest };
  }

  @Patch(':id')
  @AdminOnly()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  async update(@Param('id') id: string, @Body() dto: UpdateUserDto) {
    const user = await this.usersService.updateUser(id, dto);
    const { passwordHash: _, ...rest } = user;
    return { message: 'User updated', data: rest };
  }

  @Patch(':id/ban')
  @AdminOnly()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Ban/unban user (Admin only)' })
  async ban(@Param('id') id: string, @Body('banned') banned: boolean) {
    const user = await this.usersService.updateBan(id, banned);
    const { passwordHash: _, ...rest } = user;
    return { message: banned ? 'User banned' : 'User unbanned', data: rest };
  }

  @Patch(':id/role')
  @AdminOnly()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user role (Admin only)' })
  async updateRole(
    @Param('id') id: string,
    @Body('role') role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN',
  ) {
    const user = await this.usersService.updateRole(id, role);
    const { passwordHash: _, ...rest } = user;
    return { message: 'Role updated', data: rest };
  }

  @Delete(':id')
  @AdminOnly()
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user' })
  async remove(@Param('id') id: string) {
    await this.usersService.deleteUser(id);
    return { message: 'User deleted' };
  }
}
