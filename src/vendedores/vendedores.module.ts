import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendedoresService } from './vendedores.service';
import { VendedoresController } from './vendedores.controller';
import { Vendedor } from '../entities/vendedor.entity';
import { Venda } from '../entities/venda.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Vendedor, Venda]),
  ],
  controllers: [VendedoresController],
  providers: [VendedoresService],
})
export class VendedoresModule {}
