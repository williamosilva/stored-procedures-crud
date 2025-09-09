import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ProdutoService } from './produto.service';
import {
  CreateProdutoDto,
  ProdutoResponseDto,
  UpdateProdutoDto,
} from 'src/dto/produto.dto';

@ApiTags('Produtos')
@Controller('produtos')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Get()
  @ApiOperation({
    summary: 'Listar todos os produtos',
    description: 'Retorna uma lista com todos os produtos cadastrados',
  })
  @ApiResponse({
    status: 200,
    description: 'Lista de produtos retornada com sucesso',
    type: [ProdutoResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar produtos',
    schema: {
      example: {
        statusCode: 400,
        message: 'Erro ao listar produtos',
        error: 'Bad Request',
      },
    },
  })
  async findAll(): Promise<ProdutoResponseDto[]> {
    return this.produtoService.findAll();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Buscar produtos por descrição',
    description: 'Busca produtos que contenham o termo na descrição',
  })
  @ApiQuery({
    name: 'descricao',
    description: 'Termo a ser buscado na descrição do produto',
    example: 'notebook',
    type: 'string',
  })
  @ApiResponse({
    status: 200,
    description: 'Produtos encontrados com sucesso',
    type: [ProdutoResponseDto],
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar produtos por descrição',
  })
  async findByDescricao(
    @Query('descricao') descricao: string,
  ): Promise<ProdutoResponseDto[]> {
    return this.produtoService.findByDescricao(descricao);
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Buscar produto por código',
    description: 'Retorna um produto específico pelo seu código',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do produto',
    example: 123,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto encontrado com sucesso',
    type: ProdutoResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
    schema: {
      example: {
        statusCode: 404,
        message: 'Produto com código 123 não encontrado',
        error: 'Not Found',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao buscar produto',
  })
  async findByCodigo(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ProdutoResponseDto> {
    return this.produtoService.findByCodigo(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Criar novo produto',
    description: 'Cria um novo produto no sistema',
  })
  @ApiBody({
    type: CreateProdutoDto,
    description: 'Dados do produto a ser criado',
    examples: {
      'Criar produto': {
        summary: 'Exemplo de criação de produto',
        value: {
          DescrProd: 'Notebook Dell Inspiron',
        },
      },
    },
  })
  @ApiResponse({
    status: 201,
    description: 'Produto criado com sucesso',
    type: ProdutoResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou erro na criação',
    schema: {
      example: {
        statusCode: 400,
        message: ['DescrProd should not be empty'],
        error: 'Bad Request',
      },
    },
  })
  async create(
    @Body(ValidationPipe) createProdutoDto: CreateProdutoDto,
  ): Promise<ProdutoResponseDto> {
    return this.produtoService.create(createProdutoDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Atualizar produto específico',
    description: 'Atualiza um produto existente pelo seu código',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do produto a ser atualizado',
    example: 123,
    type: 'integer',
  })
  @ApiBody({
    description: 'Dados para atualização do produto',
    schema: {
      type: 'object',
      properties: {
        DescrProd: {
          type: 'string',
          description: 'Nova descrição do produto',
          example: 'Notebook Dell Inspiron Atualizado',
          maxLength: 80,
        },
      },
      required: ['DescrProd'],
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Produto atualizado com sucesso',
    type: ProdutoResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Dados inválidos ou erro na atualização',
  })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body(ValidationPipe) updateProdutoDto: Omit<UpdateProdutoDto, 'CodProd'>,
  ): Promise<ProdutoResponseDto> {
    const dto: UpdateProdutoDto = { ...updateProdutoDto, CodProd: id };
    return this.produtoService.update(dto);
  }

  @Post('save')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Criar ou atualizar produto',
    description:
      'Cria um novo produto ou atualiza existente baseado na presença do código',
  })
  @ApiBody({
    type: CreateProdutoDto,
    description: 'Dados do produto',
    examples: {
      'Criar produto': {
        summary: 'Criar novo produto (sem código)',
        value: {
          DescrProd: 'Novo Produto',
        },
      },
      'Atualizar produto': {
        summary: 'Atualizar produto existente (com código)',
        value: {
          CodProd: 123,
          DescrProd: 'Produto Atualizado',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Produto criado ou atualizado com sucesso',
    type: ProdutoResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Produto não existe para atualização ou dados inválidos',
    schema: {
      example: {
        statusCode: 400,
        message: 'Produto com código 999 não existe e não pode ser atualizado',
        error: 'Bad Request',
      },
    },
  })
  async createOrUpdate(
    @Body(ValidationPipe) createProdutoDto: CreateProdutoDto,
  ): Promise<ProdutoResponseDto> {
    return this.produtoService.createOrUpdate(createProdutoDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Excluir produto',
    description: 'Remove um produto do sistema',
  })
  @ApiParam({
    name: 'id',
    description: 'Código do produto a ser excluído',
    example: 123,
    type: 'integer',
  })
  @ApiResponse({
    status: 200,
    description: 'Produto excluído com sucesso',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'Produto com código 123 excluído com sucesso',
        },
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Produto não encontrado',
  })
  @ApiResponse({
    status: 400,
    description: 'Erro ao excluir produto',
  })
  async remove(
    @Param('id', ParseIntPipe) id: number,
  ): Promise<{ message: string }> {
    return this.produtoService.remove(id);
  }
}
