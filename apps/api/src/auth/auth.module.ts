import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './jwt.strategy';
import 'dotenv/config';

@Module({
  imports: [
    PassportModule,

    // Configuramos el módulo JWT con la clave secreta y expiración
    JwtModule.register({
      secret: process.env.JWT_SECRET ?? 'dev-secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,  // Registramos la estrategia para que Passport la conozca
  ],
  exports: [AuthService],  // Exportamos por si otros módulos necesitan AuthService
})
export class AuthModule {}