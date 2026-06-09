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
}