import {
  IsString, IsNumber, IsDateString, IsOptional,
  IsArray, ValidateNested, Min, IsEnum
} from 'class-validator';
import { Type } from 'class-transformer';

export class InvoiceItemDto {
  @IsString()
  description!: string;

  @IsNumber()
  @Min(1)
  quantity!: number;

  @IsNumber()
  @Min(0)
  unitPrice!: number;
}

export class CreateInvoiceDto {
  @IsString()
  customerId!: string;

  @IsDateString()
  dueDate!: string;

  @IsNumber()
  @Min(0)
  tax!: number;

  @IsOptional()
  @IsString()
  notes?: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InvoiceItemDto)
  items!: InvoiceItemDto[];
}