import { IsString, IsOptional, IsNumber, Min, IsInt, MinLength } from 'class-validator';

export class CreateItemDto {
  @IsString()
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  sku?: string;

  @IsOptional()
  @IsInt({ message: 'El stock inicial debe ser un número entero' })
  @Min(0, { message: 'El stock no puede ser negativo' })
  currentStock?: number;

  @IsOptional()
  @IsInt({ message: 'El stock mínimo debe ser un número entero' })
  @Min(0, { message: 'El stock mínimo no puede ser negativo' })
  minStock?: number;

  @IsOptional()
  @IsNumber({}, { message: 'El precio debe ser un número' })
  @Min(0, { message: 'El precio no puede ser negativo' })
  price?: number;

  @IsOptional()
  @IsInt({ message: 'El ID de categoría debe ser un número entero' })
  categoryId?: number;
}