import { IsInt, IsString, IsIn, Min, IsOptional } from 'class-validator';

export class CreateStockMovementDto {
  @IsInt({ message: 'El ID del producto debe ser un número entero' })
  itemId: number;

  @IsString()
  @IsIn(['IN', 'OUT'], { message: 'El tipo debe ser IN (entrada) o OUT (salida)' })
  type: string;

  @IsInt({ message: 'La cantidad debe ser un número entero' })
  @Min(1, { message: 'La cantidad debe ser al menos 1' })
  quantity: number;

  @IsOptional()
  @IsString()
  reason?: string;
}