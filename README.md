## Vendas-API

Este projeto é uma API desenvolvida em NestJS, conectada a um banco PostgreSQL via TypeORM, que realiza o cálculo de desempenho de vendedores com base em um período de apuração específico e exporta resultados em JSON. Para os fins desse teste, considerando as datas presentes no csv o período de atuação considerado foi entre 26/04/2025 e 25/05/2025.

### 🚀 Pré-requisitos

- Docker

- docker-compose

- (Opcional) Node.js + npm/yarn, para executar localmente sem Docker.

### Configuração de Ambiente

Renomeie ou copie o arquivo .env.example para .env:

`cp .env.example .env`

Edite .env conforme necessário:

```
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=vendas_db
```

Certifique-se de que o arquivo Vendas-API.csv esteja na raiz do projeto.

### 🐳 Executando com Docker

No terminal, na raiz do projeto, execute:

`docker-compose up --build`

Esse comando irá:

1. Subir um container PostgreSQL, com database vendas_db.

2. Buildar e subir o container da API NestJS.

3. Executar o serviço de importação, que lê Vendas-API.csv e popula as tabelas vendedores e vendas.

### Acessando a API

- Endpoint:

`GET http://localhost:3000/vendedores/{id}/desempenho`

- Exemplo de resposta:

```
{
  "total_vendas_dia": 1200.50,
  "total_acumulado_mes": 8000.75,
  "meta_mensal": 10000,
  "valor_restante": 1999.25,
  "situacao_atual": "Fora da meta",
  "dias_periodo": 31,
  "dias_restantes": 20,
  "meta_diaria": 99.96
}
```

### Scripts

```
{
  "scripts": {
    "start": "nest start",
    "start:dev": "nest start --watch",
    "build": "nest build",
    "seed:import-csv": "ts-node src/seed/import-csv.ts"
  }
}
```

- `npm run start:dev`: inicia a API em modo de desenvolvimento.

- `npm run build`: compila o projeto TypeScript.

- `npm run seed:import-csv`: executa script de importação do CSV (use dentro do container ou local).

Lembrando que o script para importar os dados do CSV é executado automaticamente ao rodar o docker-compose.