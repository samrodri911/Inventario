import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateStockMovementDto } from './dto/create-stock-movement.dto';

@Injectable()
export class StockMovementsService {
  constructor(private prisma: PrismaService) {}

  // Crear movimiento de stock
  async create(userId: number, createStockMovementDto: CreateStockMovementDto) {
    const { itemId, type, quantity, reason } = createStockMovementDto;

    // Verificar que el item existe
    const item = await this.prisma.item.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      throw new NotFoundException('Producto no encontrado');
    }

    // Si es salida (OUT), verificar que hay suficiente stock
    if (type === 'OUT') {
      if (item.currentStock < quantity) {
        throw new BadRequestException(
          `Stock insuficiente. Stock actual: ${item.currentStock}, solicitado: ${quantity}`
        );
      }
    }

    // Calcular nuevo stock
    const newStock = type === 'IN' 
      ? item.currentStock + quantity  // Entrada: suma
      : item.currentStock - quantity; // Salida: resta

    // Usar transacción para mantener consistencia
    const result = await this.prisma.$transaction(async (prisma) => {
      // 1. Crear el movimiento
      const movement = await prisma.stockMovement.create({
        data: {
          itemId,
          userId,
          type,
          quantity,
          reason
        },
        include: {
          item: {
            include: { category: true }
          },
          user: {
            select: {
              id: true,
              displayName: true,
              email: true
            }
          }
        }
      });

      // 2. Actualizar el stock del item
      await prisma.item.update({
        where: { id: itemId },
        data: { currentStock: newStock }
      });

      return movement;
    });

    return result;
  }

  // Listar todos los movimientos
  async findAll(filters?: {
    itemId?: number;
    userId?: number;
    type?: string;
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.itemId) where.itemId = filters.itemId;
    if (filters?.userId) where.userId = filters.userId;
    if (filters?.type) where.type = filters.type;
    
    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    return await this.prisma.stockMovement.findMany({
      where,
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true,
            currentStock: true
          }
        },
        user: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Ver movimientos de un producto específico
  async findByItem(itemId: number) {
    // Verificar que el item existe
    const item = await this.prisma.item.findUnique({
      where: { id: itemId }
    });

    if (!item) {
      throw new NotFoundException('Producto no encontrado');
    }

    return await this.prisma.stockMovement.findMany({
      where: { itemId },
      include: {
        user: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Ver movimientos de un usuario específico
  async findByUser(userId: number) {
    return await this.prisma.stockMovement.findMany({
      where: { userId },
      include: {
        item: {
          select: {
            id: true,
            name: true,
            sku: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // Ver un movimiento específico
  async findOne(id: number) {
    const movement = await this.prisma.stockMovement.findUnique({
      where: { id },
      include: {
        item: {
          include: { category: true }
        },
        user: {
          select: {
            id: true,
            displayName: true,
            email: true
          }
        }
      }
    });

    if (!movement) {
      throw new NotFoundException('Movimiento no encontrado');
    }

    return movement;
  }

  // Obtener resumen de movimientos
  async getStats(filters?: {
    startDate?: Date;
    endDate?: Date;
  }) {
    const where: any = {};

    if (filters?.startDate || filters?.endDate) {
      where.createdAt = {};
      if (filters.startDate) where.createdAt.gte = filters.startDate;
      if (filters.endDate) where.createdAt.lte = filters.endDate;
    }

    const [totalMovements, entriesStats, exitsStats] = await Promise.all([
      // Total de movimientos
      this.prisma.stockMovement.count({ where }),

      // Estadísticas de entradas
      this.prisma.stockMovement.aggregate({
        where: { ...where, type: 'IN' },
        _sum: { quantity: true },
        _count: true
      }),

      // Estadísticas de salidas
      this.prisma.stockMovement.aggregate({
        where: { ...where, type: 'OUT' },
        _sum: { quantity: true },
        _count: true
      })
    ]);

    return {
      totalMovements,
      entries: {
        count: entriesStats._count,
        totalQuantity: entriesStats._sum.quantity || 0
      },
      exits: {
        count: exitsStats._count,
        totalQuantity: exitsStats._sum.quantity || 0
      },
      netChange: (entriesStats._sum.quantity || 0) - (exitsStats._sum.quantity || 0)
    };
  }
}