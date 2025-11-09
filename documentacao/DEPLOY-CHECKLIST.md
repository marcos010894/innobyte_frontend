# ✅ Checklist de Deploy - Frontend Fly.io

## 📋 Antes do Deploy

### 1. Configuração Básica
- [ ] Fly.io CLI instalado (`brew install flyctl`)
- [ ] Login feito (`flyctl auth login`)
- [ ] URL do backend configurada em `.env.production`
- [ ] Nome da app definido em `fly.toml` (opcional)

### 2. Verificar Arquivos
- [ ] `fly.toml` - Configuração do Fly.io ✅
- [ ] `Dockerfile` - Build multi-stage ✅
- [ ] `nginx.conf` - Config do servidor ✅
- [ ] `.dockerignore` - Otimização do build ✅
- [ ] `.env.production` - Variáveis de ambiente ✅

### 3. Teste Local (Opcional)
- [ ] Build local funciona: `npm run build`
- [ ] Preview funciona: `npm run preview`
- [ ] Docker build funciona: `docker build -t test-frontend .`
- [ ] Docker run funciona: `docker run -p 8080:8080 test-frontend`

## 🚀 Deploy

### Primeira Vez
```bash
# 1. Criar aplicação
flyctl launch --no-deploy

# 2. Confirmar configurações
#    - Nome: etiquetas-sys-frontend
#    - Região: São Paulo (gru)
#    - Não adicionar DB
#    - Não adicionar Redis

# 3. Deploy
flyctl deploy
```

### Deploy Subsequente
```bash
# Opção 1: Script automático
./deploy.sh

# Opção 2: Manual
flyctl deploy
```

## 🔍 Pós-Deploy

### 1. Verificações Automáticas
- [ ] Deploy concluído sem erros
- [ ] Status: `flyctl status` mostra "healthy"
- [ ] Logs: `flyctl logs` sem erros críticos

### 2. Verificações Manuais
- [ ] App abre: `flyctl open` ou acesse a URL
- [ ] Health check: `https://seu-app.fly.dev/health` retorna "healthy"
- [ ] Login funciona
- [ ] Dashboard carrega
- [ ] Navegação entre páginas funciona
- [ ] API se conecta (teste criar/editar algo)

### 3. Performance
- [ ] Página carrega em < 3 segundos
- [ ] Assets são cacheados (ver Network no DevTools)
- [ ] Compressão gzip ativa (ver Response Headers)

## 🐛 Troubleshooting

### Deploy falha
```bash
# Ver logs detalhados
flyctl logs --verbose

# Verificar build local
npm run build

# Testar Docker local
docker build -t test .
docker run -p 8080:8080 test
```

### App não carrega
```bash
# Ver status
flyctl status

# Ver logs em tempo real
flyctl logs

# Reiniciar
flyctl apps restart etiquetas-sys-frontend
```

### API não conecta
- [ ] Verificar VITE_API_URL em `.env.production`
- [ ] Verificar CORS no backend
- [ ] Adicionar domínio do frontend no backend
- [ ] Verificar logs do backend: `flyctl logs -a etiquetas-sys-backend`

### Erro 502/503
- [ ] Máquina pode estar dormindo (aguardar 10-15s)
- [ ] Verificar memória: `flyctl status`
- [ ] Escalar se necessário: `flyctl scale memory 512`

## 💰 Custos

- **Free tier**: ✅ Este app deve rodar grátis
- **Uso**: 1 máquina shared-cpu 256MB
- **Auto sleep**: Sim (economia de recursos)
- **Auto wake**: Sim (acorda ao receber request)

## 🔄 Atualizações Futuras

Sempre que alterar o código:

```bash
# 1. Commit as alterações
git add .
git commit -m "feat: nova funcionalidade"

# 2. Deploy
./deploy.sh
# ou
flyctl deploy

# 3. Verificar
flyctl logs
flyctl open
```

## 📊 Monitoramento

```bash
# Ver métricas
flyctl dashboard

# Ver uso de CPU/RAM
flyctl status

# Ver logs históricos
flyctl logs --json > logs.json

# Ver custos
flyctl billing
```

## 🎯 Comandos Essenciais

```bash
flyctl deploy              # Deploy
flyctl logs                # Ver logs
flyctl status              # Ver status
flyctl open                # Abrir no browser
flyctl apps restart        # Reiniciar
flyctl secrets set KEY=VAL # Adicionar secret
flyctl scale memory 512    # Aumentar RAM
flyctl ssh console         # SSH na máquina
```

---

## ✅ Tudo Pronto!

Se todos os checkboxes estão marcados, sua aplicação está:
- ✅ Configurada corretamente
- ✅ Deployada no Fly.io
- ✅ Acessível via HTTPS
- ✅ Com cache otimizado
- ✅ Monitorada e saudável

**Parabéns! 🎉**
