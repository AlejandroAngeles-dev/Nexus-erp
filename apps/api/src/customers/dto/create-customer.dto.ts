import { IsString, IsEmail, IsOptional, MinLength } from 'class-validator';

export class CreateCustomerDto {
    @IsString()
    @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
    name!: string;

    @IsOptional()
    @IsEmail({}, { message: 'El correo electrónico no es válido' })
    email?: string;

    @IsOptional()
    @IsString()
    @MinLength(10, { message: 'El número de teléfono debe tener al menos 10 caracteres' })
    phone?: string;

    @IsOptional()
    @IsString()
    rfc!: string;

    @IsOptional()
    @IsString()
    address?: string;

    @IsOptional()
    @IsString()
    notes?: string;


}