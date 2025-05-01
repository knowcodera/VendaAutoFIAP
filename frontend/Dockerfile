# Estágio de build
FROM node:18-alpine AS build

WORKDIR /app

# Copia os arquivos de configuração
COPY package*.json ./
# COPY bun.lockb ./ # Comentado pois estamos usando npm/package-lock.json

# Instala as dependências
RUN npm ci

# Copia o código fonte
COPY . .

# Constrói a aplicação
RUN npm run build

# Estágio de produção
FROM nginx:stable-alpine

# Copia os arquivos de build para o diretório do Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Copia configuração personalizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 80
EXPOSE 80

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"] 