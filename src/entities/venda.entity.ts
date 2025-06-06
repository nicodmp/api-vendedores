import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Vendedor } from './vendedor.entity';

@Entity({ name: 'vendas' })
export class Venda {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Vendedor, vendedor => vendedor.vendas, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'id_vendedor' })
  vendedor: Vendedor;

  @Column({ type: 'timestamp' })
  data_venda: Date;

  @Column('decimal', { precision: 10, scale: 2 })
  valor: number;

  @Column({ length: 20 })
  forma_pagamento: string;
}
