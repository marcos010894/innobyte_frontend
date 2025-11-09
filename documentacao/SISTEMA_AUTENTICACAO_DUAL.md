# 🔐 Sistema de Autenticação Dual - Documentação Completa

## 🎯 Visão Geral

Sistema completo de autenticação com **dois tipos de login**:
- **👑 Master (Administrador)** - Acesso total ao sistema
- **👤 Cliente** - Acesso baseado em permissões da licença

---

## 📁 Estrutura de Arquivos Criados

```
src/
├── types/
│   └── auth.types.ts              # ❌ (não usado - tipos estão em api.types.ts)
├── services/
│   └── auth.service.ts            # ✅ ATUALIZADO - loginMaster(), loginCliente()
├── contexts/
│   └── AuthContext.tsx            # ✅ NOVO - Contexto de autenticação
├── hooks/
│   └── usePermissions.ts          # ✅ NOVO - Hook de permissões
├── components/
│   ├── ProtectedRoute.tsx         # ✅ NOVO - Proteção de rotas
│   ├── LicenseInfo.tsx            # ✅ NOVO - Info da licença
│   └── AlertaLicenca.tsx          # ✅ NOVO - Alertas
└── pages/
    └── LoginPage.tsx              # ✅ NOVO - Página de login
```

---

## 🔑 1. Serviço de Autenticação (auth.service.ts)

### Funções Principais

```typescript
// 🔐 Login Master
export const loginMaster = async (email: string, password: string): Promise<ApiResponse<LoginResponse>>

// 🔐 Login Cliente
export const loginCliente = async (email: string, password: string): Promise<ApiResponse<LoginResponse>>

// 👤 Obter usuário autenticado
export const getMe = async (): Promise<ApiResponse<UserMe>>

// 🔑 Gerenciamento de token
export const getToken = (): string | null
export const getUserType = (): 'master' | 'cliente' | null
export const isAuthenticated = (): boolean

// 🚪 Logout
export const logout = (): void
```

### Endpoints Usados

| Endpoint | Método | Descrição |
|----------|--------|-----------|
| `/api/auth/login` | POST | Login de Master |
| `/api/auth/login-cliente` | POST | Login de Cliente |
| `/api/auth/me` | GET | Dados do usuário autenticado |

---

## 🌐 2. AuthContext (AuthContext.tsx)

### Uso Básico

```typescript
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// No App.tsx
function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Suas rotas */}
      </Router>
    </AuthProvider>
  );
}

// Em qualquer componente
function MeuComponente() {
  const { 
    user,              // Dados do usuário
    isAuthenticated,   // Está autenticado?
    isMaster,          // É master?
    isCliente,         // É cliente?
    licenca,           // Dados da licença (se cliente)
    loginMaster,       // Função de login master
    loginCliente,      // Função de login cliente
    logout,            // Função de logout
    temPermissao,      // Verifica permissão
    licencaValida,     // Licença válida?
    diasParaVencer,    // Dias restantes
  } = useAuth();
}
```

---

## 🪝 3. Hook usePermissions

### Uso Completo

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MeuComponente() {
  const {
    // Dados do usuário
    user,
    isMaster,
    isCliente,
    licenca,

    // Permissões específicas
    podeAcessarTudo,
    podeUsarToken,
    podeCriarModelos,
    podeCadastrarProdutos,
    apenasModelosPDF,

    // Status da licença
    licencaOK,
    licencaBloqueada,
    licencaVencida,
    licencaPertoDeVencer,
    mostrarAlertaVencimento,
    diasRestantes,

    // Empresas
    limitEmpresas,
    empresasAtivas,
    podeAdicionarEmpresa,

    // Helpers
    getStatusColor,      // 'red' | 'yellow' | 'green'
    getStatusText,       // 'Ativa' | 'Vencida' | etc
    verificarPermissao,
    verificarTodasPermissoes,
    verificarAlgumaPermissao,
  } = usePermissions();

  return (
    <div>
      {podeCriarModelos && (
        <button>Criar Modelo</button>
      )}
    </div>
  );
}
```

---

## 🛡️ 4. ProtectedRoute

### Exemplos de Uso

```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

// Rota que qualquer autenticado pode acessar
<Route path="/dashboard" element={
  <ProtectedRoute>
    <Dashboard />
  </ProtectedRoute>
} />

// Rota só para Master
<Route path="/usuarios" element={
  <ProtectedRoute requireMaster>
    <UsuariosPage />
  </ProtectedRoute>
} />

// Rota só para Cliente
<Route path="/minha-licenca" element={
  <ProtectedRoute requireCliente>
    <LicenseInfo />
  </ProtectedRoute>
} />

// Rota que requer permissão específica
<Route path="/modelos" element={
  <ProtectedRoute requiredPermission="permite_criar_modelos">
    <ModelosPage />
  </ProtectedRoute>
} />

