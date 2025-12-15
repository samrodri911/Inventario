import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateItemDto } from './dto/create-item.dto';
import { UpdateItemDto } from './dto/update-item.dto';

@Injectable()
export class ItemsService {
  constructor(private prisma: PrismaService) {}

  // Crear item
  async create(createItemDto: CreateItemDto) {
    // Si hay SKU, verificar que no exista
    if (createItemDto.sku) {
      const skuExists = await this.prisma.item.findUnique({
        where: { sku: createItemDto.sku }
      });

      if (skuExists) {
        throw new ConflictException('Ya existe un producto con ese SKU');
      }
    }

    // Si hay categoryId, verificar que la categoría existe
    if (createItemDto.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: createItemDto.categoryId }
      });

      if (!categoryExists) {
        throw new BadRequestException('La categoría especificada no existe');
      }
    }

    return await this.prisma.item.create({
      data: createItemDto,
      include: {
        category: true // Incluir información de la categoría
      }
    });
  }

  // Listar todos los items
  async findAll() {
    return await this.prisma.item.findMany({
      include: {
        category: true,
        _count: {
          select: { stockMovements: true } // Contar movimientos
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  // Buscar items con bajo stock
  async findLowStock() {
    return await this.prisma.item.findMany({
      where: {
        currentStock: {
          lte: this.prisma.item.fields.minStock // stock actual <= stock mínimo
        }
      },
      include: {
        category: true
      },
      orderBy: { currentStock: 'asc' }
    });
  }

  // Buscar por categoría
  async findByCategory(categoryId: number) {
    return await this.prisma.item.findMany({
      where: { categoryId },
      include: {
        category: true
      },
      orderBy: { name: 'asc' }
    });
  }

  // Buscar un item por ID
  async findOne(id: number) {
    const item = await this.prisma.item.findUnique({
      where: { id },
      include: {
        category: true,
        stockMovements: {
          take: 10, // Últimos 10 movimientos
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                email: true
              }
            }
          }
        }
      }
    });

    if (!item) {
      throw new NotFoundException('Producto no encontrado');
    }

    return item;
  }

  async findByName(name: string) {
  return await this.prisma.item.findMany({
    where: { 
      name: {
        contains: name,
        mode: 'insensitive' // No distingue mayúsculas/minúsculas
      }
    },
    include: {
      category: true,
      _count: {
        select: { stockMovements: true }
      }
    },
    orderBy: { name: 'asc' }
  });
}

  // Actualizar item
  async update(id: number, updateItemDto: UpdateItemDto) {
    // Verificar que existe
    await this.findOne(id);

    // Si quiere cambiar el SKU, verificar que no esté en uso
    if (updateItemDto.sku) {
      const skuExists = await this.prisma.item.findUnique({
        where: { sku: updateItemDto.sku }
      });

      if (skuExists && skuExists.id !== id) {
        throw new ConflictException('Ya existe un producto con ese SKU');
      }
    }

    // Si quiere cambiar la categoría, verificar que existe
    if (updateItemDto.categoryId) {
      const categoryExists = await this.prisma.category.findUnique({
        where: { id: updateItemDto.categoryId }
      });

      if (!categoryExists) {
        throw new BadRequestException('La categoría especificada no existe');
      }
    }

    return await this.prisma.item.update({
      where: { id },
      data: updateItemDto,
      include: {
        category: true
      }
    });
  }

  // Eliminar item
  async remove(id: number) {
    await this.findOne(id);

    return await this.prisma.item.delete({
      where: { id }
    });
  }

  // Obtener estadísticas de inventario
  async getStats() {
    const totalItems = await this.prisma.item.count();
    
    const totalValue = await this.prisma.item.aggregate({
      _sum: {
        currentStock: true
      }
    });

    const lowStockItems = await this.prisma.item.count({
      where: {
        currentStock: {
          lte: this.prisma.item.fields.minStock
        }
      }
    });

    const outOfStockItems = await this.prisma.item.count({
      where: {
        currentStock: 0
      }
    });

    return {
      totalItems,
      totalUnits: totalValue._sum.currentStock || 0,
      lowStockItems,
      outOfStockItems
    };
  }
}