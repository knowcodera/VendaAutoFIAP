FROM node:18-slim

WORKDIR /app

# Instala as dependências necessárias para o Prisma (OpenSSL) e sqlite3
RUN apt-get update -y && apt-get install -y openssl libssl-dev sqlite3

# Copia os arquivos de configuração
COPY package*.json ./

# Instala as dependências (incluindo devDependencies para o build)
RUN npm install --omit=optional

# Copia o código fonte e arquivos do Prisma
COPY . .

# Cria diretório para o banco de dados
RUN mkdir -p /app/database

# Gera o Prisma client
RUN npx prisma generate

# Comentar a etapa de build por enquanto para testar a execução direta
RUN npm run build

# Expõe a porta 3001
EXPOSE 3001

# Comando para iniciar a aplicação usando o script start
CMD [ "npm", "run", "dev" ] 