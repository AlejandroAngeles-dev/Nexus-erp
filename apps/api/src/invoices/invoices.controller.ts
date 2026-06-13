import {
  Controller, Get, Post, Patch, Body,
  Param, Query, UseGuards,
} from '@nestjs/common';
import { InvoicesService } from './invoices.service';
import { CreateInvoiceDto } from './dto/create-invoice.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('invoices')
@UseGuards(JwtAuthGuard)
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) { }

  // POST /api/invoices
  @Post()
  create(
    @Body() dto: CreateInvoiceDto,
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.create(dto, user.id, user.companyId);
  }

  // GET /api/invoices?page=1&limit=10&status=PENDING&search=acme
  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.invoicesService.findAll(
      user.companyId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      status,
      search,
    );
  }

  // GET /api/invoices/summary
  @Get('summary')
  getSummary(@CurrentUser() user: any) {
    return this.invoicesService.getSummary(user.companyId);
  }

  // GET /api/invoices/calendar
  @Get('calendar')
  getPaymentCalendar(@CurrentUser() user: any) {
    return this.invoicesService.getPaymentCalendar(user.companyId);
  }

  // GET /api/invoices/weekly-report
  @Get('weekly-report')
  getWeeklyReport(@CurrentUser() user: any) {
    return this.invoicesService.getWeeklyReport(user.companyId);
  }
  // GET /api/invoices/:id
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.findOne(id, user.companyId);
  }

  // PATCH /api/invoices/:id/status
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body('status') status: string,
    @CurrentUser() user: any,
  ) {
    return this.invoicesService.updateStatus(id, status, user.companyId);
  }
}