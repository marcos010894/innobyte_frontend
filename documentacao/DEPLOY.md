# 🚀 Deploy do Frontend no Fly.io

## 📋 Pré-requisitos

1. **Instalar Fly.io CLI**:
```bash
# macOS
brew install flyctl

# Linux
curl -L https://fly.io/install.sh | sh

# Windows
powershell -Command "iwr https://fly.io/install.ps1 -useb | iex"
```

2. **Login no Fly.io**:
```bash
flyctl auth login
```

## 🔧 Configuração

### 1. Ajustar URL do Backend

Edite o arquivo `.env.production` com a URL correta do seu backend:
```env
VITE_API_URL=https://seu-backend.fly.dev/api
```

### 2. Ajustar nome da aplicação (opcional)

Edite o arquivo `fly.toml` e altere o nome da app se desejar:
```toml
app = "etiquetas-sys-frontend"  # Altere aqui
```

## 🚀 Deploy

### Primeira vez (criar aplicação):

```bash
# 1. Criar a aplicação no Fly.io
flyctl launch --no-deploy

# 2. Confirmar as configurações:
#    - Nome: etiquetas-sys-frontend (ou outro)
#    - Região: São Paulo (gru)
#    - Banco de dados: Não (N)
#    - Redis: Não (N)

# 3. Fazer o deploy
flyctl deploy
```

### Deploys subsequentes:

```bash
# Deploy simples
flyctl deploy

# Deploy com logs em tempo real
flyctl deploy --verbose
```

## 📊 Comandos Úteis

```bash
# Ver logs em tempo real
flyctl logs

# Ver status da aplicação
flyctl status

# Abrir aplicação no browser
flyctl open

# Ver informações da aplicação
flyctl info

# SSH na máquina (se precisar debugar)
flyctl ssh console

# Ver uso de recursos
flyctl dashboard

# Escalar máquinas (aumentar recursos)
flyctl scale memory 512  # 512MB de RAM

# Ver custos
flyctl billing
```

## 🔍 Verificação

Após o deploy, acesse:
- **Aplicação**: https://etiquetas-sys-frontend.fly.dev
- **Health Check**: https://etiquetas-sys-frontend.fly.dev/health

## 🐛 Troubleshooting

### Problema: Aplicação não carrega

```bash
# Ver logs detalhados
flyctl logs --app etiquetas-sys-frontend

# Verificar se está rodando
flyctl status

# Reiniciar aplicação
flyctl apps restart etiquetas-sys-frontend
```

### Problema: Erro de build

```bash
# Fazer build local para testar
docker build -t test-frontend .
docker run -p 8080:8080 test-frontend

# Acessar: http://localhost:8080
```

### Problema: API não conecta

1. Verificar `.env.production` com URL correta do backend
2. Verificar se backend permite CORS para o domínio do frontend
3. Adicionar domínio do frontend no backend (CORS)

## 🌍 Variáveis de Ambiente

Para adicionar variáveis de ambiente em produção:

```bash
flyctl secrets set VITE_API_URL=https://seu-backend.fly.dev/api
flyctl secrets list
```

## 💰 Custos

O Fly.io oferece:
- **Free tier**: 3 máquinas shared-cpu com 256MB RAM
- **Auto sleep**: Máquinas dormem quando não usadas
- **Auto wake**: Acordam automaticamente quando recebem requisição

**Este frontend deve rodar no free tier!** 🎉

## 🔐 Domínio Customizado (Opcional)

Se quiser usar seu próprio domínio:

```bash
# Adicionar certificado SSL automático
flyctl certs add seudominio.com.br

# Ver status do certificado
flyctl certs show seudominio.com.br

# Adicionar registro DNS:
# CNAME: seudominio.com.br -> etiquetas-sys-frontend.fly.dev
```

## 📝 Estrutura dos Arquivos

- **fly.toml**: Configuração da aplicação Fly.io
- **Dockerfile**: Build multi-stage (React + Nginx)
- **nginx.conf**: Configuração do servidor web
- **.dockerignore**: Arquivos ignorados no build
- **.env.production**: Variáveis de ambiente para produção

## 🔄 CI/CD (Opcional)

Para deploy automático via GitHub Actions, crie `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Fly.io

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: superfly/flyctl-actions/setup-flyctl@master
      - run: flyctl deploy --remote-only
        env:
          FLY_API_TOKEN: ${{ secrets.FLY_API_TOKEN }}
```

Adicionar token: Settings > Secrets > New repository secret
- Nome: `FLY_API_TOKEN`
- Valor: Obter com `flyctl auth token`

---

**Pronto! Seu frontend React está configurado para deploy no Fly.io!** 🎊
