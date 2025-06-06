export class DesempenhoVendedorDto {
  total_vendas_dia: number;
  total_acumulado_mes: number;
  meta_mensal: number;
  valor_restante: number;
  situacao_atual: 'Dentro da meta' | 'Fora da meta';
  dias_periodo: number;
  dias_restantes: number;
  meta_diaria: number;
}
