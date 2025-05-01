# API Carro Vendido - Backend

Este diretório contém o código-fonte da API backend para a aplicação Carro Vendido, construída com Node.js, Express e TypeScript, utilizando Prisma como ORM.

## Comandos Úteis (Executar dentro de `backend/`)

- **Instalar Dependências:**
  ```bash
  npm install
  ```

- **Executar em Desenvolvimento (com hot-reload):**
  ```bash
  npm run dev
  ```

- **Compilar para Produção:**
  ```bash
  npm run build
  ```

- **Executar Versão Compilada:**
  ```bash
  npm start
  ```

- **Executar Migrações do Banco de Dados:**
  ```bash
  npm run prisma:migrate
  ```

- **Gerar Cliente Prisma (após alterações no `schema.prisma`):**
  ```bash
  npm run prisma:generate
  ```

## Documentação da API

A documentação completa e interativa da API está disponível via Swagger UI.
Após iniciar o servidor (localmente ou via Docker), acesse:

[http://localhost:3000/api-docs](http://localhost:3000/api-docs)

## Configuração

As configurações, como a string de conexão do banco de dados (`DATABASE_URL`) e a porta (`PORT`), são gerenciadas através de variáveis de ambiente. Crie um arquivo `.env` neste diretório com base nas necessidades (veja o `README.md` principal para mais detalhes). 