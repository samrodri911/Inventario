import { IsEmail, IsString, MinLength, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'El email debe ser válido' })
  email: string;

  @IsString()
  @MinLength(5, { message: 'La contraseña debe tener al menos 5 caracteres' })
  password: string;

  @IsOptional()
  @IsString()
  displayName?: string;
}