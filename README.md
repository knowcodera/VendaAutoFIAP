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
- `k8s/deployment.yaml`: Definição do deployment do backend. Por padrão configurado com 3 réplicas para alta disponibilidade.
- `k8s/service.yaml`: Serviço para expor os pods internamente.
- `k8s/ingress.yaml`: Ingress para expor os serviços externamente (ex: via Nginx Ingress Controller).
- `k8s/pvc.yaml`: Persistent Volume Claim para dados persistentes (ex: banco de dados, uploads), requer um StorageClass configurado.
- `k8s/backend-hpa.yaml`: **HorizontalPodAutoscaler** para escalar automaticamente os pods do backend com base no uso de CPU (requer Metrics Server instalado).

### Implantação Passo a Passo

```bash
# 1. Certifique-se que seu kubectl está configurado para o cluster correto
kubectl version

# 2. Crie um namespace para o projeto
kubectl create namespace carro-vendido

# 3. Configure o banco de dados no ConfigMap
kubectl apply -f k8s/configmap.yaml -n carro-vendido

# 4. Aplique os segredos
kubectl apply -f k8s/secret.yaml -n carro-vendido

# 5. Aplique o PVC para persistência de dados
kubectl apply -f k8s/pvc.yaml -n carro-vendido

# 6. Construa a imagem Docker do backend se ainda não estiver disponível
docker build -t carro-vendido-api:latest ./backend

# 7. Aplique o Deployment (por padrão com 3 réplicas)
kubectl apply -f k8s/deployment.yaml -n carro-vendido

# 8. Aplique o Serviço para expor os pods
kubectl apply -f k8s/service.yaml -n carro-vendido

# 9. Aplique o HPA para auto-escala
kubectl apply -f k8s/backend-hpa.yaml -n carro-vendido

# 10. Aplique o Ingress para acesso externo
kubectl apply -f k8s/ingress.yaml -n carro-vendido

# Verifique o status dos recursos
kubectl get pods -n carro-vendido
kubectl get svc -n carro-vendido
kubectl get ingress -n carro-vendido
kubectl get hpa -n carro-vendido
```

### Ajustando o Número de Réplicas

Você pode aumentar ou diminuir o número de réplicas de duas maneiras:

1. **Editando o arquivo deployment.yaml** (para mudanças permanentes):
   ```yaml
   # Em k8s/deployment.yaml
   spec:
     replicas: 3  # Altere este valor para o número desejado
   ```
   Depois aplique as alterações:
   ```bash
   kubectl apply -f k8s/deployment.yaml -n carro-vendido
   ```

2. **Usando o comando scale** (para mudanças rápidas):
   ```bash
   kubectl scale deployment carro-vendido-api --replicas=4 -n carro-vendido
   ```

### Acessando a Aplicação

Para acessar a aplicação implantada no Kubernetes:

1. **Via Ingress**: adicione uma entrada no arquivo hosts:
   ```
   127.0.0.1 api.carrovendido.com.br
   ```
   E acesse: `http://api.carrovendido.com.br`

2. **Via Port Forward** (para testes rápidos):
   ```bash
   kubectl port-forward -n carro-vendido svc/carro-vendido-api 3000:80
   ```
   E acesse: `http://localhost:3000`

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