import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) { }

  async findAll(companyId: string) {
    return this.prisma.user.findMany({
      where: { companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string, companyId: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
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
        name: dto.name,
        email: dto.email,
        password: hashedPassword,
        role: dto.role,
        companyId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
  }

  async update(id: string, dto: UpdateUserDto, companyId: string) {
    await this.findOne(id, companyId);

    return this.prisma.user.update({
      where: { id },
      data: dto,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
        createdAt: true,
      },
    });
  }

  async deactivate(id: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.user.update({
      where: { id },
      data: { active: false },
      select: { id: true, active: true },
    });
  }

  async changePassword(
    id: string,
    companyId: string,
    currentPassword: string,
    newPassword: string,
  ) {
    // Obtenemos el usuario CON el password para verificar
    const user = await this.prisma.user.findFirst({
      where: { id, companyId },
    });

    if (!user) throw new NotFoundException('Usuario no encontrado');

    // Verificamos que la contraseña actual sea correcta
    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) throw new ConflictException('La contraseña actual es incorrecta');

    // Hasheamos la nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await this.prisma.user.update({
      where: { id },
      data: { password: hashedPassword },
    });

    return { message: 'Contraseña actualizada correctamente' };
  }
}