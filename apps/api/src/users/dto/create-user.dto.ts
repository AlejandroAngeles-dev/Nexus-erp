import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';

export enum Role {
  ADMIN    = 'ADMIN',
  EMPLOYEE = 'EMPLOYEE',
  VIEWER   = 'VIEWER',
}

export class CreateUserDto {
  @IsString()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsEnum(Role)
  role!: Role;
}