// Combinar requisitos
<Route path="/tokens" element={
  <ProtectedRoute requireCliente requiredPermission="permite_token">
    <TokensPage />
  </ProtectedRoute>
} />
```

### Comportamento

- **Não autenticado** → Redireciona para `/login`
- **Sem ser Master (requer Master)** → Tela de "Acesso Negado"
- **Licença inválida** → Tela de "Licença Inválida"
- **Sem permissão** → Tela de "Permissão Negada"

---

## 📄 5. Componente LicenseInfo

### Uso

```typescript
import LicenseInfo from '@/components/LicenseInfo';

function DashboardCliente() {
  return (
    <div>
      <h1>Dashboard</h1>
      <LicenseInfo />
    </div>
  );
}
```

### O que exibe:

- ✅ Status da licença (ativa/vencida/bloqueada)
- ✅ Dias para vencer
- ✅ Data de início e expiração
- ✅ Empresas ativas / limite
- ✅ Permissões (token, modelos, produtos, PDFs)
- ✅ Alertas visuais
- ✅ Botão de contato (se licença inválida)

---

## 🚨 6. Componentes de Alerta

### AlertaLicenca (Alerta Completo)

```typescript
import AlertaLicenca from '@/components/AlertaLicenca';

function MinhaPage() {
  const { licencaVencida } = usePermissions();

  return (
    <div>
      {licencaVencida && (
        <AlertaLicenca
          tipo="vencida"
          onContato={() => window.location.href = 'mailto:suporte@sistema.com'}
          onVoltar={() => window.history.back()}
        />
      )}
    </div>
  );
}
```

### Tipos Disponíveis:
- `vencida` - Licença expirada
- `bloqueada` - Licença bloqueada
- `perto-vencer` - Licença próxima do vencimento
- `limite-empresas` - Limite de empresas atingido
- `sem-permissao` - Sem permissão para ação

### BannerAlerta (Banner no Topo)

```typescript
import { BannerAlerta } from '@/components/AlertaLicenca';

function Layout() {
  const { licencaPertoDeVencer, diasRestantes } = usePermissions();

  return (
    <div>
      {licencaPertoDeVencer && (
        <BannerAlerta tipo="perto-vencer" diasRestantes={diasRestantes} />
      )}
      {/* Conteúdo */}
    </div>
  );
}
```

---

## 🔐 7. Página de Login (LoginPage.tsx)

### Características:

- ✅ Alternância visual entre Master e Cliente
- ✅ Formulário único com validação
- ✅ Mensagens de erro específicas
- ✅ Loading state
- ✅ Redirecionamento automático após login
- ✅ Design responsivo e moderno

### Uso nas Rotas:

```typescript
import LoginPage from '@/pages/LoginPage';

<Route path="/login" element={<LoginPage />} />
```

---

## 🎨 8. Fluxo Completo de Autenticação

### Login Master

```
1. Usuário acessa /login
2. Seleciona "👑 Administrador"
3. Digita email/senha
4. Sistema chama loginMaster()
5. Backend valida em /api/auth/login
6. Token salvo no localStorage
7. user_type = 'master'
8. Redireciona para /dashboard
```

### Login Cliente

```
1. Usuário acessa /login
2. Seleciona "👤 Cliente"
3. Digita email/senha
4. Sistema chama loginCliente()
5. Backend valida em /api/auth/login-cliente
6. Backend verifica:
   ✅ Credenciais corretas
   ✅ Conta ativa
   ✅ Licença não bloqueada
   ✅ Licença não vencida
7. Token salvo no localStorage
8. user_type = 'cliente'
9. Dados da licença retornados
10. Redireciona para /dashboard
```

### Verificação de Permissões

```
1. Cliente tenta acessar /modelos
2. ProtectedRoute verifica:
   ✅ Está autenticado?
   ✅ Licença válida?
   ✅ Tem permissão "permite_criar_modelos"?
3. Se tudo OK → Renderiza página
4. Se falhar → Mostra tela de erro
```

---

## 📊 9. Estrutura de Dados

### LoginResponse (do backend)

```typescript
{
  access_token: string,
  token_type: "bearer",
  user: {
    id: number,
    email: string,
    tipo: "master" | "cliente",
    
    // Apenas para Master
    nome?: string,
    foto_perfil?: string,
    
    // Apenas para Cliente
    razao_social?: string,
    cnpj?: string,
    telefone?: string,
    licenca?: {
      tipo_licenca: "temporaria" | "contrato",
      data_inicio: string,
      data_expiracao: string,
      dias_para_vencer: number,
      vencida: boolean,
      limite_empresas: number,
      empresas_ativas: number,
      bloqueada: boolean,
      permite_token: boolean,
      permite_criar_modelos: boolean,
      permite_cadastrar_produtos: boolean,
      apenas_modelos_pdf: boolean
    }
  }
}
```

---

## 🔧 10. Como Usar no Projeto

### Passo 1: Envolver App com AuthProvider

```typescript
// App.tsx ou main.tsx
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        {/* Rotas */}
      </Router>
    </AuthProvider>
  );
}
```

### Passo 2: Configurar Rotas

```typescript
import LoginPage from '@/pages/LoginPage';
import ProtectedRoute from '@/components/ProtectedRoute';

