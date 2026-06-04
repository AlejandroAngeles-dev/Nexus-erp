import {
  Controller, Get, Post, Patch, Delete,
  Body, Param, Query, UseGuards,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { JwtAuthGuard } from '../auth/jwt.guard';
import { CurrentUser } from '../common/current-user.decorator';

@Controller('customers')
@UseGuards(JwtAuthGuard) // Protege TODOS los endpoints de este controlador
export class CustomersController {
  constructor(private customersService: CustomersService) {}

  // POST /api/customers
  @Post()
  create(
    @Body() dto: CreateCustomerDto,
    @CurrentUser() user: any,
  ) {
    return this.customersService.create(dto, user.id, user.companyId);
  }

  // GET /api/customers?page=1&limit=10&search=acme
  @Get()
  findAll(
    @CurrentUser() user: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
  ) {
    return this.customersService.findAll(
      user.companyId,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 10,
      search,
    );
  }

  // GET /api/customers/:id
  @Get(':id')
  findOne(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.customersService.findOne(id, user.companyId);
  }

  // PATCH /api/customers/:id
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateCustomerDto,
    @CurrentUser() user: any,
  ) {
    return this.customersService.update(id, dto, user.companyId);
  }

  // DELETE /api/customers/:id
  @Delete(':id')
  remove(
    @Param('id') id: string,
    @CurrentUser() user: any,
  ) {
    return this.customersService.remove(id, user.companyId);
  }
}