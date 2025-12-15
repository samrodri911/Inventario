import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, ParseIntPipe, Query } from '@nestjs/common';
import { ItemsService } from './items.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('items')
@UseGuards(JwtAuthGuard)
export class ItemsController {
  constructor(private readonly itemsService: ItemsService) {}

  @Post()
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemsService.create(createItemDto);
  }

  @Get()
  findAll(@Query('categoryId') categoryId?: string, @Query('name') name?: string) {
    // Si viene name en query, buscar por nombre
    if (name) {
      return this.itemsService.findByName(name);
    }
    // Si viene categoryId en query, filtrar por categoría
    if (categoryId) {
      return this.itemsService.findByCategory(parseInt(categoryId));
    }
    return this.itemsService.findAll();
  }

  @Get('stats')
  getStats() {
    return this.itemsService.getStats();
  }

  @Get('low-stock')
  findLowStock() {
    return this.itemsService.findLowStock();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateItemDto: UpdateItemDto
  ) {
    return this.itemsService.update(id, updateItemDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.itemsService.remove(id);
  }
}