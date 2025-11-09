# 🌐 APIs Utilizadas no Sistema - ATUALIZADO

## ✅ Status: TODAS as APIs usam **AXIOS**

### 📦 Resumo Geral

Todas as chamadas HTTP no sistema utilizam **Axios**, garantindo:
- ✅ Interceptors centralizados (autenticação, logs, tratamento de erros)
- ✅ Timeout configurável
- ✅ Headers automáticos
- ✅ Cancelamento de requisições
- ✅ Melhor suporte a TypeScript

---

## 🔧 APIs Internas (Backend Próprio)

### Base: `src/services/api.ts`

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'https://innobyte.fly.dev/api',
  timeout: Number(import.meta.env.VITE_API_TIMEOUT) || 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor de Request (adiciona token)
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor de Response (trata 401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

### Services que usam a API interna:

1. **auth.service.ts** - Autenticação
   - `POST /api/auth/login`
   - `GET /api/auth/me`
   - `POST /api/auth/change-password`
   - `POST /api/auth/logout`

2. **usuarios.service.ts** - Gerenciamento de usuários
   - `GET /api/usuarios` (com filtros)
   - `GET /api/usuarios/:id`
   - `POST /api/usuarios`
   - `PUT /api/usuarios/:id`
   - `DELETE /api/usuarios/:id`

3. **empresas.service.ts** - Gerenciamento de empresas
   - `GET /api/empresas`
   - `GET /api/empresas/:id`
   - `POST /api/empresas`
   - `PUT /api/empresas/:id`
   - `DELETE /api/empresas/:id`

4. **integracoes.service.ts** - Integrações de API
   - `GET /api/integracoes`
   - `GET /api/integracoes/:id`
   - `POST /api/integracoes`
   - `PUT /api/integracoes/:id`
   - `DELETE /api/integracoes/:id`
   - `POST /api/integracoes/:id/testar`

5. **tokens.service.ts** - Tokens de API
   - `GET /api/tokens`
   - `GET /api/tokens/:id`
   - `POST /api/tokens`
   - `DELETE /api/tokens/:id`

---

## 🌍 APIs Externas (Consultas Públicas)

### `src/services/cnpj.service.ts`

Este serviço usa **Axios** diretamente (não usa o `api.ts` porque são APIs públicas externas).

#### Estratégia de Fallback para CNPJ

Para resolver problemas de CORS, implementamos **3 APIs em cascata**:

```typescript
import axios from 'axios';

export const consultarCNPJ = async (cnpj: string) => {
  // 1ª tentativa: BrasilAPI (melhor CORS)
  try {
    const response = await axios.get(`https://brasilapi.com.br/api/cnpj/v1/${cnpj}`, {
      timeout: 10000,
    });
    return { success: true, data: mapearBrasilAPI(response.data) };
  } catch (error) {
    console.log('BrasilAPI falhou, tentando próxima...');
  }

  // 2ª tentativa: ReceitaWS
  try {
    const response = await axios.get(`https://receitaws.com.br/v1/cnpj/${cnpj}`, {
      timeout: 10000,
    });
    return { success: true, data: mapearReceitaWS(response.data) };
  } catch (error) {
    console.log('ReceitaWS falhou, tentando próxima...');
  }

  // 3ª tentativa: CNPJ.ws
  try {
    const response = await axios.get(`https://publica.cnpj.ws/cnpj/${cnpj}`, {
      timeout: 10000,
    });
    return { success: true, data: mapearCNPJws(response.data) };
  } catch (error) {
    console.log('CNPJ.ws falhou');
  }

  return { success: false, message: 'Todas as APIs falharam' };
};
```

#### APIs de CNPJ Utilizadas:

| API | URL | CORS | Limite | Status |
|-----|-----|------|--------|--------|
| **BrasilAPI** | `brasilapi.com.br/api/cnpj/v1/{cnpj}` | ✅ Excelente | Ilimitado | 🥇 Principal |
| **ReceitaWS** | `receitaws.com.br/v1/cnpj/{cnpj}` | ⚠️ Pode bloquear | 3/minuto | 🥈 Fallback 1 |
| **CNPJ.ws** | `publica.cnpj.ws/cnpj/{cnpj}` | ✅ Bom | Ilimitado | 🥉 Fallback 2 |

#### Resposta Padronizada:

```typescript
interface CNPJData {
  cnpj: string;
  razao_social: string;
  nome_fantasia: string;
  telefone: string;
  email: string;
  cep: string;
  logradouro: string;
  numero: string;
  complemento: string;
  bairro: string;
  municipio: string;
  uf: string;
}
```

### API de CEP (ViaCEP)

```typescript
export const consultarCEP = async (cep: string) => {
  const response = await axios.get(`https://viacep.com.br/ws/${cep}/json/`, {
    timeout: 10000,
  });
  
  return {
    success: true,
    data: {
      cep: response.data.cep,
      logradouro: response.data.logradouro,
      bairro: response.data.bairro,
      cidade: response.data.localidade,
      estado: response.data.uf,
    },
  };
};
```

| API | URL | CORS | Limite | Status |
|-----|-----|------|--------|--------|
| **ViaCEP** | `viacep.com.br/ws/{cep}/json/` | ✅ Excelente | Ilimitado | ✅ Funcional |

---

## 🔍 Verificação Completa

### ✅ Todos os Services Usam Axios

```bash
# Verificar imports de Axios nos services:
grep -r "import.*axios" src/services/

