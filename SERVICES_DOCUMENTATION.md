# 🚀 Estrutura de Serviços API - Documentação de Implementação

## ✅ Implementação Completa

### 📁 **Arquitetura de Services**

```
src/
├── services/
│   ├── api.ts                    ✅ Axios configurado com interceptors
│   ├── auth.service.ts           ✅ Login, logout, getMe, changePassword
│   ├── usuarios.service.ts       ✅ CRUD usuários/licenças
│   ├── empresas.service.ts       ✅ CRUD empresas
│   ├── integracoes.service.ts    ✅ CRUD integrações API
│   ├── tokens.service.ts         ✅ CRUD tokens API
│   └── index.ts                  ✅ Barrel exports
├── types/
│   └── api.types.ts              ✅ Todos os tipos TypeScript
├── utils/
│   └── errorHandler.ts           ✅ Tratamento centralizado de erros
├── hooks/
│   └── useAuth.tsx               ✅ Context API para autenticação
└── .env                          ✅ Variáveis de ambiente
```

---

## 🔧 **Configuração**

### **1. Variáveis de Ambiente (.env)**
```bash
VITE_API_BASE_URL=https://innobyte.fly.dev/
VITE_API_TIMEOUT=30000
VITE_ENV=development
```

### **2. Axios Configurado (src/services/api.ts)**
- ✅ Interceptor de request: Adiciona token automaticamente
- ✅ Interceptor de response: Trata erros globalmente
- ✅ Timeout configurável
- ✅ Logs em desenvolvimento
- ✅ Redirecionamento automático para login em 401

---

## 📦 **Services Implementados**

### **🔐 auth.service.ts**
```typescript
✅ login(email, password)          // Faz login e salva token
✅ getMe()                          // Busca dados do usuário logado
✅ changePassword(old, new)        // Altera senha
✅ logout()                         // Remove token e redireciona
✅ isAuthenticated()                // Verifica se está logado
✅ getToken()                       // Retorna token armazenado
```

### **👥 usuarios.service.ts**
```typescript
✅ getUsuarios(filters)            // Lista com filtros e paginação
✅ getUsuarioById(id)              // Busca por ID completo
✅ createUsuario(dados)            // Cria usuário + licença
✅ updateUsuario(id, dados)        // Atualiza dados/licença
✅ deleteUsuario(id)               // Soft delete
✅ bloquearUsuario(id)             // Bloqueia
✅ desbloquearUsuario(id)          // Desbloqueia
✅ renovarLicenca(id, data)        // Renova licença
```

### **🏢 empresas.service.ts**
```typescript
✅ getEmpresas(usuarioId)          // Lista empresas do usuário
✅ getEmpresaById(id)              // Busca por ID
✅ createEmpresa(usuarioId, dados) // Cria empresa
✅ updateEmpresa(id, dados)        // Atualiza empresa
✅ deleteEmpresa(id)               // Exclui empresa
✅ ativarEmpresa(id)               // Ativa
✅ desativarEmpresa(id)            // Desativa
```

### **🔗 integracoes.service.ts**
```typescript
✅ getIntegracoes(usuarioId)       // Lista integrações
✅ getIntegracaoById(id)           // Busca por ID
✅ createIntegracao(usuarioId, dados) // Cria integração
✅ updateIntegracao(id, dados)     // Atualiza
✅ testarIntegracao(id)            // Testa conexão
✅ deleteIntegracao(id)            // Exclui
✅ ativarIntegracao(id)            // Ativa
✅ desativarIntegracao(id)         // Desativa
```

### **🔑 tokens.service.ts**
```typescript
✅ getTokens(usuarioId)            // Lista tokens
✅ createToken(usuarioId, dados)   // Cria token (retorna completo!)
✅ deleteToken(id)                 // Exclui token
✅ copyTokenToClipboard(token)     // Copia para clipboard
✅ maskToken(token, showChars)     // Mascara para exibição
```

---

## 🎨 **Componentes Atualizados**

### **✅ Login.tsx**
- Integrado com `loginService()`
- Loading state funcional
- Error handling com mensagens da API
- Redireciona para dashboard após sucesso

### **✅ useAuth Hook (Context API)**
- Gerencia estado global de autenticação
- Carrega dados do usuário ao montar
- Funções: `user`, `loading`, `isAuthenticated`, `loadUser()`, `logout()`

### **✅ Header.tsx**
- Exibe nome do usuário logado
- Avatar com inicial do nome
- Logout integrado com Context API

### **✅ App.tsx**
- Envolvido com `<AuthProvider>`
- Context disponível em toda aplicação

---

## 🛠️ **Tratamento de Erros**

### **errorHandler.ts**
```typescript
✅ handleApiError(error)           // Retorna mensagem amigável
✅ getValidationErrors(error)      // Extrai erros de campos
✅ isLimitExceededError(error)     // Verifica limite excedido
✅ isDuplicateError(error)         // Verifica duplicação (409)
✅ isAuthError(error)              // Verifica erro de auth (401)
✅ isPermissionError(error)        // Verifica permissão (403)
```

