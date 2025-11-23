# 📦 Instalação e Uso dos Services

## 🚀 **Instalação Completa**

```bash
# 1. Instalar dependências (já feito)
npm install axios

# 2. Verificar variável de ambiente
# Arquivo .env já criado com:
# VITE_API_BASE_URL=http://127.0.0.1:8000/
```

---

## ✅ **O que já está pronto**

### **Arquitetura Completa:**
- ✅ `src/services/api.ts` - Axios configurado
- ✅ `src/services/auth.service.ts` - Autenticação
- ✅ `src/services/usuarios.service.ts` - Usuários/Licenças
- ✅ `src/services/empresas.service.ts` - Empresas
- ✅ `src/services/integracoes.service.ts` - Integrações API
- ✅ `src/services/tokens.service.ts` - Tokens API
- ✅ `src/types/api.types.ts` - Tipos TypeScript
- ✅ `src/utils/errorHandler.ts` - Tratamento de erros
- ✅ `src/hooks/useAuth.tsx` - Context API Auth
- ✅ `src/pages/Login.tsx` - Integrado com API
- ✅ `src/components/layout/Header.tsx` - Usuário da API
- ✅ `src/App.tsx` - AuthProvider configurado

---

## 📖 **Como Usar**

### **1. Login (já funcionando)**
```typescript
// Login.tsx já está integrado!
import { login } from '../services/auth.service';

const result = await login('admin@innobyte.com.br', 'Admin@123');
if (result.success) {
  navigate('/');
}
```

### **2. Listar Usuários**
```typescript
import { getUsuarios } from '../services';

// No componente
const loadUsuarios = async () => {
  const result = await getUsuarios({
    page: 1,
    limit: 10,
    cliente: 'CF SAÚDE' // Filtro opcional
  });
  
  if (result.success && result.data) {
    setUsuarios(result.data.data);
    setPagination(result.data.pagination);
    setSummary(result.data.summary);
  } else {
    setError(result.message);
  }
};
```

### **3. Criar Usuário**
```typescript
import { createUsuario } from '../services';

const handleCreate = async () => {
  const result = await createUsuario({
    cnpj: '12345678000190',
    razao_social: 'Empresa Teste LTDA',
    telefone: '(11) 98765-4321',
    email: 'contato@empresa.com',
    senha: 'Senha@123',
    tipo_licenca: 'contrato',
    data_inicio: '2025-11-08',
    data_expiracao: '2026-11-08',
    intervalo: 'mensal',
    limite_empresas: 5,
    valor_parcela: 199.90,
    // Permissões
    renovacao_automatica: true,
    permite_token: true,
    permite_criar_modelos: true,
  });
  
  if (result.success) {
    alert('Usuário criado!');
  }
};
```

### **4. Usar Hook de Auth**
```typescript
import { useAuth } from '../hooks/useAuth';

const SomeComponent = () => {
  const { user, isAuthenticated, loading, logout } = useAuth();
  
  if (loading) return <div>Carregando...</div>;
  
  if (!isAuthenticated) {
    return <div>Faça login</div>;
  }
  
  return (
    <div>
      <h1>Olá, {user?.nome}!</h1>
      <p>Tipo: {user?.tipo}</p>
      <button onClick={logout}>Sair</button>
    </div>
  );
};
```

---

## 🎯 **Exemplos Práticos**

### **Exemplo 1: Componente de Lista de Usuários**

```typescript
import { useState, useEffect } from 'react';
import { getUsuarios } from '../services';

const UsersList = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ page: 1, limit: 10 });

  useEffect(() => {
    loadUsuarios();
  }, [filters]);

  const loadUsuarios = async () => {
    setLoading(true);
    const result = await getUsuarios(filters);
    
    if (result.success && result.data) {
      setUsuarios(result.data.data);
    }
    
    setLoading(false);
  };

  if (loading) return <div>Carregando...</div>;

  return (
    <div>
      {usuarios.map((user) => (
        <div key={user.id}>
          <h3>{user.cliente}</h3>
          <p>{user.email}</p>
          <span>{user.tipo_licenca}</span>
        </div>
      ))}
    </div>
  );
};
```

### **Exemplo 2: Bloquear/Desbloquear Usuário**

```typescript
import { bloquearUsuario, desbloquearUsuario } from '../services';

const UserActions = ({ userId, bloqueada }) => {
  const handleToggleBlock = async () => {
    const result = bloqueada 
      ? await desbloquearUsuario(userId)
      : await bloquearUsuario(userId);
    
    if (result.success) {
      alert(bloqueada ? 'Usuário desbloqueado!' : 'Usuário bloqueado!');
      // Recarregar lista
    } else {
      alert(result.message);
    }
  };

  return (
    <button onClick={handleToggleBlock}>
      {bloqueada ? 'Desbloquear' : 'Bloquear'}
    </button>
  );
};
```