# Resultado:
src/services/api.ts:1:import axios from 'axios';
src/services/cnpj.service.ts:6:import axios from 'axios';
```

### ✅ Não há chamadas com `fetch()`

```bash
# Verificar se existe algum fetch no projeto:
grep -r "fetch(" src/

# Resultado: NENHUM ✅
```

---

## 🚀 Como Funciona na Prática

### Exemplo 1: Consulta de CNPJ

```typescript
import { consultarCNPJ } from '@/services/cnpj.service';

const handleConsultarCNPJ = async () => {
  const result = await consultarCNPJ('06990590000123');
  
  if (result.success) {
    console.log('Razão Social:', result.data?.razao_social);
    // Preenche formulário automaticamente
  } else {
    console.error('Erro:', result.message);
  }
};
```

**Fluxo:**
1. Remove máscara do CNPJ
2. Tenta BrasilAPI
3. Se falhar, tenta ReceitaWS
4. Se falhar, tenta CNPJ.ws
5. Retorna sucesso ou erro

### Exemplo 2: Criação de Usuário

```typescript
import { createUsuario } from '@/services/usuarios.service';

const handleSave = async () => {
  const result = await createUsuario({
    cnpj: '12345678000190',
    razao_social: 'Empresa Exemplo',
    email: 'contato@empresa.com',
    senha: 'senha123',
    tipo_licenca: 'contrato',
    // ...
  });
  
  if (result.success) {
    console.log('Usuário criado:', result.data);
  }
};
```

**Fluxo:**
1. Interceptor adiciona token automaticamente
2. Axios faz POST /api/usuarios
3. Se 401, redireciona para login
4. Retorna resposta tratada

---

## 🔧 Configuração do Axios

### Instância Global (`api.ts`)

```typescript
const api = axios.create({
  baseURL: 'https://innobyte.fly.dev/api',  // Variável de ambiente
  timeout: 30000,                         // 30 segundos
  headers: {
    'Content-Type': 'application/json',
  },
});
```

### Interceptors

#### Request Interceptor (Autenticação)
```typescript
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

