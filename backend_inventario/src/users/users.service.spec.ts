import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  // Crear usuario
  async create(email: string, password: string, displayName?: string) {
    // Verificar si el email ya existe
    const existingUser = await this.prisma.user.findUnique({
      where: { email }
    });

    if (existingUser) {
      throw new ConflictException('El email ya está registrado');
    }

    // Encriptar contraseña
    const passwordHash = await bcrypt.hash(password, 10);

    // Crear usuario
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        displayName,
      }
    });

    // No devolver la contraseña
    const { passwordHash: _, ...result } = user;
    return result;
  }

  // Buscar usuario por email
  async findByEmail(email: string) {
    return await this.prisma.user.findUnique({
      where: { email }
    });
  }

  // Buscar usuario por ID
  async findById(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    const { passwordHash: _, ...result } = user;
    return result;
  }

  // Listar todos los usuarios
  async findAll() {
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        email: true,
        displayName: true,
        isEmailVerified: true,
        createdAt: true,
      }
    });
    return users;
  }

  // Validar contraseña
  async validatePassword(password: string, passwordHash: string): Promise<boolean> {
    return await bcrypt.compare(password, passwordHash);
  }
}