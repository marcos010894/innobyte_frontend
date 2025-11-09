# 🚀 Quick Start - Deploy Fly.io

## 📦 Instalação Fly.io CLI

```bash
# macOS
brew install flyctl

# Fazer login
flyctl auth login
```

## ⚙️ Configuração Rápida

1. **Editar URL do Backend** (`.env.production`):
```env
VITE_API_URL=https://seu-backend.fly.dev/api
```

2. **Editar nome da app** (opcional - `fly.toml`):
```toml
app = "etiquetas-sys-frontend"
```

## 🚀 Deploy

### Primeira vez:
```bash
# Criar app
flyctl launch --no-deploy

# Fazer deploy
flyctl deploy
```

### Deploy normal:
```bash
# Opção 1: Usando script
./deploy.sh

# Opção 2: Direto
flyctl deploy
```

## 📊 Comandos Úteis

```bash
flyctl logs          # Ver logs
flyctl status        # Ver status
flyctl open          # Abrir no browser
flyctl apps restart  # Reiniciar
```

## ✅ Verificar Deploy

Após deploy, acesse:
- **App**: https://etiquetas-sys-frontend.fly.dev
- **Health**: https://etiquetas-sys-frontend.fly.dev/health

## 🐛 Problemas?

```bash
# Ver logs detalhados
flyctl logs --verbose

# Testar build local
docker build -t test .
docker run -p 8080:8080 test
# Acessar: http://localhost:8080
```

---

Para documentação completa, veja: **[DEPLOY.md](./DEPLOY.md)**
