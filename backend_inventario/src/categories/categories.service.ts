import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  // Crear categoría
  async create(createCategoryDto: CreateCategoryDto) {
    // Verificar que no exista una categoría con ese nombre
    const exists = await this.prisma.category.findUnique({
      where: { name: createCategoryDto.name }
    });

    if (exists) {
      throw new ConflictException('Ya existe una categoría con ese nombre');
    }

    return await this.prisma.category.create({
      data: createCategoryDto
    });
  }

  // Listar todas las categorías
  async findAll() {
    return await this.prisma.category.findMany({
      include: {
        _count: {
          select: { items: true } // Cuenta cuántos items tiene cada categoría
        }
      },
      orderBy: { name: 'asc' }
    });
  }

  // Buscar una categoría por ID
  async findOne(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        items: true // Incluye todos los items de esta categoría
      }
    });

    if (!category) {
      throw new NotFoundException('Categoría no encontrada');
    }

    return category;
  }

  // Actualizar categoría
  async update(id: number, updateCategoryDto: UpdateCategoryDto) {
    // Verificar que existe
    await this.findOne(id);

    // Si quiere cambiar el nombre, verificar que no esté en uso
    if (updateCategoryDto.name) {
      const nameExists = await this.prisma.category.findUnique({
        where: { name: updateCategoryDto.name }
      });

      if (nameExists && nameExists.id !== id) {
        throw new ConflictException('Ya existe una categoría con ese nombre');
      }
    }

    return await this.prisma.category.update({
      where: { id },
      data: updateCategoryDto
    });
  }

  // Eliminar categoría
  async remove(id: number) {
    await this.findOne(id);

    return await this.prisma.category.delete({
      where: { id }
    });
  }
}