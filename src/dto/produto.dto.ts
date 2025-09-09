import {
  IsNotEmpty,
  IsString,
  MaxLength,
  IsOptional,
  IsInt,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProdutoDto {
  @ApiPropertyOptional({
    description:
      'Código do produto (opcional para criação, obrigatório para atualização)',
    example: 123,
    type: 'integer',
  })
  @IsOptional()
  @IsInt()
  CodProd?: number;

  @ApiProperty({
    description: 'Descrição do produto',
    example: 'Notebook Dell Inspiron',
    maxLength: 80,
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  DescrProd: string;
}

export class UpdateProdutoDto {
  @ApiProperty({
    description: 'Código do produto',
    example: 123,
    type: 'integer',
  })
  @IsInt()
  @IsNotEmpty()
  CodProd: number;

  @ApiProperty({
    description: 'Descrição do produto',
    example: 'Notebook Dell Inspiron Atualizado',
    maxLength: 80,
    type: 'string',
  })
  @IsNotEmpty()
  @IsString()
  @MaxLength(80)
  DescrProd: string;
}

export class ProdutoResponseDto {
  @ApiProperty({
    description: 'Código único do produto',
    example: 123,
    type: 'integer',
  })
  CodProd: number;

  @ApiProperty({
    description: 'Descrição do produto',
    example: 'Notebook Dell Inspiron',
    type: 'string',
  })
  DescrProd: string;
}
