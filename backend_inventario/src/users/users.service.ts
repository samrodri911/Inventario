import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
    constructor(private prisma: PrismaService){}

    async create(email: string, password: string, displayName? :string){
        const existingUser = await this.prisma.user.findUnique({
            where: {email}
        });
    if(existingUser){
        throw new ConflictException('El usuario ya existe');
    }
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await this.prisma.user.create({
        data: {
            email,
            passwordHash,
            displayName
        }
    });
    const {passwordHash: _, ...result} = user;
    return result;
    }

    async findByEmail(email: string){
        return await this.prisma.user.findUnique({
            where: {email}
        });
    }
    
    async findById(id: number){
        const user = await this.prisma.user.findUnique({
            where: {id}
        });
        if(!user){
            throw new NotFoundException('El usuario no existe');
        }
        const {passwordHash: _, ...result} = user;
        return user;
    }

    async findAll(){
        const user = await this.prisma.user.findMany(
            {
                select: {
                    id: true,
                    email: true,
                    displayName: true,
                    isEmailVerified:true,
                    createdAt: true,
                }
            });
        return user;
    }

    async validatePassword(password: string, passwordHash: string): Promise<boolean>{
        return await bcrypt.compare(password, passwordHash);
    }

    async update(userId: number, updateUserDto: UpdateUserDto) {
    // Verificar que el usuario existe
    const user = await this.prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }

    // Preparar datos para actualizar
    const dataToUpdate: any = {};

    // Si quiere cambiar el nombre
    if (updateUserDto.displayName !== undefined) {
      dataToUpdate.displayName = updateUserDto.displayName;
    }

    // Si quiere cambiar el email
    if (updateUserDto.email !== undefined) {
      // Verificar que el nuevo email no esté en uso
      const emailExists = await this.prisma.user.findUnique({
        where: { email: updateUserDto.email }
      });

      if (emailExists && emailExists.id !== userId) {
        throw new ConflictException('Ese email ya está en uso');
      }

      dataToUpdate.email = updateUserDto.email;
    }

    // Si quiere cambiar la contraseña
    if (updateUserDto.password !== undefined) {
      dataToUpdate.passwordHash = await bcrypt.hash(updateUserDto.password, 10);
    }

    // Actualizar usuario
    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: dataToUpdate
    });

    // No devolver la contraseña
    const { passwordHash: _, ...result } = updatedUser;
    return result;
  }
}