<Routes>
  {/* Rota pública */}
  <Route path="/login" element={<LoginPage />} />

  {/* Rotas protegidas */}
  <Route path="/dashboard" element={
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  } />

  <Route path="/usuarios" element={
    <ProtectedRoute requireMaster>
      <UsuariosPage />
    </ProtectedRoute>
  } />

  <Route path="/modelos" element={
    <ProtectedRoute requiredPermission="permite_criar_modelos">
      <ModelosPage />
    </ProtectedRoute>
  } />
</Routes>
```

### Passo 3: Usar Permissões em Componentes

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MeuComponente() {
  const { 
    isMaster, 
    podeCriarModelos, 
    licencaPertoDeVencer 
  } = usePermissions();

  return (
    <div>
      {licencaPertoDeVencer && (
        <BannerAlerta tipo="perto-vencer" />
      )}

      {isMaster && (
        <button>Gerenciar Usuários</button>
      )}

      {podeCriarModelos && (
        <button>Criar Modelo</button>
      )}
    </div>
  );
}
```

---

## ✅ 11. Checklist de Implementação

### ✅ Completado:

- [x] Tipos TypeScript (LicencaAuth, UsuarioMaster, UsuarioCliente)
- [x] auth.service.ts (loginMaster, loginCliente)
- [x] AuthContext com gerenciamento completo
- [x] usePermissions hook
- [x] ProtectedRoute component
- [x] LicenseInfo component
- [x] AlertaLicenca components
- [x] LoginPage com alternância

### 📝 Próximos Passos:

- [ ] Integrar AuthProvider no App.tsx
- [ ] Atualizar rotas com ProtectedRoute
- [ ] Criar Dashboard adaptativo (Master vs Cliente)
- [ ] Atualizar Sidebar com permissões
- [ ] Testar fluxo completo
- [ ] Adicionar exemplos de uso

---

## 🎯 12. Exemplos de Uso Completos

### Exemplo 1: Sidebar Adaptativa

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function Sidebar() {
  const { 
    isMaster, 
    podeCriarModelos, 
    podeCadastrarProdutos, 
    podeUsarToken 
  } = usePermissions();

  return (
    <nav>
      <SidebarItem to="/dashboard" icon="📊">
        Dashboard
      </SidebarItem>

      {isMaster && (
        <>
          <SidebarItem to="/usuarios" icon="👥">
            Usuários
          </SidebarItem>
          <SidebarItem to="/configuracoes" icon="⚙️">
            Configurações
          </SidebarItem>
        </>
      )}

      {podeCriarModelos && (
        <SidebarItem to="/modelos" icon="📄">
          Modelos
        </SidebarItem>
      )}

      {podeCadastrarProdutos && (
        <SidebarItem to="/produtos" icon="📦">
          Produtos
        </SidebarItem>
      )}

      {podeUsarToken && (
        <SidebarItem to="/tokens" icon="🔑">
          Tokens API
        </SidebarItem>
      )}
    </nav>
  );
}
```

### Exemplo 2: Dashboard Adaptativo

```typescript
import { usePermissions } from '@/hooks/usePermissions';
import LicenseInfo from '@/components/LicenseInfo';

function Dashboard() {
  const { isMaster, isCliente } = usePermissions();

  if (isMaster) {
    return (
      <div>
        <h1>Dashboard - Administrador</h1>
        <div className="grid grid-cols-3 gap-4">
          <StatCard title="Total de Usuários" value="150" />
          <StatCard title="Licenças Ativas" value="120" />
          <StatCard title="Receita Mensal" value="R$ 45.000" />
        </div>
        {/* Gráficos gerenciais */}
      </div>
    );
  }

  if (isCliente) {
    return (
      <div>
        <h1>Dashboard - Cliente</h1>
        <div className="grid grid-cols-2 gap-4">
          <LicenseInfo />
          <div>
            {/* Acesso rápido às funcionalidades */}
            <QuickActions />
          </div>
        </div>
      </div>
    );
  }

  return null;
}
```

### Exemplo 3: Botão Condicional

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function ModelosPage() {
  const { podeCriarModelos, verificarPermissao } = usePermissions();

  const handleCriarModelo = () => {
    if (!verificarPermissao('permite_criar_modelos')) {
      alert('Você não tem permissão para criar modelos');
      return;
    }
    // Lógica de criação
  };

  return (
    <div>
      <h1>Modelos</h1>
      {podeCriarModelos ? (
        <button onClick={handleCriarModelo}>
          ➕ Criar Novo Modelo
        </button>
      ) : (
        <div className="text-gray-500">
          Você não tem permissão para criar modelos
        </div>
      )}
    </div>
  );
}
```

---

## 🎉 Pronto para Usar!

Todo o sistema de autenticação dual está implementado e pronto para ser integrado no projeto. 🚀

### Principais Benefícios:

✅ **Dois tipos de login** - Master e Cliente
✅ **Permissões granulares** - Baseadas na licença
✅ **Proteção de rotas** - Automática e configurável
✅ **Alertas visuais** - Para licenças e permissões
✅ **TypeScript completo** - Type-safe
✅ **Componentes reutilizáveis** - Fácil manutenção
✅ **UX otimizada** - Feedback claro para o usuário

**Agora é só integrar no App.tsx e começar a usar!** 🎯
