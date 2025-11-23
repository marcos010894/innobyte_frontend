# 🔐 Como Funciona o Login - Guia Visual

## 🎯 Tela de Login Completa

Quando você acessa `http://localhost:5173/login`, verá esta tela:

```
┌──────────────────────────────────────────────────┐
│                                                  │
│         Sistema de Etiquetas                     │
│         Bem-vindo de volta!                      │
│                                                  │
│  ┌────────────────────────────────────────────┐ │
│  │  [👤 Cliente]  │  [👑 Administrador]     │ │
│  │    ATIVO       │      INATIVO             │ │
│  └────────────────────────────────────────────┘ │
│                                                  │
│  E-mail                                          │
│  ┌──────────────────────────────────────────┐   │
│  │ seu@email.com                            │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Senha                                           │
│  ┌──────────────────────────────────────────┐   │
│  │ ••••••••                                 │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  ┌──────────────────────────────────────────┐   │
│  │         Entrar 👤                        │   │
│  └──────────────────────────────────────────┘   │
│                                                  │
│  Problemas com sua conta?                        │
│  Entre em contato                                │
│                                                  │
└──────────────────────────────────────────────────┘
```

---

## 🔄 Como Escolher o Tipo de Login

### 1️⃣ **Por Padrão - Cliente Selecionado**

Quando a página carrega, **Cliente** já vem selecionado:

```
┌────────────────────────────────────────────┐
│  [👤 Cliente]  │  [👑 Administrador]     │
│    BRANCO      │      CINZA              │
│    ATIVO ✓     │      INATIVO            │
└────────────────────────────────────────────┘
```

- **Cliente**: Fundo branco + texto azul + sombra
- **Administrador**: Fundo transparente + texto cinza

---

### 2️⃣ **Clicando em "Cliente"**

Se você clicar em **"👤 Cliente"**:

```typescript
Estado: tipoLogin = 'cliente'
Endpoint usado: /api/auth/login-cliente
```

**Visual:**
```
┌────────────────────────────────────────────┐
│  [👤 Cliente]  │  [👑 Administrador]     │
│  ✅ SELECIONADO │      Clique aqui       │
└────────────────────────────────────────────┘
```

**Comportamento:**
- Fundo **branco**
- Texto **azul (primary)**
- **Sombra** suave
- Ao clicar "Entrar", chama `loginCliente()`
- Endpoint: `POST /api/auth/login-cliente`

---

### 3️⃣ **Clicando em "Administrador"**

Se você clicar em **"👑 Administrador"**:

```typescript
Estado: tipoLogin = 'master'
Endpoint usado: /api/auth/login
```

**Visual:**
```
┌────────────────────────────────────────────┐
│  [👤 Cliente]  │  [👑 Administrador]     │
│   Clique aqui   │  ✅ SELECIONADO        │
└────────────────────────────────────────────┘
```

**Comportamento:**
- Fundo **branco**
- Texto **azul (primary)**
- **Sombra** suave
- Ao clicar "Entrar", chama `loginMaster()`
- Endpoint: `POST /api/auth/login`

---

## 🎬 Fluxo Completo de Login

### Login como CLIENTE

```
1. Usuário acessa: http://localhost:5173/login
   ↓
2. Vê a tela com "👤 Cliente" JÁ SELECIONADO
   ↓
3. Digite o email (ex: cliente@empresa.com)
   ↓
4. Digite a senha
   ↓
5. Clique em "Entrar 👤"
   ↓
6. Sistema executa:
   const result = await loginCliente(email, senha);
   ↓
7. Faz requisição:
   POST http://127.0.0.1:8000//auth/login-cliente
   Body: {
     "email": "cliente@empresa.com",
     "password": "senha123"
   }
   ↓
8. Backend valida:
   ✅ Credenciais corretas?
   ✅ Conta ativa?
   ✅ Licença não bloqueada?
   ✅ Licença não vencida?
   ↓
9. Backend retorna:
   {
     "access_token": "eyJhbGci...",
     "token_type": "bearer",
     "user": {
       "id": 1,
       "email": "cliente@empresa.com",
       "tipo": "cliente",
       "licenca": { ... }
     }
   }
   ↓
10. Frontend salva:
    localStorage.setItem('access_token', token)
    localStorage.setItem('user_type', 'cliente')
    ↓
11. Redireciona para:
    http://localhost:5173/dashboard
```

### Login como MASTER

```
1. Usuário acessa: http://localhost:5173/login
   ↓
2. Vê "👤 Cliente" selecionado
   ↓
3. CLICA EM "👑 Administrador"
   ↓
4. Botão muda de cor (fica branco/azul)
   ↓
5. Digite o email (ex: admin@sistema.com)
   ↓
6. Digite a senha
   ↓
7. Clique em "Entrar 👑"
   ↓
8. Sistema executa:
   const result = await loginMaster(email, senha);
   ↓
9. Faz requisição:
   POST http://127.0.0.1:8000//auth/login
   Body: {
     "email": "admin@sistema.com",
     "password": "senha123"
   }
   ↓
10. Backend valida credenciais
    ↓
11. Backend retorna:
    {
      "access_token": "eyJhbGci...",
      "token_type": "bearer",
      "user": {
        "id": 1,
        "email": "admin@sistema.com",
        "tipo": "master"
      }
    }
    ↓
12. Frontend salva:
    localStorage.setItem('access_token', token)
    localStorage.setItem('user_type', 'master')
    ↓
13. Redireciona para:
    http://localhost:5173/dashboard
```

