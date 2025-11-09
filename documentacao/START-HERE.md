## 🚀 TL;DR - Deploy Frontend no Fly.io

### ⚡ Ultra Rápido (30 segundos de leitura)

```bash
# 1. Instalar + Login
brew install flyctl && flyctl auth login

# 2. Configurar backend URL
echo 'VITE_API_URL=https://seu-backend.fly.dev/api' > .env.production

# 3. Deploy
./deploy.sh
```

**PRONTO!** Seu frontend estará no ar em ~5 minutos. 🎉

---

### 📖 Onde está a documentação?

| Se você quer... | Abra este arquivo | Tempo |
|-----------------|-------------------|-------|
| 🎯 Entender tudo | `INDEX.md` | 5 min |
| ⚡ Deploy agora | `DEPLOY-QUICKSTART.md` | 5 min |
| 📚 Referência completa | `DEPLOY.md` | 20 min |
| ✅ Checklist | `DEPLOY-CHECKLIST.md` | Durante deploy |
| 📦 Ver arquivos | `DEPLOY-FILES.md` | 5 min |
| 🔒 Configurar CORS | `CORS-CONFIG.md` | 5 min |

---

### ⚠️ NÃO ESQUEÇA!

Após deploy do frontend, **configure CORS no backend**:
```bash
# Veja CORS-CONFIG.md para detalhes
```

---

### 💰 Custa quanto?

**GRÁTIS!** Free tier do Fly.io. 🆓

---

### 🆘 Ajuda

```bash
flyctl logs    # Ver erros
flyctl status  # Ver se está rodando
flyctl open    # Abrir no browser
```

**Mais ajuda?** Veja `INDEX.md` → Seção "Casos de Uso"

---

**Feito! Agora é só fazer deploy! 🚀**
