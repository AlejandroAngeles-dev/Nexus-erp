import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCustomerDto, userId: string, companyId: string) {
    return this.prisma.customer.create({
      data: {
        ...dto,
        companyId,
        createdBy: userId,
      },
    });
  }

  async findAll(
    companyId: string,
    page: number = 1,
    limit: number = 10,
    search?: string,
  ) {
    // Construimos el filtro dinámicamente
    // Si viene "search", busca en nombre, email y RFC al mismo tiempo
    const where = {
      companyId,
      active: true,
      ...(search && {
        OR: [
          { name:  { contains: search, mode: 'insensitive' as const } },
          { email: { contains: search, mode: 'insensitive' as const } },
          { rfc:   { contains: search, mode: 'insensitive' as const } },
        ],
      }),
    };

    // Ejecutamos dos queries en paralelo con Promise.all
    // Una para los datos, otra para el total — más eficiente que dos awaits separados
    const [customers, total] = await Promise.all([
      this.prisma.customer.findMany({
        where,
        skip: (page - 1) * limit,   // Paginación: saltamos los registros anteriores
        take: limit,                  // Tomamos solo "limit" registros
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count({ where }),
    ]);

    return {
      data: customers,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string) {
    const customer = await this.prisma.customer.findFirst({
      where: {
        id,
        companyId, // Seguridad: un cliente solo es visible para su propia empresa
        active: true,
      },
    });

    if (!customer) {
      throw new NotFoundException(`Cliente con ID ${id} no encontrado`);
    }

    return customer;
  }

  async update(id: string, dto: UpdateCustomerDto, companyId: string) {
    // Verificamos que el cliente existe y pertenece a esta empresa
    await this.findOne(id, companyId);

    return this.prisma.customer.update({
      where: { id },
      data: dto,
    });
  }

  async remove(id: string, companyId: string) {
    // Verificamos que existe
    await this.findOne(id, companyId);

    // Soft delete: marcamos como inactivo en lugar de borrar
    return this.prisma.customer.update({
      where: { id },
      data: { active: false },
    });
  }
}