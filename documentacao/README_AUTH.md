# 🔐 Sistema de Autenticação Dual - README

## 🎯 Visão Geral

Sistema completo de autenticação com **dois tipos de login**:
- **👑 Master (Administrador)** - Acesso total ao sistema
- **👤 Cliente** - Acesso baseado em permissões da licença

---

## ✨ Funcionalidades

### 🔑 Autenticação
- ✅ Login Master (`/api/auth/login`)
- ✅ Login Cliente (`/api/auth/login-cliente`)
- ✅ Token JWT persistido
- ✅ Gerenciamento de sessão

### 🛡️ Controle de Permissões
- ✅ `permite_token` - Uso de tokens API
- ✅ `permite_criar_modelos` - Criação de modelos
- ✅ `permite_cadastrar_produtos` - Cadastro de produtos
- ✅ `apenas_modelos_pdf` - Restrição a PDFs

### 🚧 Proteção de Rotas
- ✅ Verificação automática de autenticação
- ✅ Verificação de tipo de usuário
- ✅ Verificação de permissões específicas
- ✅ Telas de erro personalizadas

### 📊 Interface
- ✅ Página de login moderna
- ✅ Dashboard adaptativo (Master/Cliente)
- ✅ Componente de informações da licença
- ✅ Alertas visuais de vencimento/bloqueio
- ✅ Sidebar adaptativa baseada em permissões

---

## 📁 Estrutura

```
src/
├── contexts/
│   └── AuthContext.tsx          # Contexto de autenticação
├── hooks/
│   └── usePermissions.ts        # Hook de permissões
├── components/
│   ├── ProtectedRoute.tsx       # Proteção de rotas
│   ├── LicenseInfo.tsx          # Informações da licença
│   └── AlertaLicenca.tsx        # Alertas de licença
├── pages/
│   └── LoginPage.tsx            # Página de login
├── services/
│   └── auth.service.ts          # Serviço de autenticação
└── types/
    └── api.types.ts             # Tipos TypeScript
```

---

## 🚀 Instalação e Uso

### 1️⃣ Adicionar AuthProvider

```typescript
// App.tsx
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Suas rotas */}
      </Router>
    </AuthProvider>
  );
}
```

### 2️⃣ Configurar Rotas

```typescript
import LoginPage from '@/pages/LoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';

<Routes>
  {/* Rota pública */}
  <Route path="/login" element={<LoginPage />} />

  {/* Rota protegida */}
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />

  {/* Rota só para Master */}
  <Route path="/usuarios" element={
    <ProtectedRoute requireMaster>
      <UsuariosPage />
    </ProtectedRoute>
  } />

  {/* Rota com permissão específica */}
  <Route path="/modelos" element={
    <ProtectedRoute requiredPermission="permite_criar_modelos">
      <ModelosPage />
    </ProtectedRoute>
  } />
</Routes>
```

### 3️⃣ Usar Permissões

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MeuComponente() {
  const { 
    isMaster, 
    podeCriarModelos, 
    licencaVencida 
  } = usePermissions();

  return (
    <div>
      {licencaVencida && <AlertaLicenca tipo="vencida" />}
      {podeCriarModelos && <button>Criar Modelo</button>}
    </div>
  );
}
```

---

## 📖 Documentação

| Documento | Descrição |
|-----------|-----------|
| **SISTEMA_AUTENTICACAO_DUAL.md** | Documentação técnica completa |
| **INTEGRACAO_RAPIDA.md** | Guia de integração (5 min) |
| **VISUAL_SISTEMA_AUTH.md** | Exemplos visuais das telas |
| **RESUMO_FINAL_AUTH.md** | Resumo executivo |
| **EXEMPLOS_PRATICOS_AUTH.md** | Exemplos de código prontos |
| **INDICE_DOCUMENTACAO.md** | Índice de toda documentação |
| **COMPLETO.md** | Status completo do projeto |

---

## 🔧 API

### Endpoints

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/api/auth/login` | Login Master |
| POST | `/api/auth/login-cliente` | Login Cliente |
| GET | `/api/auth/me` | Dados do usuário autenticado |

