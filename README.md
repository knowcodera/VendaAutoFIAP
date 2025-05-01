# Carro Vendido API

API REST para gerenciamento de estoque e vendas de veículos, com integração simulada de pagamentos.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node Version](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen)
![Swagger](https://img.shields.io/badge/docs-swagger-green)
![Docker](https://img.shields.io/badge/docker-ready-blue)

## 📋 Índice

- [Visão Geral](#-visão-geral)
- [Tecnologias](#-tecnologias)
- [Arquitetura](#-arquitetura)
- [Instalação](#-instalação)
- [Configuração](#-configuração)
- [Execução](#-execução)
- [Docker](#-docker)
- [Documentação da API](#-documentação-da-api)
- [Implantação com Kubernetes](#-implantação-com-kubernetes)
- [Estrutura do Projeto](#-estrutura-do-projeto)
- [Contribuição](#-contribuição)
- [Licença](#-licença)

## 🚀 Visão Geral

O **Carro Vendido API** é um sistema backend para gerenciar um inventário de veículos à venda, incluindo vendedores e imagens, permitindo operações de CRUD. Inclui também um sistema simulado de processamento de vendas.

### Funcionalidades Principais

- Gerenciamento de inventário de veículos (CRUD)
- Gerenciamento de vendedores (CRUD)
- Gerenciamento de imagens de veículos (Upload, CRUD, Imagem Principal)
- Processamento simulado de vendas com geração de link "fake"
- Webhooks para atualizações simuladas de status de pagamento
- API RESTful com documentação Swagger
- Arquitetura baseada em Domain-Driven Design (DDD)

## 🛠 Tecnologias

- **Node.js**: Ambiente de execução JavaScript server-side
- **TypeScript**: Superset tipado de JavaScript
- **Express**: Framework web para Node.js
- **Prisma**: ORM (Object-Relational Mapping)
- **SQLite**: Banco de dados relacional padrão (configurável via `DATABASE_URL`)
- **Swagger/OpenAPI (via `swagger-jsdoc`, `swagger-ui-express`)**: Documentação da API
- **Zod**: Validação de Schemas
- **Pino / pino-http**: Logging
- **Axios**: Cliente HTTP (usado internamente, ex: webhooks)
- **Multer**: Middleware para upload de arquivos (imagens)
- **Docker / Docker Compose**: Containerização
- **Kubernetes**: Configurações para orquestração

## 🏗 Arquitetura

O projeto segue uma arquitetura baseada em Domain-Driven Design (DDD) com as seguintes camadas principais dentro de `backend/src/`:

- **Domain**: Entidades, regras de negócio e interfaces de repositório.
- **Application**: Casos de uso (Services), DTOs e Adaptadores.
- **Infrastructure**: Implementações concretas de repositórios (Prisma) e serviços externos (simulados).
- **Main/Config**: Configuração da aplicação (Express, Swagger, Logger, Variáveis de ambiente).
- **Routes/Controllers/Middleware**: Camada de entrada da API (HTTP).

## 💻 Instalação

### Pré-requisitos

- Node.js (>= 16.x recomendado, verificar `package.json`)
- npm (geralmente incluído com Node.js)
- Git

### Clone o repositório

```bash
git clone https://github.com/seu-usuario/carro-vendido-api.git
cd carro-vendido-api
```

### Instale as dependências (Backend e Frontend)

```bash
# Instalar dependências do Backend
cd backend
npm install
cd ..

# Instalar dependências do Frontend (se necessário)
cd frontend
npm install
cd ..
```

## ⚙️ Configuração (Backend)

### Variáveis de Ambiente

Dentro do diretório `backend/`, crie um arquivo `.env` com base no `.env.example` (se existir) ou com as seguintes variáveis:

```dotenv
# Ambiente (development, production, test)
NODE_ENV=development

# Porta da API
PORT=3000

# String de conexão do banco de dados Prisma
# Exemplo para SQLite:
DATABASE_URL="file:./prisma/dev.db"
# Exemplo para PostgreSQL:
# DATABASE_URL="postgresql://user:password@host:port/database?schema=public"

# Token de acesso para serviços externos (se aplicável)
# MERCADO_PAGO_ACCESS_TOKEN=YOUR_MERCADO_PAGO_ACCESS_TOKEN # Exemplo se usasse MP real

# Outras configurações específicas da aplicação...
```

### Banco de Dados

Execute as migrações do Prisma para criar as tabelas no banco de dados definido na `DATABASE_URL`:

```bash
cd backend
npm run prisma:migrate
```

Opcionalmente, para gerar o cliente Prisma após mudanças no schema:
```bash
npm run prisma:generate
```

## ▶️ Execução (Backend)

Dentro do diretório `backend/`:

### Ambiente de Desenvolvimento (com hot-reload)

```bash
npm run dev
```

### Build e Execução para Produção

```bash
# 1. Compilar o TypeScript para JavaScript
npm run build

# 2. Iniciar o servidor a partir dos arquivos compilados em dist/
npm start
```

## 🐳 Docker

O projeto pode ser executado utilizando Docker e Docker Compose.

### Pré-requisitos

- Docker
- Docker Compose v2

### Executando com Docker Compose

Na raiz do projeto:

```bash
# Construir as imagens (se ainda não foram construídas) e iniciar os containers em background
docker-compose up -d --build

# Apenas iniciar containers (se as imagens já existem)
docker-compose up -d

# Ver logs dos serviços (ex: backend)
docker-compose logs -f backend

# Parar e remover os containers, redes e volumes (definidos no compose)
docker-compose down -v

# Parar os containers sem remover
docker-compose stop
```

### Acessando a Aplicação via Docker

- **Frontend:** http://localhost:80 (Mapeado pela porta do container frontend)
- **API Backend:** http://localhost:3000/api (Mapeado pela porta do container backend)
- **Documentação da API:** http://localhost:3000/api-docs

### Volumes

- `prisma/dev.db` é montado a partir do host ou um volume é usado para persistir os dados do SQLite (ver `docker-compose.yml`).
- `backend/uploads` pode ser montado como volume para persistir imagens carregadas.

## 📝 Documentação da API

A API é documentada usando Swagger/OpenAPI. Após iniciar o servidor (localmente ou via Docker), acesse:

```
http://localhost:3000/api-docs
```

### Endpoints Principais

**Veículos (`/api/vehicles`)**
- `GET /`: Lista todos os veículos (filtro opcional `?sold=boolean`)
- `POST /`: Cria um novo veículo
- `GET /{id}`: Detalhes de um veículo específico
- `PUT /{id}`: Atualiza um veículo
- `DELETE /{id}`: Remove um veículo
- `PATCH /{id}/sell`: Registra a intenção de venda (gera simulação de pagamento)

**Vendedores (`/api/sellers`)**
- `GET /`: Lista todos os vendedores
- `POST /`: Cria um novo vendedor
- `GET /{id}`: Detalhes de um vendedor
- `PUT /{id}`: Atualiza um vendedor
- `DELETE /{id}`: Remove um vendedor

**Imagens de Veículos (`/api/vehicle-images`)**
- `GET /{vehicleId}`: Lista imagens de um veículo
- `POST /{vehicleId}`: Upload de nova imagem para um veículo (`multipart/form-data`)
- `PUT /{id}`: Atualiza dados de uma imagem
- `DELETE /{id}`: Remove uma imagem
- `PATCH /{vehicleId}/primary/{imageId}`: Define uma imagem como principal

**Webhooks (`/api/webhooks`)**
- `POST /mercadopago`: Webhook simulado para notificações de pagamento

**Pagamentos (`/api/payments`)**
- `POST /simulate/:externalId`: Simula atualização de status de pagamento (`approved` ou `rejected`)

**Saúde (`/health`)**
- `GET /`: Verifica o status da API

## 🚢 Implantação com Kubernetes

O diretório `k8s/` contém arquivos de manifesto base para implantação em Kubernetes.

### Arquivos de Configuração (Exemplos)

- `k8s/configmap.yaml`: Configurações não sensíveis (ex: `NODE_ENV`).
- `k8s/secret.yaml`: Dados sensíveis (ex: `DATABASE_URL` de produção). Codifique os valores em Base64.
- `k8s/deployment-backend.yaml`: Definição do deployment do backend. **Importante:** Defina `resources.requests.cpu` para que o HPA funcione.
- `k8s/deployment-frontend.yaml`: Definição do deployment do frontend.
- `k8s/service-backend.yaml` / `k8s/service-frontend.yaml`: Serviços (ex: `ClusterIP`) para expor os pods internamente.
- `k8s/ingress.yaml`: Ingress para expor os serviços externamente (ex: via Nginx Ingress Controller).
- `k8s/pvc.yaml`: Persistent Volume Claim para dados persistentes (ex: banco de dados, uploads), requer um StorageClass configurado.
- `k8s/backend-hpa.yaml`: **HorizontalPodAutoscaler** para escalar automaticamente os pods do backend com base no uso de CPU (requer Metrics Server instalado).

### Implantação (Exemplo Geral)

```bash
# 1. Certifique-se que seu kubectl está configurado para o cluster correto
# 2. Crie um namespace (opcional)
# kubectl create namespace minha-app

# 3. Aplique os segredos (após preencher e codificar)
# kubectl apply -f k8s/secret.yaml -n minha-app

# 4. Aplique as configurações
# kubectl apply -f k8s/configmap.yaml -n minha-app

# 5. Aplique os PVCs
# kubectl apply -f k8s/pvc.yaml -n minha-app

# 6. Aplique os Deployments
# kubectl apply -f k8s/deployment-backend.yaml -n minha-app
# kubectl apply -f k8s/deployment-frontend.yaml -n minha-app

# 7. Aplique os Serviços
# kubectl apply -f k8s/service-backend.yaml -n minha-app
# kubectl apply -f k8s/service-frontend.yaml -n minha-app

# 8. Aplique o HPA para o backend
# kubectl apply -f k8s/backend-hpa.yaml -n minha-app

# 9. Aplique o Ingress (se aplicável)
# kubectl apply -f k8s/ingress.yaml -n minha-app

# Verifique o status
# kubectl get all -n minha-app
# kubectl get hpa -n minha-app
```

## 📂 Estrutura do Projeto (Backend - `backend/src/`)

```
src/
├── application/         # Casos de Uso (Services), DTOs, Adaptadores
│   ├── adapters/
│   ├── dtos/
│   └── services/
├── config/              # Configuração da aplicação (server, logger, swagger, env)
├── controllers/         # Controladores HTTP (recebem requisições)
├── domain/              # Lógica de Negócio Principal
│   ├── entities/        # Entidades de domínio
│   └── repositories/    # Interfaces dos Repositórios
├── infrastructure/      # Implementações de baixo nível
│   ├── database/        # Implementação Prisma dos Repositórios
│   └── payment/         # Implementação (simulada) de serviços externos
├── main/                # Configuração e inicialização (pode estar em config/)
├── middleware/          # Middlewares Express (log, erro, autenticação, etc.)
├── routes/              # Definição das rotas da API e JSDoc Swagger
├── services/            # Pode ser um alias para application/services
├── validators/          # Validadores de dados (ex: Zod)
└── server.ts            # Ponto de entrada da aplicação Express
```

## 🙌 Contribuição

Contribuições são bem-vindas! Por favor, abra uma issue ou um pull request.

## 📄 Licença

Este projeto está licenciado sob a Licença MIT. Veja o arquivo `LICENSE` para mais detalhes. 