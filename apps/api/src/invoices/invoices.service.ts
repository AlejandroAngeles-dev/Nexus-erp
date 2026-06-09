import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateInvoiceDto, userId: string, companyId: string) {
    // Calculamos totales de cada item y el subtotal general
    const items = dto.items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const total    = subtotal + (subtotal * dto.tax / 100);

    // Generamos el número de factura — contamos las facturas existentes de la empresa
    const count = await this.prisma.invoice.count({ where: { companyId } });
    const number = `FAC-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.invoice.create({
      data: {
        number,
        subtotal,
        tax: dto.tax,
        total,
        notes:      dto.notes,
        dueDate:    new Date(dto.dueDate),
        customerId: dto.customerId,
        companyId,
        createdBy:  userId,
        items: {
          create: items, // Prisma crea los items en la misma operación
        },
      },
      include: {
        items:    true,
        customer: true,
      },
    });
  }

  async findAll(
    companyId: string,
    page = 1,
    limit = 10,
    status?: string,
    search?: string,
  ) {
    const where: any = {
      companyId,
      ...(status && { status }),
      ...(search && {
        customer: {
          name: { contains: search, mode: 'insensitive' },
        },
      }),
    };

    const [invoices, total] = await Promise.all([
      this.prisma.invoice.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          customer: { select: { id: true, name: true } },
          items:    true,
        },
      }),
      this.prisma.invoice.count({ where }),
    ]);

    return {
      data: invoices,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, companyId: string) {
    const invoice = await this.prisma.invoice.findFirst({
      where: { id, companyId },
      include: {
        customer: true,
        items:    true,
      },
    });

    if (!invoice) throw new NotFoundException(`Factura ${id} no encontrada`);
    return invoice;
  }

  async updateStatus(id: string, status: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.invoice.update({
      where: { id },
      data:  { status: status as any },
    });
  }
}