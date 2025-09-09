import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sql from 'mssql';

@Injectable()
export class DatabaseService implements OnModuleInit {
  private readonly logger = new Logger(DatabaseService.name);
  private pool: sql.ConnectionPool;

  constructor(private readonly configService: ConfigService) {}

  private getConfig(): sql.config {
    return {
      user: this.configService.get<string>('DB_USER'),
      password: this.configService.get<string>('DB_PASSWORD'),
      server: this.configService.get<string>('DB_SERVER'),
      port: Number(this.configService.get<string>('DB_PORT')),
      database: this.configService.get<string>('DB_DATABASE'),
      options: {
        encrypt: this.configService.get<string>('DB_ENCRYPT') === 'true',
        trustServerCertificate:
          this.configService.get<string>('DB_TRUST_SERVER_CERT') === 'true',
      },
    };
  }

  async onModuleInit() {
    try {
      this.pool = await new sql.ConnectionPool(this.getConfig()).connect();
      this.logger.log('✅ Conexão com SQL Server estabelecida com sucesso!');
    } catch (err) {
      this.logger.error('❌ Erro ao conectar no banco', err.message);
    }
  }

  getPool() {
    return this.pool;
  }
}
