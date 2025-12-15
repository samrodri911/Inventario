import { Controller, Get, Post, Body, Param, Query, UseGuards, ParseIntPipe } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('stock-movements')
@UseGuards(JwtAuthGuard)
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Post()
  create(
    @CurrentUser() user: any,
    @Body() createStockMovementDto: CreateStockMovementDto
  ) {
    return this.stockMovementsService.create(user.id, createStockMovementDto);
  }

  @Get()
  findAll(
    @Query('itemId') itemId?: string,
    @Query('userId') userId?: string,
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const filters: any = {};

    if (itemId) filters.itemId = parseInt(itemId);
    if (userId) filters.userId = parseInt(userId);
    if (type) filters.type = type;
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.stockMovementsService.findAll(filters);
  }

  @Get('stats')
  getStats(
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string
  ) {
    const filters: any = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);

    return this.stockMovementsService.getStats(filters);
  }

  @Get('by-item/:itemId')
  findByItem(@Param('itemId', ParseIntPipe) itemId: number) {
    return this.stockMovementsService.findByItem(itemId);
  }

  @Get('my-movements')
  findMyMovements(@CurrentUser() user: any) {
    return this.stockMovementsService.findByUser(user.id);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stockMovementsService.findOne(id);
  }
}