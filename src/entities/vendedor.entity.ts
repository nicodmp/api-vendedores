import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Venda } from './venda.entity';

@Entity({ name: 'vendedores' })
export class Vendedor {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 100 })
  nome: string;

  @Column({ length: 20 })
  telefone: string;

  @Column('decimal', { precision: 10, scale: 2 })
  meta_mensal: number;

  @Column({ type: 'date' })
  data_inicio_apuracao: Date;

  @Column({ type: 'date' })
  data_fim_apuracao: Date;

  @OneToMany(() => Venda, venda => venda.vendedor)
  vendas: Venda[];
}
