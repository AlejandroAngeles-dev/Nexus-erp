import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    // 1. Verificar que el email de la empresa no exista ya
    const existingCompany = await this.prisma.company.findUnique({
      where: { email: dto.companyEmail },
    });

    if (existingCompany) {
      throw new ConflictException('Ya existe una empresa registrada con ese email');
    }

    // 2. Verificar que el email del admin no exista ya
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.adminEmail },
    });

    if (existingUser) {
      throw new ConflictException('Ya existe un usuario registrado con ese email');
    }

    // 3. Hashear la contraseña — NUNCA guardamos texto plano
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    // 4. Crear empresa y usuario en una sola transacción
    const result = await this.prisma.$transaction(async (tx) => {
      const company = await tx.company.create({
        data: {
          name: dto.companyName,
          email: dto.companyEmail,
          rfc: dto.companyRfc,
        },
      });

      const user = await tx.user.create({
        data: {
          name: dto.adminName,
          email: dto.adminEmail,
          password: hashedPassword,
          role: 'ADMIN',
          companyId: company.id,
        },
      });

      return { company, user };
    });

    // 5. Generar JWT para que el usuario quede logueado inmediatamente
    const token = this.generateToken(result.user);

    return {
      message: 'Empresa registrada exitosamente',
      token,
      user: {
        id: result.user.id,
        name: result.user.name,
        email: result.user.email,
        role: result.user.role,
      },
    };
  }

  async login(dto: LoginDto) {
    // 1. Buscar usuario por email
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
      include: { company: true },
    });

    // 2. Si no existe o está inactivo, error genérico
    // IMPORTANTE: no decimos si el email existe o no — es una medida de seguridad
    if (!user || !user.active) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 3. Comparar password con el hash guardado en la DB
    const passwordValid = await bcrypt.compare(dto.password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException('Credenciales incorrectas');
    }

    // 4. Generar y retornar JWT
    const token = this.generateToken(user);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company.name,
      },
    };
  }

  private generateToken(user: { id: string; email: string; role: string }) {
    // El payload es la información que viaja DENTRO del JWT
    // No incluyas datos sensibles aquí — el JWT es legible (solo firmado, no encriptado)
    const payload = {
      sub: user.id,      // "sub" es el estándar JWT para el ID del usuario
      email: user.email,
      role: user.role,
    };

    return this.jwtService.sign(payload);
  }
}