import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VendedoresModule } from './vendedores/vendedores.module';

@Module({
  imports: [
    // Carrega .env
    ConfigModule.forRoot({ isGlobal: true }),
    // Configura TypeORM usando vars de ambiente
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get('DB_HOST'),
        port: +config.get<number>('DB_PORT'),
        username: config.get('DB_USER'),
        password: config.get('DB_PASSWORD'),
        database: config.get('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true, // Em dev: cria/atualiza tabelas automaticamente
      }),
    }),
    VendedoresModule,
    // Outros modules serão importados aqui...
  ],
})
export class AppModule {}
