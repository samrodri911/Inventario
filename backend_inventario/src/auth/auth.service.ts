import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  // Registrar nuevo usuario
  async register(registerDto: RegisterDto) {
    const user = await this.usersService.create(
      registerDto.email,
      registerDto.password,
      registerDto.displayName,
    );

    // Generar token JWT
    const token = this.generateToken(user.id, user.email);

    return {
      user,
      access_token: token,
    };
  }

  // Login
  // Login
async login(loginDto: LoginDto) {
  // Buscar usuario
  const user = await this.usersService.findByEmail(loginDto.email);

  if (!user) {
    throw new UnauthorizedException('Credenciales incorrectas');
  }

  // Validar que el usuario tiene contraseña (no es solo OAuth)
  if (!user.passwordHash) {
    throw new UnauthorizedException('Este usuario usa login con Google/Facebook');
  }

  // Validar contraseña
  const isPasswordValid = await this.usersService.validatePassword(
    loginDto.password,
    user.passwordHash, // 👈 Ahora TypeScript sabe que NO es null
  );

  if (!isPasswordValid) {
    throw new UnauthorizedException('Credenciales incorrectas');
  }

  // Generar token
  const token = this.generateToken(user.id, user.email);

  // No devolver la contraseña
  const { passwordHash: _, ...userWithoutPassword } = user;

  return {
    user: userWithoutPassword,
    access_token: token,
  };
}

  // Generar JWT
  private generateToken(userId: number, email: string): string {
    const payload = { sub: userId, email };
    return this.jwtService.sign(payload);
  }

  // Verificar token
  async validateToken(token: string) {
    try {
      return this.jwtService.verify(token);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }
}