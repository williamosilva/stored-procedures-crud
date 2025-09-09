import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import {
  CreateProdutoDto,
  UpdateProdutoDto,
  ProdutoResponseDto,
} from 'src/dto/produto.dto';
import * as sql from 'mssql';

@Injectable()
export class ProdutoService {
  constructor(private readonly databaseService: DatabaseService) {}

  // SpSe1Produto - Buscar produto por código
  async findByCodigo(codProd: number): Promise<ProdutoResponseDto> {
    try {
      const pool = this.databaseService.getPool();
      const request = pool.request();

      request.input('CodProd', sql.Int, codProd);
      const result = await request.execute('SpSe1Produto');

      if (!result.recordset || result.recordset.length === 0) {
        throw new NotFoundException(
          `Produto com código ${codProd} não encontrado`,
        );
      }

      const produto = result.recordset[0];
      const produtoResponse = {
        CodProd: produto.CodProd,
        DescrProd: produto.DescrProd,
      };

      return produtoResponse;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao buscar produto por código');
    }
  }

  // SpSeProduto - Buscar produtos por descrição
  async findByDescricao(descrProd: string): Promise<ProdutoResponseDto[]> {
    try {
      const pool = this.databaseService.getPool();
      const request = pool.request();

      request.input('DescrProd', sql.VarChar(80), descrProd);
      const result = await request.execute('SpSeProduto');

      if (!result.recordset) {
        return [];
      }

      const produtos = result.recordset.map((produto) => {
        return {
          CodProd: produto.CodProd,
          DescrProd: produto.DescrProd,
        };
      });

      return produtos;
    } catch (error) {
      throw new BadRequestException('Erro ao buscar produtos por descrição');
    }
  }

  // Método auxiliar para gerar código aleatório único
  private async generateRandomCode(): Promise<number> {
    let attempts = 0;
    const maxAttempts = 10;

    while (attempts < maxAttempts) {
      const randomCode = Math.floor(Math.random() * (999999 - 1000 + 1)) + 1000;

      try {
        await this.findByCodigo(randomCode);

        attempts++;
      } catch (error) {
        if (error instanceof NotFoundException) {
          return randomCode;
        }

        throw error;
      }
    }

    throw new BadRequestException(
      'Não foi possível gerar código único para o produto',
    );
  }

  // SpGrProduto - APENAS CRIAR produto (não atualiza)
  async create(
    createProdutoDto: CreateProdutoDto,
  ): Promise<ProdutoResponseDto> {
    try {
      let codigoProduto: number;

      // Se foi fornecido um código, verifica se NÃO existe (para criar)
      if (createProdutoDto.CodProd) {
        try {
          await this.findByCodigo(createProdutoDto.CodProd);

          throw new BadRequestException(
            `Produto com código ${createProdutoDto.CodProd} já existe e não pode ser criado novamente`,
          );
        } catch (error) {
          if (error instanceof NotFoundException) {
            codigoProduto = createProdutoDto.CodProd;
          } else {
            throw error;
          }
        }
      } else {
        codigoProduto = await this.generateRandomCode();
      }

      const pool = this.databaseService.getPool();
      const request = pool.request();

      request.input('CodProd', sql.Int, codigoProduto);
      request.input('DescrProd', sql.VarChar(80), createProdutoDto.DescrProd);

      const result = await request.execute('SpGrProduto');

      if (result.recordset && result.recordset.length > 0) {
        const produto = result.recordset[0];
        const produtoResponse = {
          CodProd: produto.CodProd,
          DescrProd: produto.DescrProd,
        };

        return produtoResponse;
      }

      const produtoCriado = await this.findByCodigo(codigoProduto);
      return produtoCriado;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar produto');
    }
  }

  // SpGrProduto - Criar OU atualizar produto (baseado na existência)
  async createOrUpdate(
    createProdutoDto: CreateProdutoDto,
  ): Promise<ProdutoResponseDto> {
    try {
      const pool = this.databaseService.getPool();
      const request = pool.request();

      if (createProdutoDto.CodProd) {
        try {
          await this.findByCodigo(createProdutoDto.CodProd);
        } catch (error) {
          if (error instanceof NotFoundException) {
            throw new BadRequestException(
              `Produto com código ${createProdutoDto.CodProd} não existe e não pode ser atualizado`,
            );
          }
          throw error;
        }

        request.input('CodProd', sql.Int, createProdutoDto.CodProd);
      } else {
        const randomCode = await this.generateRandomCode();
        request.input('CodProd', sql.Int, randomCode);
      }

      request.input('DescrProd', sql.VarChar(80), createProdutoDto.DescrProd);
      const result = await request.execute('SpGrProduto');

      if (result.recordset && result.recordset.length > 0) {
        const produto = result.recordset[0];
        const produtoResponse = {
          CodProd: produto.CodProd,
          DescrProd: produto.DescrProd,
        };

        return produtoResponse;
      }

      if (createProdutoDto.CodProd) {
        return this.findByCodigo(createProdutoDto.CodProd);
      }

      const produtos = await this.findByDescricao(createProdutoDto.DescrProd);
      if (produtos.length > 0) {
        return produtos[0];
      }

      throw new BadRequestException('Erro ao criar/atualizar produto');
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Erro ao criar/atualizar produto');
    }
  }

  // SpGrProduto - Atualizar produto específico
  async update(
    updateProdutoDto: UpdateProdutoDto,
  ): Promise<ProdutoResponseDto> {
    try {
      if (!updateProdutoDto.CodProd) {
        throw new BadRequestException('CodProd é obrigatório para atualização');
      }

      await this.findByCodigo(updateProdutoDto.CodProd);

      const pool = this.databaseService.getPool();
      const request = pool.request();

      request.input('CodProd', sql.Int, updateProdutoDto.CodProd);
      request.input('DescrProd', sql.VarChar(80), updateProdutoDto.DescrProd);

      const result = await request.execute('SpGrProduto');

      const produtoAtualizado = await this.findByCodigo(
        updateProdutoDto.CodProd,
      );

      return produtoAtualizado;
    } catch (error) {
      if (
        error instanceof NotFoundException ||
        error instanceof BadRequestException
      ) {
        throw error;
      }
      throw new BadRequestException('Erro ao atualizar produto');
    }
  }

  // SpExProduto - Excluir produto
  async remove(codProd: number): Promise<{ message: string }> {
    try {
      const produtoExistente = await this.findByCodigo(codProd);

      const pool = this.databaseService.getPool();
      const request = pool.request();

      request.input('CodProd', sql.Int, codProd);
      const result = await request.execute('SpExProduto');

      const successMessage = {
        message: `Produto com código ${codProd} excluído com sucesso`,
      };

      return successMessage;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Erro ao excluir produto');
    }
  }

  // Método auxiliar para listar todos os produtos
  async findAll(): Promise<ProdutoResponseDto[]> {
    try {
      const produtos = await this.findByDescricao('%');
      return produtos;
    } catch (error) {
      throw new BadRequestException('Erro ao listar produtos');
    }
  }
}
