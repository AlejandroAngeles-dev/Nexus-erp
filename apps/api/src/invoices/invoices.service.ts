import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) { }

  async create(dto: CreateInvoiceDto, userId: string, companyId: string) {
    // Calculamos totales de cada item y el subtotal general
    const items = dto.items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));

    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const total = subtotal + (subtotal * dto.tax / 100);

    // Generamos el número de factura — contamos las facturas existentes de la empresa
    const count = await this.prisma.invoice.count({ where: { companyId } });
    const number = `FAC-${String(count + 1).padStart(4, '0')}`;

    return this.prisma.invoice.create({
      data: {
        number,
        subtotal,
        tax: dto.tax,
        total,
        notes: dto.notes,
        dueDate: new Date(dto.dueDate),
        customerId: dto.customerId,
        companyId,
        createdBy: userId,
        items: {
          create: items, // Prisma crea los items en la misma operación
        },
      },
      include: {
        items: true,
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
          items: true,
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
        items: true,
      },
    });

    if (!invoice) throw new NotFoundException(`Factura ${id} no encontrada`);
    return invoice;
  }

  async updateStatus(id: string, status: string, companyId: string) {
    await this.findOne(id, companyId);
    return this.prisma.invoice.update({
      where: { id },
      data: { status: status as any },
    });
  }

  async getSummary(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
      totalThisMonth,
      totalLastMonth,
      paidThisMonth,
      paidLastMonth,
      pendingAmount,
      overdueAmount,
      pendingCount,
    ] = await Promise.all([
      // Total facturado este mes
      this.prisma.invoice.aggregate({
        where: { companyId, createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      // Total facturado mes anterior
      this.prisma.invoice.aggregate({
        where: { companyId, createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { total: true },
      }),
      // Pagado este mes
      this.prisma.invoice.aggregate({
        where: { companyId, status: 'PAID', createdAt: { gte: startOfMonth } },
        _sum: { total: true },
      }),
      // Pagado mes anterior
      this.prisma.invoice.aggregate({
        where: { companyId, status: 'PAID', createdAt: { gte: startOfLastMonth, lte: endOfLastMonth } },
        _sum: { total: true },
      }),
      // Monto pendiente
      this.prisma.invoice.aggregate({
        where: { companyId, status: 'PENDING' },
        _sum: { total: true },
      }),
      // Monto vencido
      this.prisma.invoice.aggregate({
        where: { companyId, status: 'OVERDUE' },
        _sum: { total: true },
      }),
      // Cantidad de facturas pendientes
      this.prisma.invoice.count({
        where: { companyId, status: 'PENDING' },
      }),
    ]);

    const calcChange = (current: number, previous: number) =>
      previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;

    const currentTotal = totalThisMonth._sum.total ?? 0;
    const previousTotal = totalLastMonth._sum.total ?? 0;
    const currentPaid = paidThisMonth._sum.total ?? 0;
    const previousPaid = paidLastMonth._sum.total ?? 0;

    return {
      totalAmount: currentTotal,
      totalChange: calcChange(currentTotal, previousTotal),
      paidAmount: currentPaid,
      paidChange: calcChange(currentPaid, previousPaid),
      pendingAmount: pendingAmount._sum.total ?? 0,
      pendingCount,
      overdueAmount: overdueAmount._sum.total ?? 0,
    };


  }

  async getPaymentCalendar(companyId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 2, 0);

    const invoices = await this.prisma.invoice.findMany({
      where: {
        companyId,
        status: { in: ['PENDING', 'OVERDUE'] },
        dueDate: { gte: startOfMonth, lte: endOfMonth },
      },
      include: {
        customer: { select: { id: true, name: true } },
      },
      orderBy: { dueDate: 'asc' },
    });

    // Agrupamos por fecha de vencimiento
    const grouped = invoices.reduce((acc, inv) => {
      const dateKey = inv.dueDate.toISOString().slice(0, 10);
      if (!acc[dateKey]) acc[dateKey] = [];
      acc[dateKey].push(inv);
      return acc;
    }, {} as Record<string, typeof invoices>);

    return {
      invoices,
      grouped,
      totalPending: invoices.reduce((sum, inv) => sum + inv.total, 0),
      count: invoices.length,
    };
  }

  async getWeeklyReport(companyId: string) {
    const now = new Date();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    startOfWeek.setHours(0, 0, 0, 0);

    const startOfLastWeek = new Date(startOfWeek);
    startOfLastWeek.setDate(startOfWeek.getDate() - 7);

    const endOfLastWeek = new Date(startOfWeek);
    endOfLastWeek.setMilliseconds(-1);

    const [
      invoicesThisWeek,
      invoicesLastWeek,
      paidThisWeek,
      paidLastWeek,
      newCustomersThisWeek,
      topCustomers,
    ] = await Promise.all([

      // Facturas creadas esta semana
      this.prisma.invoice.findMany({
        where: {
          companyId,
          createdAt: { gte: startOfWeek },
        },
        include: { customer: { select: { id: true, name: true } } },
        orderBy: { createdAt: 'desc' },
      }),

      // Facturas semana anterior
      this.prisma.invoice.aggregate({
        where: {
          companyId,
          createdAt: { gte: startOfLastWeek, lte: endOfLastWeek },
        },
        _count: { id: true },
        _sum: { total: true },
      }),

      // Pagadas esta semana
      this.prisma.invoice.aggregate({
        where: {
          companyId,
          status: 'PAID',
          updatedAt: { gte: startOfWeek },
        },
        _count: { id: true },
        _sum: { total: true },
      }),

      // Pagadas semana anterior
      this.prisma.invoice.aggregate({
        where: {
          companyId,
          status: 'PAID',
          updatedAt: { gte: startOfLastWeek, lte: endOfLastWeek },
        },
        _count: { id: true },
        _sum: { total: true },
      }),

      // Clientes nuevos esta semana
      this.prisma.customer.count({
        where: {
          companyId,
          createdAt: { gte: startOfWeek },
        },
      }),

      // Top 5 clientes por facturación esta semana
      this.prisma.invoice.groupBy({
        by: ['customerId'],
        where: {
          companyId,
          createdAt: { gte: startOfWeek },
        },
        _sum: { total: true },
        _count: { id: true },
        orderBy: { _sum: { total: 'desc' } },
        take: 5,
      }),
    ]);

    // Resolver nombres de los top clientes
    const topCustomerIds = topCustomers.map(c => c.customerId);
    const customerNames = await this.prisma.customer.findMany({
      where: { id: { in: topCustomerIds } },
      select: { id: true, name: true },
    });

    const topCustomersWithNames = topCustomers.map(c => ({
      name: customerNames.find(n => n.id === c.customerId)?.name ?? 'Desconocido',
      totalAmount: c._sum.total ?? 0,
      invoiceCount: c._count.id,
    }));

    const calcChange = (current: number, previous: number) =>
      previous > 0 ? Math.round(((current - previous) / previous) * 100) : 0;

    const thisWeekTotal = invoicesThisWeek.reduce((s, i) => s + i.total, 0);
    const lastWeekTotal = invoicesLastWeek._sum.total ?? 0;
    const thisWeekPaid = paidThisWeek._sum.total ?? 0;
    const lastWeekPaid = paidLastWeek._sum.total ?? 0;

    return {
      period: {
        start: startOfWeek.toISOString(),
        end: now.toISOString(),
      },
      invoices: {
        thisWeek: invoicesThisWeek,
        count: invoicesThisWeek.length,
        total: thisWeekTotal,
        change: calcChange(thisWeekTotal, lastWeekTotal),
      },
      paid: {
        count: paidThisWeek._count.id,
        total: thisWeekPaid,
        change: calcChange(thisWeekPaid, lastWeekPaid),
      },
      newCustomers: newCustomersThisWeek,
      topCustomers: topCustomersWithNames,
    };
  }
}