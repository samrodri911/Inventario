import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  
  // Se ejecuta cuando NestJS inicia
  async onModuleInit() {
    await this.$connect();
    console.log('✅ Conectado a la base de datos');
  }

  // Se ejecuta cuando NestJS se cierra
  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Desconectado de la base de datos');
  }
}