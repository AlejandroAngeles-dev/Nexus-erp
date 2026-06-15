import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  // Prefijo global — todos los endpoints quedan bajo /api
  // POST /api/auth/login, GET /api/customers, etc.
  app.setGlobalPrefix('api');

  // ValidationPipe global — valida todos los DTOs automáticamente
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,      // Elimina campos no definidos en el DTO
      forbidNonWhitelisted: true,  // Lanza error si llegan campos extra
      transform: true,      // Convierte el JSON en instancias de las clases DTO
    }),
  );


  const port = process.env.PORT ?? process.env.API_PORT ?? 3001;
  await app.listen(port);
}

bootstrap();  