### **Exemplo 3: Criar Empresa**

```typescript
import { createEmpresa } from '../services';

const CreateEmpresa = ({ usuarioId }) => {
  const handleSubmit = async (formData) => {
    const result = await createEmpresa(usuarioId, {
      nome_fantasia: formData.nomeFantasia,
      razao_social: formData.razaoSocial,
      cnpj: formData.cnpj,
      cep: formData.cep,
      logradouro: formData.logradouro,
      numero: formData.numero,
      bairro: formData.bairro,
      cidade: formData.cidade,
      estado: formData.estado,
      emails: [formData.email],
      telefones: [formData.telefone],
    });
    
    if (result.success) {
      alert('Empresa criada!');
    } else if (result.limitExceeded) {
      alert('Limite de empresas atingido!');
    } else {
      alert(result.message);
    }
  };
};
```

### **Exemplo 4: Criar Token API**

```typescript
import { createToken, copyTokenToClipboard } from '../services';

const CreateToken = ({ usuarioId }) => {
  const [showToken, setShowToken] = useState(false);
  const [token, setToken] = useState('');

  const handleCreate = async () => {
    const result = await createToken(usuarioId, {
      nome: 'Token Produção',
      tipo: 'producao',
      expiracao: null, // Sem expiração
    });
    
    if (result.success && result.data) {
      setToken(result.data.token);
      setShowToken(true);
      
      // Copia automaticamente
      await copyTokenToClipboard(result.data.token);
      alert('Token copiado para clipboard!');
    }
  };

  return (
    <div>
      <button onClick={handleCreate}>Gerar Token</button>
      
      {showToken && (
        <div>
          <p>⚠️ Copie agora! Não será mostrado novamente.</p>
          <code>{token}</code>
        </div>
      )}
    </div>
  );
};
```

---

## 🔥 **Todos os Services Disponíveis**

```typescript
// Importe tudo de uma vez
import {
  // Auth
  login,
  getMe,
  changePassword,
  logout,
  isAuthenticated,
  
  // Usuários
  getUsuarios,
  getUsuarioById,
  createUsuario,
  updateUsuario,
  deleteUsuario,
  bloquearUsuario,
  desbloquearUsuario,
  renovarLicenca,
  
  // Empresas
  getEmpresas,
  getEmpresaById,
  createEmpresa,
  updateEmpresa,
  deleteEmpresa,
  ativarEmpresa,
  desativarEmpresa,
  
  // Integrações
  getIntegracoes,
  getIntegracaoById,
  createIntegracao,
  updateIntegracao,
  testarIntegracao,
  deleteIntegracao,
  ativarIntegracao,
  desativarIntegracao,
  
  // Tokens
  getTokens,
  createToken,
  deleteToken,
  copyTokenToClipboard,
  maskToken,
} from '../services';
```

---

## ⚡ **Features**

### **✅ Type Safety Completo**
Todos os tipos estão em `src/types/api.types.ts`

### **✅ Error Handling Automático**
Todas as funções retornam:
```typescript
{
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
```

### **✅ Token Automático**
O interceptor adiciona `Authorization: Bearer <token>` em todas as requests

### **✅ Logout Automático**
Qualquer erro 401 redireciona para /login

### **✅ Logs em Dev**
Veja todas as chamadas no console (apenas em desenvolvimento)

---

## 🧪 **Testando**

### **1. Verificar se API está rodando**
```bash
curl http://127.0.0.1:8000//auth/login -X POST \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@innobyte.com.br","password":"Admin@123"}'
```

### **2. Testar Login no Frontend**
```typescript
// No console do navegador (F12)
const { login } = await import('./services/auth.service');
const result = await login('admin@innobyte.com.br', 'Admin@123');
console.log(result);
```

### **3. Verificar Token**
```javascript
localStorage.getItem('access_token');
```

---

## 📝 **Próximos Passos**

1. **Integrar UsersManagement.tsx**
   - Usar `getUsuarios()` para listar
   - Adicionar filtros
   - Paginação

2. **Integrar UserForm.tsx**
   - Usar `createUsuario()` / `updateUsuario()`
   - Validação de campos

3. **Criar Componentes de Empresas**
   - Lista de empresas
   - Formulário

4. **Criar Componentes de Integrações**
   - Lista com botão "Testar Conexão"
   - Formulário

5. **Criar Componentes de Tokens**
   - Lista com tokens mascarados
   - Modal para mostrar token completo ao criar

---

## 🎓 **Dicas**

1. **Sempre use `result.success` para verificar**
2. **Mostre `result.message` ao usuário**
3. **Use TypeScript para autocomplete**
4. **Verifique erros específicos com `isLimitExceededError()`, `isDuplicateError()`, etc.**
5. **Use `useAuth()` para acessar usuário logado em qualquer componente**

---

**🚀 Tudo pronto! Agora é só usar! 🚀**
