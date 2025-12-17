# 🔧 Variáveis de Ambiente no Fly.io

## 📋 Resumo

Para variáveis `VITE_*` no frontend React, existem 3 formas:

### ✅ **Opção 1: `.env.production`** (Atual - Recomendado)

**Status**: ✅ Já configurado e funcionando!

```bash
# .env.production
VITE_API_URL=https://innobyte.fly.dev/
```

**Como funciona**:
1. Arquivo `.env.production` está no repositório
2. Durante o build Docker, o Vite lê automaticamente
3. Variáveis são **injetadas no bundle** em build time
4. Funciona perfeitamente! ✅

**Vantagens**:
- ✅ Simples e direto
- ✅ Versionado no Git
- ✅ Fácil de mudar
- ✅ Não precisa configurar nada no Fly.io

**Para alterar**:
```bash
# 1. Editar .env.production
VITE_API_URL=https://nova-url.fly.dev/api

# 2. Fazer deploy
flyctl deploy
```

---

### 🔐 **Opção 2: Fly.io Secrets** (NÃO recomendado para VITE_*)

```bash
flyctl secrets set VITE_API_URL=https://innobyte.fly.dev/
```

**⚠️ PROBLEMA**: Fly.io secrets são injetados em **runtime**, mas Vite precisa delas em **build time**.

**Não funciona bem para variáveis `VITE_*`!** ❌

---

### 🛠️ **Opção 3: Build Args no Dockerfile** (Avançado)

Se quiser passar a URL via comando, modifique o Dockerfile:

```dockerfile
# Etapa 1: Build da aplicação React
FROM node:18-alpine AS builder

# Aceitar URL como build argument
ARG VITE_API_URL=https://innobyte.fly.dev/
ENV VITE_API_URL=$VITE_API_URL

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build com a variável de ambiente
RUN npm run build

# ... resto do Dockerfile
```

E no `fly.toml`:

```toml
[build]
  dockerfile = "Dockerfile"
  [build.args]
    VITE_API_URL = "https://innobyte.fly.dev/"
```

**Deploy com URL customizada**:
```bash
flyctl deploy --build-arg VITE_API_URL=https://nova-url.fly.dev/api
```

---

## 🎯 Qual usar?

| Situação | Opção | Dificuldade |
|----------|-------|-------------|
| URL fixa, simples | **Opção 1** (`.env.production`) ✅ | Fácil |
| URL muda por ambiente | **Opção 3** (Build args) | Médio |
| Dados sensíveis runtime | Secrets (mas não para VITE_*) | Fácil |

---

## 📝 Configuração Atual

✅ **Sua configuração atual** (Opção 1):

```bash
# .env.production
VITE_API_URL=https://innobyte.fly.dev/
NODE_ENV=production
```

**Está perfeito e pronto para deploy!** 🎉

---

## 🚀 Como Fazer Deploy

Com a URL já configurada:

```bash
# Método 1: Script automático
./deploy.sh

# Método 2: Manual
flyctl deploy
```

O Fly.io vai:
1. Copiar `.env.production` para dentro do Docker
2. Rodar `npm run build` (Vite lê o .env.production)
3. Gerar bundle com `VITE_API_URL=https://innobyte.fly.dev/`
4. Servir via Nginx

---

## 🔍 Verificar Variáveis no Build

Para ver se a URL está correta após build:

```bash
# Fazer deploy
flyctl deploy

# Abrir app
flyctl open

# Abrir DevTools (F12) > Console
# Testar:
console.log(import.meta.env.VITE_API_URL)
// Deve mostrar: https://innobyte.fly.dev/
```

---

## 🐛 Troubleshooting

### Variável não está sendo usada?

1. **Verificar nome**: Deve começar com `VITE_`
2. **Rebuild**: `flyctl deploy` (não apenas restart)
3. **Cache do browser**: Ctrl+Shift+R (hard refresh)
4. **Verificar build local**: 
   ```bash
   npm run build
   grep -r "innobyte.fly.dev" dist/
   ```

### Mudar URL depois do deploy?

```bash
# 1. Editar .env.production
vim .env.production

# 2. Commit (opcional)
git add .env.production
git commit -m "Update API URL"

# 3. Deploy novamente
flyctl deploy
```

---

## 📚 Documentação Relacionada

- [Vite Env Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Fly.io Build Args](https://fly.io/docs/reference/build/)
- [Docker Build Args](https://docs.docker.com/engine/reference/builder/#arg)

---

## ✅ Resumo

**Sua configuração está pronta!** ✨

```bash
# URL configurada em:
.env.production

# Para fazer deploy:
flyctl deploy

# Para mudar URL:
# 1. Editar .env.production
# 2. flyctl deploy
```

**Simples assim!** 🎉
