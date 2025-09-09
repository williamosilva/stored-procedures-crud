import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ProdutoModule } from './produto/produto.module';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    DatabaseModule,
    ProdutoModule,
  ],
})
export class AppModule {}
