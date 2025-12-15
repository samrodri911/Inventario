import { Controller, Get, UseGuards, Patch, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Endpoint público: listar todos los usuarios
  @Get()
  async findAll() {
    return await this.usersService.findAll();
  }

  // Endpoint protegido: ver MI perfil
  @UseGuards(JwtAuthGuard) // 👈 Solo usuarios autenticados
  @Get('me')
  async getProfile(@CurrentUser() user: any) {
    return {
      message: 'Este es tu perfil',
      user: user,
    };
  }

  // Actualizar MI perfil (protegido)
  @UseGuards(JwtAuthGuard)
  @Patch('me')
  async updateProfile(
    @CurrentUser() user: any,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    const updatedUser = await this.usersService.update(user.id, updateUserDto);
    
    return {
      message: 'Perfil actualizado exitosamente',
      user: updatedUser,
    };
  }
}