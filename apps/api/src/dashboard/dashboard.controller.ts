import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';
import { PrismaService } from '../prisma/prisma.service';

@Controller('dashboard')
@UseGuards(JwtAuthGuard)
export class DashboardController {
  constructor(private prisma: PrismaService) {}

  @Get('metrics')
  async getMetrics(@CurrentUser() user: any) {
    const companyId = user.companyId;

    // Fechas para filtrar el mes actual
    const now            = new Date();
    const startOfMonth   = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(), 0);

    // Ejecutamos todas las queries en paralelo
    const [
      totalCustomers,
      invoicesThisMonth,
      revenueThisMonth,
      revenueLastMonth,
      pendingInvoices,
      activityByDay,
    ] = await Promise.all([

      // Total clientes activos
      this.prisma.customer.count({
        where: { companyId, active: true },
      }),

      // Facturas creadas este mes
      this.prisma.invoice.count({
        where: {
          companyId,
          createdAt: { gte: startOfMonth },
        },
      }),

      // Ingresos del mes actual (solo facturas PAID)
      this.prisma.invoice.aggregate({
        where: {
          companyId,
          status:    'PAID',
          createdAt: { gte: startOfMonth },
        },
        _sum: { total: true },
      }),

      // Ingresos del mes anterior (para calcular % de cambio)
      this.prisma.invoice.aggregate({
        where: {
          companyId,
          status:    'PAID',
          createdAt: { gte: startOfLastMonth, lte: endOfLastMonth },
        },
        _sum: { total: true },
      }),

      // Facturas pendientes de pago
      this.prisma.invoice.count({
        where: { companyId, status: 'PENDING' },
      }),

      // Actividad por día de la semana (últimos 7 días)
      this.prisma.invoice.groupBy({
        by:     ['createdAt'],
        where: {
          companyId,
          createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
        },
        _count: { id: true },
      }),
    ]);

    // Calcular % de cambio en ingresos vs mes anterior
    const currentRevenue  = revenueThisMonth._sum.total ?? 0;
    const previousRevenue = revenueLastMonth._sum.total ?? 0;
    const revenueChange   = previousRevenue > 0
      ? Math.round(((currentRevenue - previousRevenue) / previousRevenue) * 100)
      : 0;

    // Agrupar actividad por día de la semana
    const days = ['DOM', 'LUN', 'MAR', 'MIE', 'JUE', 'VIE', 'SAB'];
    const activity = days.map((day, i) => ({
      day,
      count: activityByDay.filter(a =>
        new Date(a.createdAt).getDay() === i
      ).reduce((sum, a) => sum + a._count.id, 0),
    }));

    return {
      totalCustomers,
      invoicesThisMonth,
      revenueThisMonth:  currentRevenue,
      revenueChange,
      pendingInvoices,
      activity,
    };
  }

  @Get('notifications')
async getNotifications(@CurrentUser() user: any) {
  const companyId = user.companyId;
  const now = new Date();
  const in3Days = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000);
  const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [overdueInvoices, dueSoonInvoices, newCustomers] = await Promise.all([
    // Facturas vencidas
    this.prisma.invoice.findMany({
      where: { companyId, status: 'OVERDUE' },
      include: { customer: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),

    // Facturas que vencen en los próximos 3 días
    this.prisma.invoice.findMany({
      where: {
        companyId,
        status:  'PENDING',
        dueDate: { gte: now, lte: in3Days },
      },
      include: { customer: { select: { name: true } } },
      orderBy: { dueDate: 'asc' },
      take: 5,
    }),

    // Clientes nuevos en las últimas 24 horas
    this.prisma.customer.findMany({
      where: { companyId, createdAt: { gte: last24h } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),
  ]);

  const notifications = [
    ...overdueInvoices.map(inv => ({
      id:      `overdue-${inv.id}`,
      type:    'overdue' as const,
      title:   'Factura vencida',
      message: `${inv.number} de ${inv.customer.name} venció el ${inv.dueDate.toLocaleDateString('es-MX')}`,
      date:    inv.dueDate,
      link:    '/invoices',
    })),
    ...dueSoonInvoices.map(inv => ({
      id:      `duesoon-${inv.id}`,
      type:    'warning' as const,
      title:   'Factura por vencer',
      message: `${inv.number} de ${inv.customer.name} vence el ${inv.dueDate.toLocaleDateString('es-MX')}`,
      date:    inv.dueDate,
      link:    '/invoices',
    })),
    ...newCustomers.map(c => ({
      id:      `customer-${c.id}`,
      type:    'info' as const,
      title:   'Nuevo cliente',
      message: `${c.name} fue agregado a tu cartera de clientes`,
      date:    c.createdAt,
      link:    '/customers',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  return {
    notifications,
    count: notifications.length,
  };
}
}