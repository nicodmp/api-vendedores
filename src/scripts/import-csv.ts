// src/scripts/import-csv.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { Repository } from 'typeorm';
import * as path from 'path';
import * as fs from 'fs';
import * as csvParser from 'csv-parser';
import { Vendedor } from '../entities/vendedor.entity';
import { Venda } from '../entities/venda.entity';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule, {
    logger: false,
  });

  const vendedorRepo: Repository<Vendedor> = appContext.get('VendedorRepository');
  const vendaRepo: Repository<Venda> = appContext.get('VendaRepository');

  const csvFilePath = path.resolve(__dirname, '../../Vendas-API.csv');

  const cacheVendedores: Record<number, Vendedor> = {};

  const processarLinha = async (row: any) => {
    // Exemplo de colunas do CSV:
    // { id_vendedor: '282',
    //   Vendedor: 'ANA SILVA',
    //   'Nro. Pedido': '0000042803',
    //   data_venda: '5/2/2025',
    //   Valor: '599,00',
    //   forma_pagamento: 'CARTÃO DEBITO' }

    const idVendedorNum = Number(row['id_vendedor']);
    if (isNaN(idVendedorNum)) {
      console.warn(`Linha com id_vendedor inválido: ${row['id_vendedor']}`);
      return;
    }

    const [mesStr, diaStr, anoStr] = row['data_venda'].split('/');
    const dia = Number(diaStr);
    const mes = Number(mesStr);
    const ano = Number(anoStr);
    const dataVenda = new Date(ano, mes - 1, dia);

    const valorStrOriginal = row['Valor'];
    const valorSomenteNumeros = valorStrOriginal
      .replace(/\./g, '')
      .replace(',', '.');
    const valorNum = parseFloat(valorSomenteNumeros);
    if (isNaN(valorNum)) {
      console.warn(`Valor inválido na linha: ${valorStrOriginal}`);
      return;
    }

    const formaPagamento = row['forma_pagamento'].trim();

    let vendedorEntity: Vendedor;

    if (cacheVendedores[idVendedorNum]) {
      vendedorEntity = cacheVendedores[idVendedorNum];
    } else {
        const existente = await vendedorRepo.findOne({ where: { id: idVendedorNum } });

        if(existente) {
            vendedorEntity = existente;
        } else {
            vendedorEntity = vendedorRepo.create({
            id: idVendedorNum,
            nome: row['Vendedor'].trim(),
            telefone: '34999999999',
            meta_mensal: 50000,
            data_inicio_apuracao: new Date(2025, 3, 26),
            data_fim_apuracao: new Date(2025, 4, 25),
            });
        await vendedorRepo.save(vendedorEntity);
        console.log(`Vendedor criado: ${vendedorEntity.id} – ${vendedorEntity.nome}`);
        }

      cacheVendedores[idVendedorNum] = vendedorEntity;
    }

    const vendaEntity = vendaRepo.create({
      vendedor: vendedorEntity,
      data_venda: dataVenda,
      valor: valorNum,
      forma_pagamento: formaPagamento,
    });

    await vendaRepo.save(vendaEntity);
  };

  const rows: any[] = [];
  await new Promise<void>((resolve, reject) => {
    fs.createReadStream(csvFilePath)
        .pipe(csvParser({ separator: ',', skipLines: 0 }))
        .on('data', (row) => rows.push(row))
        .on('end', () => resolve())
        .on('error', (err) => reject(err));
    });

    for (const row of rows) {
        try {
            await processarLinha(row);
        } catch (err) {
            console.error('Erro ao processar linha:', err);
        }
    }

  await appContext.close();
  console.log('Conexão encerrada.');
}

bootstrap().catch(err => {
  console.error('Erro no bootstrap do script:', err);
  process.exit(1);
});
