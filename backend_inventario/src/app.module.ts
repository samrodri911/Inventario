import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from 'prisma/prisma.module'; 
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { ItemsModule } from './items/items.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';

@Module({
  imports: [PrismaModule, UsersModule, AuthModule, CategoriesModule, ItemsModule, StockMovementsModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
