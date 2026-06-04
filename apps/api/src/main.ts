import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import 'dotenv/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

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

  // CORS — permite que el frontend en localhost:3000 consuma la API
  app.enableCors({
    origin: process.env.FRONTEND_URL ?? 'http://localhost:3000',
  });

  const port = process.env.API_PORT ?? 3001;
  await app.listen(port);
  console.log(` API corriendo en http://localhost:${port}/api`);
}

bootstrap();