---

## 🎨 Estados Visuais dos Botões

### Estado 1: Cliente Selecionado (Padrão)
```css
👤 Cliente
- background: white
- color: blue (primary)
- shadow: small
- font-weight: medium

👑 Administrador
- background: transparent
- color: gray-600
- shadow: none
- hover: text-gray-800
```

### Estado 2: Administrador Selecionado
```css
👤 Cliente
- background: transparent
- color: gray-600
- shadow: none
- hover: text-gray-800

👑 Administrador
- background: white
- color: blue (primary)
- shadow: small
- font-weight: medium
```

---

## 💻 Código por Trás

### Estado (useState)
```typescript
const [tipoLogin, setTipoLogin] = useState<TipoLogin>('cliente');
// Por padrão, começa como 'cliente'
```

### Botão Cliente
```typescript
<button
  type="button"
  onClick={() => setTipoLogin('cliente')}
  className={tipoLogin === 'cliente' 
    ? 'bg-white text-primary shadow-sm'  // Se selecionado
    : 'text-gray-600 hover:text-gray-800' // Se não selecionado
  }
>
  👤 Cliente
</button>
```

### Botão Master
```typescript
<button
  type="button"
  onClick={() => setTipoLogin('master')}
  className={tipoLogin === 'master'
    ? 'bg-white text-primary shadow-sm'  // Se selecionado
    : 'text-gray-600 hover:text-gray-800' // Se não selecionado
  }
>
  👑 Administrador
</button>
```

### Lógica de Submit
```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  const result = tipoLogin === 'master'
    ? await loginMaster(email, senha)    // Chama /api/auth/login
    : await loginCliente(email, senha);  // Chama /api/auth/login-cliente
  
  if (result.success) {
    navigate('/dashboard');
  }
};
```

---

## 🧪 Como Testar

### Teste 1: Login como Cliente
```
1. Acesse: http://localhost:5173/login
2. Veja que "👤 Cliente" JÁ está selecionado (fundo branco)
3. Digite email: cliente@empresa.com
4. Digite senha: sua_senha
5. Clique "Entrar"
6. Console mostra: "✅ Login Cliente realizado com sucesso"
7. Redireciona para /dashboard
8. Sidebar mostra apenas funcionalidades permitidas
```

### Teste 2: Login como Master
```
1. Acesse: http://localhost:5173/login
2. CLIQUE em "👑 Administrador"
3. Veja o botão mudar de cor (fundo branco)
4. Digite email: admin@sistema.com
5. Digite senha: sua_senha
6. Clique "Entrar"
7. Console mostra: "✅ Login Master realizado com sucesso"
8. Redireciona para /dashboard
9. Sidebar mostra TODAS as opções (incluindo Usuários)
```

---

## 🔍 Como Verificar Qual Tipo Foi Usado

### No Console do Navegador (F12)
```javascript
// Verificar tipo de login salvo
localStorage.getItem('user_type')
// Retorna: 'master' ou 'cliente'

// Verificar token
localStorage.getItem('access_token')
// Retorna: 'eyJhbGciOiJIUzI1NiIs...'
```

### No Network (F12 → Network)
```
Quando clica "Entrar", veja a requisição:

Cliente:
Request URL: http://127.0.0.1:8000//auth/login-cliente
Request Method: POST
Status Code: 200 OK

Master:
Request URL: http://127.0.0.1:8000//auth/login
Request Method: POST
Status Code: 200 OK
```

---

## ❓ Perguntas Frequentes

### 1. Como sei qual botão está selecionado?
**R:** O botão selecionado tem:
- ✅ Fundo **branco**
- ✅ Texto **azul**
- ✅ **Sombra** suave

O não selecionado tem:
- ❌ Fundo **transparente**
- ❌ Texto **cinza**

### 2. Posso mudar de tipo antes de fazer login?
**R:** Sim! Clique quantas vezes quiser entre Cliente e Administrador. O sistema só envia a requisição quando você clica em "Entrar".

### 3. O que acontece se eu esquecer de mudar para Master?
**R:** Se tentar logar como Master mas deixar "Cliente" selecionado, o backend vai retornar erro "E-mail ou senha incorretos" (porque a conta de Master não existe na tabela de clientes).

### 4. Onde está o código que decide qual endpoint usar?
**R:** Na linha 23-25 do `LoginPage.tsx`:
```typescript
const result = tipoLogin === 'master'
  ? await loginMaster(email, senha)    // /api/auth/login
  : await loginCliente(email, senha);  // /api/auth/login-cliente
```

---

## ✅ Resumo

**Para fazer login como CLIENTE:**
1. Acesse `/login`
2. Deixe "👤 Cliente" selecionado (já vem por padrão)
3. Digite email/senha
4. Clique "Entrar"
5. ✅ Usa endpoint: `/api/auth/login-cliente`

**Para fazer login como MASTER:**
1. Acesse `/login`
2. **CLIQUE em "👑 Administrador"**
3. Digite email/senha
4. Clique "Entrar"
5. ✅ Usa endpoint: `/api/auth/login`

**É simples assim!** 🎉