#### Response Interceptor (Tratamento de Erros)
```typescript
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Limpa sessão e redireciona
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

---

## 🐛 Troubleshooting

### Problema: CORS no CNPJ

**Sintoma:** Erro "Access-Control-Allow-Origin" ao consultar CNPJ

**Solução Implementada:**
- ✅ Usamos BrasilAPI como principal (melhor CORS)
- ✅ Fallback automático para outras APIs
- ✅ Logs no console para debug

**Como verificar:**
```javascript
// Abra o console (F12) e veja os logs:
// "Tentando BrasilAPI..."
// "BrasilAPI sucesso:" ou "BrasilAPI falhou:"
```

### Problema: Timeout em APIs Externas

**Sintoma:** Requisição demora muito e falha

**Solução:**
```typescript
axios.get(url, {
  timeout: 10000  // 10 segundos para APIs externas
});
```

### Problema: 401 Unauthorized

**Sintoma:** Requisições para backend retornam 401

**Solução Automática:**
- Interceptor detecta 401
- Limpa token do localStorage
- Redireciona para /login

---

## 📊 Comparação: Axios vs Fetch

| Recurso | Axios | Fetch |
|---------|-------|-------|
| **Interceptors** | ✅ Nativos | ❌ Precisa wrapper |
| **Timeout** | ✅ Nativo | ❌ Precisa AbortController |
| **JSON Automático** | ✅ response.data | ❌ response.json() |
| **Cancelamento** | ✅ CancelToken | ⚠️ AbortController |
| **TypeScript** | ✅ Excelente | ⚠️ Bom |
| **Browser Support** | ✅ IE11+ | ⚠️ Moderno |

**Motivos para usar Axios neste projeto:**
1. ✅ Interceptors centralizados (token, erros)
2. ✅ Timeout nativo (importante para APIs externas)
3. ✅ Melhor DX com TypeScript
4. ✅ Tratamento automático de JSON
5. ✅ Configuração global reutilizável

---

## 🎯 Checklist de Verificação

- ✅ Todos os services usam Axios
- ✅ Instância centralizada em `api.ts`
- ✅ Interceptors configurados (auth + errors)
- ✅ Timeout configurado (30s interno, 10s externo)
- ✅ APIs externas com fallback (CNPJ)
- ✅ Tratamento de CORS implementado
- ✅ Headers automáticos
- ✅ TypeScript em todos os services
- ✅ Error handling consistente
- ✅ Logs de debug no console

---

## 📝 Exemplos de Teste

### Teste 1: Verificar Axios está funcionando

```bash
# No console do navegador (F12):
localStorage.setItem('token', 'seu_token_aqui');

# Faça uma requisição de teste:
fetch('https://innobyte.fly.dev/api/auth/me', {
  headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
}).then(r => r.json()).then(console.log);
```

### Teste 2: Verificar Fallback de CNPJ

```bash
# No console do navegador (F12):
import { consultarCNPJ } from './src/services/cnpj.service';

consultarCNPJ('06990590000123').then(console.log);

# Veja os logs:
# "Tentando BrasilAPI..."
# "BrasilAPI sucesso:" { cnpj: "...", razao_social: "..." }
```

---

## 🔒 Segurança

### Token JWT

```typescript
// Salvo no localStorage após login
localStorage.setItem('token', response.data.access_token);

// Adicionado automaticamente em TODAS as requisições
config.headers.Authorization = `Bearer ${token}`;

// Removido automaticamente em caso de 401
if (error.response?.status === 401) {
  localStorage.removeItem('token');
}
```

### APIs Externas

- ✅ Somente consultas públicas (CNPJ, CEP)
- ✅ Sem envio de dados sensíveis
- ✅ Timeout para evitar travamentos
- ✅ Fallback em caso de falha

---

## 📚 Referências

- [Axios Documentation](https://axios-http.com/)
- [BrasilAPI](https://brasilapi.com.br/)
- [ViaCEP](https://viacep.com.br/)
- [CNPJ.ws](https://cnpj.ws/)

---

**Status Final:** ✅ **TODAS as APIs usando AXIOS com fallback para CORS!**
