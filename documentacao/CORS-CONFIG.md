# ⚠️ IMPORTANTE: Configurar CORS no Backend

Após fazer deploy do frontend no Fly.io, você **DEVE** configurar o CORS no backend para aceitar requisições do domínio do frontend.

## 🔧 Como Configurar

### 1. Obter URL do Frontend

Após o deploy, você terá uma URL como:
```
https://etiquetas-sys-frontend.fly.dev
```

### 2. Adicionar no Backend

No seu backend (FastAPI), adicione esta URL nas configurações de CORS:

```python
# backend/main.py ou similar

from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Configurar CORS
origins = [
    "http://localhost:3001",  # Desenvolvimento local
    "http://localhost:3000",
    "https://etiquetas-sys-frontend.fly.dev",  # ← ADICIONE ESTA LINHA
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

### 3. Fazer Deploy do Backend

Após adicionar a URL do frontend no CORS:

```bash
cd ../backend
flyctl deploy
```

### 4. Verificar

Teste se o frontend consegue se conectar ao backend:

1. Abra o frontend: `https://etiquetas-sys-frontend.fly.dev`
2. Tente fazer login
3. Abra o DevTools (F12) > Console
4. Se houver erro de CORS, você verá algo como:
   ```
   Access to fetch at 'https://backend.fly.dev/api/auth/login' from origin 
   'https://frontend.fly.dev' has been blocked by CORS policy
   ```

## 🔍 Checklist de Verificação

- [ ] URL do frontend adicionada no array `origins` do backend
- [ ] Backend com CORS configurado foi deployado
- [ ] Frontend consegue fazer login
- [ ] API calls funcionam (verificar DevTools > Network)
- [ ] Não há erros de CORS no console

## 🐛 Troubleshooting

### Ainda aparece erro de CORS?

1. **Verificar se backend foi deployado**:
```bash
cd ../backend
flyctl deploy
flyctl logs
```

2. **Verificar URL exata do frontend**:
```bash
cd ../frontend
flyctl status
# Copie a URL exata do "hostname"
```

3. **Verificar se backend aceita a origem**:
```bash
# Testar request CORS
curl -H "Origin: https://seu-frontend.fly.dev" \
     -H "Access-Control-Request-Method: POST" \
     -H "Access-Control-Request-Headers: Content-Type" \
     -X OPTIONS \
     https://seu-backend.fly.dev/api/auth/login
```

### Backend aceita qualquer origem (não recomendado para produção)

Se quiser aceitar qualquer origem **temporariamente** para teste:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # ⚠️ NÃO USE EM PRODUÇÃO!
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**⚠️ ATENÇÃO**: Isto é inseguro! Use apenas para debugging. Sempre especifique os domínios permitidos em produção.

## 📝 Configuração Recomendada para Produção

```python
import os
from fastapi.middleware.cors import CORSMiddleware

# Obter URLs permitidas do ambiente
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:3001,https://etiquetas-sys-frontend.fly.dev"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)
```

E configure via Fly.io secrets:

```bash
cd backend
flyctl secrets set ALLOWED_ORIGINS="http://localhost:3001,https://etiquetas-sys-frontend.fly.dev"
```

## ✅ Verificação Final

Após configurar tudo:

1. Frontend deployado ✅
2. Backend com CORS configurado ✅
3. Backend deployado ✅
4. Login funciona ✅
5. API calls funcionam ✅

**Se tudo estiver OK, seu sistema está funcionando em produção! 🎉**

---

**Para mais informações sobre CORS:**
- [FastAPI CORS Docs](https://fastapi.tiangolo.com/tutorial/cors/)
- [MDN CORS Guide](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)
