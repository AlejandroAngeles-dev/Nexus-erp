import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, UseGuards,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) { }

  // GET /api/users
  @Get()
  findAll(@CurrentUser() user: any) {
    return this.usersService.findAll(user.companyId);
  }


  // GET /api/users/me
  @Get('me')
  getMe(@CurrentUser() user: any) {
    return this.usersService.findOne(user.id, user.companyId);
  }

  // PATCH /api/users/me
  @Patch('me')
  updateMe(
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.update(user.id, dto, user.companyId);
  }


  // PATCH /api/users/me/password
  @Patch('me/password')
  changePassword(
    @Body() body: { currentPassword: string; newPassword: string },
    @CurrentUser() user: any,
  ) {
    return this.usersService.changePassword(
      user.id,
      user.companyId,
      body.currentPassword,
      body.newPassword,
    );
  }


  // GET /api/users/:id
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.findOne(id, user.companyId);
  }

  // POST /api/users
  @Post()
  create(
    @Body() dto: CreateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.create(dto, user.companyId);
  }

  // PATCH /api/users/:id
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() user: any,
  ) {
    return this.usersService.update(id, dto, user.companyId);
  }

  // DELETE /api/users/:id
  @Delete(':id')
  deactivate(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.usersService.deactivate(id, user.companyId);
  }
}