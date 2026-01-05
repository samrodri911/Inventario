import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // 1. Crear la aplicación NestJS
  const app = await NestFactory.create(AppModule);

  // 2. CORS - Permitir conexiones del frontend
  app.enableCors({
    origin:  [
    'https://inventario-blush-two.vercel.app',
    'https://inventario-f16qgw6l2-samuels-projects-ecd2d119.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000',
  ],
    credentials: true,
  });

  // 3. Validaciones globales
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
  }));

  // 4. Iniciar servidor
  const port = process.env.PORT || 3000;
  await app.listen(port);
  
  console.log(`🚀 Servidor corriendo en http://localhost:${port}`);
  console.log(`🌐 CORS habilitado para: ${process.env.FRONTEND_URL || 'http://localhost:3001'}`);
}

bootstrap();