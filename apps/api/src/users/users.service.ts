import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findAll(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        active:    true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        active:    true,
        createdAt: true,
      },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');
    return user;
  }

  async create(dto: CreateUserDto, companyId: string) {
    // Verificar que el email no exista
    const existing = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existing) throw new ConflictException('Ya existe un usuario con ese email');

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    return this.prisma.user.create({
      data: {
        name:      dto.name,
        email:     dto.email,
        password:  hashedPassword,
        role:      dto.role,
        companyId,
      },
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        active:    true,
        createdAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.user.update({
      where: { id },
      data:  dto,
      select: {
        id:        true,
        name:      true,
        email:     true,
        role:      true,
        active:    true,
        createdAt: true,
      },
    });
  }

  async deactivate(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.user.update({
      where: { id },
      data:  { active: false },
      select: { id: true, active: true },
    });
  }
}