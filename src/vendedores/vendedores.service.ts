// src/vendedores/vendedores.service.ts

import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vendedor } from '../entities/vendedor.entity';
import { Venda } from '../entities/venda.entity';
import { DesempenhoVendedorDto } from './dto/get-desempenho-response.dto';

@Injectable()
export class VendedoresService {
  constructor(
    @InjectRepository(Vendedor)
    private readonly vendedorRepo: Repository<Vendedor>,

    @InjectRepository(Venda)
    private readonly vendaRepo: Repository<Venda>,
  ) {}

  async calcularDesempenho(id: number): Promise<DesempenhoVendedorDto> {
    const vendedor = await this.vendedorRepo.findOne({ where: { id } });
    if (!vendedor) {
      throw new NotFoundException('Vendedor não encontrado');
    }

    const dataInicioApuracao = new Date(vendedor.data_inicio_apuracao);
    const dataFimApuracao = new Date(vendedor.data_fim_apuracao);

    if (dataInicioApuracao >= dataFimApuracao) {
      throw new BadRequestException('data_inicio_apuracao deve ser anterior a data_fim_apuracao');
    }

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const inicio = new Date(dataInicioApuracao);
    inicio.setHours(0, 0, 0, 0);

    const fim = new Date(dataFimApuracao);
    fim.setHours(23, 59, 59, 999);

    const msPorDia = 1000 * 60 * 60 * 24;
    const diffMs = dataFimApuracao.getTime() - dataInicioApuracao.getTime();
    const diasPeriodo = Math.floor(diffMs / msPorDia) + 1;

    let diasRestantes: number;
    if (hoje > dataFimApuracao) {
      diasRestantes = 0;
    } else if (hoje < dataInicioApuracao) {
      diasRestantes = diasPeriodo;
    } else {
      const diffRestanteMs = new Date(fim).getTime() - hoje.getTime();
      diasRestantes = Math.floor(diffRestanteMs / msPorDia) + 1;
    }

    const hojeInicio = new Date(hoje);
    hojeInicio.setHours(0, 0, 0, 0);
    const hojeFim = new Date(hoje);
    hojeFim.setHours(23, 59, 59, 999);

    const totalVendasDiaRaw = await this.vendaRepo
      .createQueryBuilder('venda')
      .select('SUM(venda.valor)', 'soma')
      .where('venda.id_vendedor = :vendedorId', { vendedorId: id })
      .andWhere('venda.forma_pagamento != :voucher', { voucher: 'VOUCHER' })
      .andWhere('venda.data_venda BETWEEN :inicioDia AND :fimDia', {
        inicioDia: hojeInicio,
        fimDia: hojeFim,
      })
      .getRawOne();

    const total_vendas_dia = parseFloat(totalVendasDiaRaw.soma) || 0;

    const totalAcumuladoRaw = await this.vendaRepo
      .createQueryBuilder('venda')
      .select('SUM(venda.valor)', 'soma')
      .where('venda.id_vendedor = :vendedorId', { vendedorId: id })
      .andWhere('venda.forma_pagamento != :voucher', { voucher: 'VOUCHER' })
      .andWhere('venda.data_venda BETWEEN :inicioPeriodo AND :fimPeriodo', {
        inicioPeriodo: inicio,
        fimPeriodo: fim,
      })
      .getRawOne();

    const total_acumulado_mes = parseFloat(totalAcumuladoRaw.soma) || 0;

    const meta_mensal = Number(vendedor.meta_mensal);
    const raw_valor_restante = meta_mensal - total_acumulado_mes;
    const valor_restante = parseFloat(Math.max(0, raw_valor_restante).toFixed(2));

    const situacao_atual =
      total_acumulado_mes >= meta_mensal ? 'Dentro da meta' : 'Fora da meta';

    let meta_diaria: number;
    if (diasRestantes > 0) {
      if (valor_restante <= 0) {
        meta_diaria = 0;
      } else {
        meta_diaria = parseFloat((valor_restante / diasRestantes).toFixed(2));
      }
    } else {
      meta_diaria = 0;
    }

    const resposta: DesempenhoVendedorDto = {
      total_vendas_dia,
      total_acumulado_mes,
      meta_mensal,
      valor_restante,
      situacao_atual,
      dias_periodo: diasPeriodo,
      dias_restantes: diasRestantes,
      meta_diaria,
    };

    return resposta;
  }
}