### Exemplo de Resposta (Login Cliente)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "user": {
    "id": 1,
    "email": "cliente@empresa.com",
    "razao_social": "Empresa LTDA",
    "cnpj": "12345678000190",
    "tipo": "cliente",
    "licenca": {
      "tipo_licenca": "contrato",
      "data_expiracao": "2025-12-31",
      "dias_para_vencer": 150,
      "vencida": false,
      "bloqueada": false,
      "permite_token": true,
      "permite_criar_modelos": true,
      "permite_cadastrar_produtos": true,
      "apenas_modelos_pdf": false,
      "limite_empresas": 5,
      "empresas_ativas": 3
    }
  }
}
```

---

## 🧪 Testes

### Login Master
```bash
1. Acesse /login
2. Clique em "👑 Administrador"
3. Digite credenciais de Master
4. Verifique redirecionamento para /dashboard
5. Verifique acesso a todas as rotas
```

### Login Cliente
```bash
1. Acesse /login
2. Clique em "👤 Cliente"
3. Digite credenciais de Cliente
4. Verifique redirecionamento para /dashboard
5. Verifique sidebar mostra apenas itens permitidos
6. Verifique alertas de licença (se aplicável)
```

### Proteção de Rotas
```bash
1. Sem login → Redireciona para /login
2. Cliente em rota Master → Acesso Negado
3. Sem permissão → Permissão Negada
4. Licença vencida → Licença Inválida
```

---

## 🎨 Componentes

### useAuth
```typescript
const {
  user,              // Dados do usuário
  isAuthenticated,   // Está autenticado?
  isMaster,          // É master?
  isCliente,         // É cliente?
  licenca,           // Dados da licença
  loginMaster,       // Login master
  loginCliente,      // Login cliente
  logout,            // Logout
  temPermissao,      // Verifica permissão
  licencaValida,     // Licença válida?
  diasParaVencer,    // Dias restantes
} = useAuth();
```

### usePermissions
```typescript
const {
  podeUsarToken,           // Permissão de tokens
  podeCriarModelos,        // Permissão de modelos
  podeCadastrarProdutos,   // Permissão de produtos
  licencaOK,               // Status da licença
  licencaVencida,          // Licença vencida?
  licencaBloqueada,        // Licença bloqueada?
  diasRestantes,           // Dias para vencer
  empresasAtivas,          // Empresas ativas
  limitEmpresas,           // Limite de empresas
  podeAdicionarEmpresa,    // Pode adicionar empresa?
} = usePermissions();
```

---

## 🛠️ Tecnologias

- **React** 18+
- **TypeScript** 5+
- **React Router** 6+
- **Axios** para HTTP
- **Tailwind CSS** para estilos
- **Context API** para estado global

---

## 📊 Status

| Item | Status |
|------|--------|
| **Código** | ✅ Completo |
| **Testes** | ⏳ Pendente |
| **Documentação** | ✅ Completa |
| **Exemplos** | ✅ Completos |
| **Deploy** | ⏳ Pendente |

---

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch (`git checkout -b feature/nova-feature`)
3. Commit suas mudanças (`git commit -m 'Add nova feature'`)
4. Push para a branch (`git push origin feature/nova-feature`)
5. Abra um Pull Request

---

## 📝 Licença

Este projeto está sob a licença MIT.

---

## 👥 Autores

- Desenvolvido com ❤️ pela equipe

---

## 📞 Suporte

- 📧 Email: suporte@sistema.com
- 📖 Docs: Ver pasta de documentação
- 🐛 Issues: GitHub Issues

---

## 🎉 Agradecimentos

Obrigado por usar nosso sistema de autenticação!

**🚀 Bom desenvolvimento!**

---

**Versão:** 1.0.0  
**Última atualização:** 8 de novembro de 2025