**Mensagens por Status:**
- 400: Dados inválidos
- 401: Sessão expirada
- 403: Sem permissão
- 404: Não encontrado
- 409: Conflito/duplicação
- 422: Validação Pydantic (lista erros por campo)
- 500: Erro do servidor
- 503: Serviço indisponível

---

## 📝 **Como Usar nos Componentes**

### **Exemplo 1: Listar Usuários**
```typescript
import { getUsuarios } from '../services/usuarios.service';

const UsuariosList = () => {
  const [usuarios, setUsuarios] = useState([]);
  
  useEffect(() => {
    loadUsuarios();
  }, []);
  
  const loadUsuarios = async () => {
    const result = await getUsuarios({
      cliente: 'CF SAÚDE',
      page: 1,
      limit: 10,
    });
    
    if (result.success && result.data) {
      setUsuarios(result.data.data);
    } else {
      alert(result.message);
    }
  };
};
```

### **Exemplo 2: Criar Usuário**
```typescript
import { createUsuario } from '../services/usuarios.service';

const handleSubmit = async (formData) => {
  const result = await createUsuario(formData);
  
  if (result.success) {
    alert('Usuário criado!');
    navigate('/users');
  } else {
    setError(result.message);
  }
};
```

### **Exemplo 3: Usar Hook de Auth**
```typescript
import { useAuth } from '../hooks/useAuth';

const SomeComponent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  
  if (!isAuthenticated) {
    return <div>Por favor, faça login.</div>;
  }
  
  return (
    <div>
      <h1>Olá, {user?.nome}!</h1>
      <button onClick={logout}>Sair</button>
    </div>
  );
};
```

---

## 🎯 **Próximos Passos**

### **1. Integrar nos Componentes Existentes**
- [ ] `UsersManagement.tsx` - Listar usuários com `getUsuarios()`
- [ ] `UserForm.tsx` - Criar/editar com `createUsuario()` / `updateUsuario()`
- [ ] Criar componente de lista de empresas
- [ ] Criar componente de lista de integrações
- [ ] Criar componente de lista de tokens

### **2. Adicionar Funcionalidades**
- [ ] Toast notifications para sucesso/erro
- [ ] Confirmação antes de excluir
- [ ] Loading states visuais
- [ ] Paginação de tabelas
- [ ] Filtros avançados
- [ ] Exportar dados

### **3. Melhorias**
- [ ] Refresh token automático
- [ ] Cache de requisições (React Query)
- [ ] Otimistic updates
- [ ] Retry automático em falhas
- [ ] Rate limiting visual

---

## 🔒 **Segurança**

✅ **Implementado:**
- Token JWT em `Authorization: Bearer`
- Interceptor adiciona token automaticamente
- Logout em 401 (token expirado)
- localStorage para token (temporário)

⚠️ **A Implementar (Produção):**
- [ ] httpOnly cookies para token
- [ ] Refresh token com rotação
- [ ] CSRF protection
- [ ] Rate limiting no frontend
- [ ] Encryption de dados sensíveis

---

## 📊 **Logs e Debugging**

Em **desenvolvimento** (`VITE_ENV=development`):
- 🔵 Logs de requisições (método + URL + dados)
- 🟢 Logs de respostas (método + URL + dados)
- ❌ Logs detalhados de erros

Em **produção**:
- Logs desabilitados
- Apenas erros críticos

---

## 🧪 **Testando**

### **1. Testar Login**
```bash
# Console do navegador
const result = await loginService('admin@innobyte.com.br', 'Admin@123');
console.log(result);
```

### **2. Testar API no Swagger**
```
https://innobyte.fly.dev/docs
```

### **3. Verificar Token**
```javascript
localStorage.getItem('access_token');
```

---

## 📚 **Tipos TypeScript**

Todos os tipos estão em `src/types/api.types.ts`:
- `Usuario`, `Licenca`, `Empresa`, `IntegracaoAPI`, `TokenAPI`
- `CreateUsuarioData`, `UpdateUsuarioData`
- `UsuariosFilters`, `PaginatedResponse`
- `ApiResponse<T>` genérico

**Benefícios:**
- ✅ Autocomplete no VS Code
- ✅ Type safety
- ✅ Documentação inline
- ✅ Erros em tempo de desenvolvimento

---

## 🎓 **Padrões Utilizados**

1. **Services Pattern**: Lógica de API separada dos componentes
2. **Repository Pattern**: Abstrações sobre chamadas HTTP
3. **Context API**: Estado global de autenticação
4. **Barrel Exports**: Imports limpos com `index.ts`
5. **Error Handling Centralizado**: Uma fonte de verdade para erros
6. **TypeScript Strict**: Type safety total
7. **Environment Variables**: Configuração flexível

---

**Versão:** 1.0.0  
**Data:** 08/11/2025  
**Status:** ✅ **PRONTO PARA USO!**

🚀 **Toda a infraestrutura está montada. Agora é só integrar nos componentes!**
