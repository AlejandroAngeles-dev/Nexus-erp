import { IsString, IsEnum, IsOptional, IsBoolean } from 'class-validator';
import { Role } from './create-user.dto';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsBoolean()
  active?: boolean;
}