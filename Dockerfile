# Etapa 1: Build da aplicação React
FROM node:18-alpine AS builder

WORKDIR /app

# Copia package.json e package-lock.json
COPY package*.json ./

# Instala as dependências
RUN npm ci

# Copia o código fonte
COPY . .

# Build da aplicação
RUN npm run build

# Etapa 2: Servidor Nginx para servir os arquivos estáticos
FROM nginx:alpine

# Remove a configuração padrão do Nginx
RUN rm -rf /usr/share/nginx/html/*

# Copia os arquivos buildados do React
COPY --from=builder /app/dist /usr/share/nginx/html

# Copia a configuração customizada do Nginx
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expõe a porta 8080
EXPOSE 8080

# Inicia o Nginx
CMD ["nginx", "-g", "daemon off;"]
