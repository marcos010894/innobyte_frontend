# 🚀 Guia de Integração Rápida - Sistema de Autenticação Dual

## ⚡ 5 Minutos para Integrar!

---

## 📋 Passo 1: Envolver App com AuthProvider

**Arquivo:** `src/App.tsx` ou `src/main.tsx`

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

function App() {
  return (
    <AuthProvider>  {/* 👈 Adicione aqui */}
      <Router>
        {/* Suas rotas */}
      </Router>
    </AuthProvider>  {/* 👈 Feche aqui */}
  );
}

export default App;
```

---

## 📋 Passo 2: Adicionar Rota de Login

**Arquivo:** Onde você configura suas rotas (ex: `src/routes.tsx`)

```typescript
import LoginPage from '@/pages/LoginPage';

// Adicione a rota de login
<Route path="/login" element={<LoginPage />} />
```

---

## 📋 Passo 3: Proteger Rotas Existentes

**Antes:**
```typescript
<Route path="/dashboard" element={<Dashboard />} />
<Route path="/usuarios" element={<UsuariosPage />} />
<Route path="/modelos" element={<ModelosPage />} />
```

**Depois:**
```typescript
import ProtectedRoute from '@/components/ProtectedRoute';

{/* Rota acessível por todos autenticados */}
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
```

---

## 📋 Passo 4: Atualizar Sidebar/Menu

**Antes:**
```typescript
<nav>
  <Link to="/dashboard">Dashboard</Link>
  <Link to="/usuarios">Usuários</Link>
  <Link to="/modelos">Modelos</Link>
  <Link to="/produtos">Produtos</Link>
</nav>
```

**Depois:**
```typescript
import { usePermissions } from '@/hooks/usePermissions';

function Sidebar() {
  const { 
    isMaster, 
    podeCriarModelos, 
    podeCadastrarProdutos 
  } = usePermissions();

  return (
    <nav>
      <Link to="/dashboard">📊 Dashboard</Link>
      
      {isMaster && (
        <Link to="/usuarios">👥 Usuários</Link>
      )}
      
      {podeCriarModelos && (
        <Link to="/modelos">📄 Modelos</Link>
      )}
      
      {podeCadastrarProdutos && (
        <Link to="/produtos">📦 Produtos</Link>
      )}
    </nav>
  );
}
```

---

## 📋 Passo 5: Adicionar Alertas de Licença (Opcional)

**No Layout Principal:**

```typescript
import { BannerAlerta } from '@/components/AlertaLicenca';
import { usePermissions } from '@/hooks/usePermissions';

function Layout() {
  const { 
    licencaPertoDeVencer, 
    licencaVencida, 
    licencaBloqueada,
    diasRestantes 
  } = usePermissions();

  return (
    <div>
      {/* Banner no topo */}
      {licencaBloqueada && (
        <BannerAlerta tipo="bloqueada" />
      )}
      {licencaVencida && !licencaBloqueada && (
        <BannerAlerta tipo="vencida" />
      )}
      {licencaPertoDeVencer && !licencaVencida && !licencaBloqueada && (
        <BannerAlerta tipo="perto-vencer" diasRestantes={diasRestantes} />
      )}

      {/* Conteúdo */}
      <main>{children}</main>
    </div>
  );
}
```

---

## ✅ Pronto! Agora teste:

### 🧪 Teste 1: Login Master
```
1. Acesse: http://localhost:5173/login
2. Clique em "👑 Administrador"
3. Digite email/senha de Master
4. Deve redirecionar para /dashboard
5. Sidebar deve mostrar TODAS as opções
```

### 🧪 Teste 2: Login Cliente
```
1. Acesse: http://localhost:5173/login
2. Clique em "👤 Cliente"
3. Digite email/senha de Cliente
4. Deve redirecionar para /dashboard
5. Sidebar deve mostrar APENAS opções permitidas
6. Verificar alerta se licença perto de vencer
```

### 🧪 Teste 3: Proteção de Rotas
```
1. Faça logout
2. Tente acessar /dashboard
3. Deve redirecionar para /login
4. Faça login como Cliente
5. Tente acessar /usuarios (só Master)
6. Deve ver tela de "Acesso Negado"
```

---

## 🎯 Exemplos de Uso nos Componentes

### Exemplo 1: Verificar Permissão em Botão

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function MinhaPage() {
  const { podeCriarModelos } = usePermissions();

  return (
    <div>
      <h1>Modelos</h1>
      {podeCriarModelos ? (
        <button onClick={handleCriar}>
          ➕ Criar Modelo
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

### Exemplo 2: Exibir Info da Licença

```typescript
import LicenseInfo from '@/components/LicenseInfo';
import { usePermissions } from '@/hooks/usePermissions';

function DashboardCliente() {
  const { isCliente } = usePermissions();

  return (
    <div>
      <h1>Dashboard</h1>
      {isCliente && <LicenseInfo />}
    </div>
  );
}
```

### Exemplo 3: Lógica Condicional por Tipo

```typescript
import { usePermissions } from '@/hooks/usePermissions';

function Dashboard() {
  const { isMaster, isCliente } = usePermissions();

  if (isMaster) {
    return <DashboardMaster />;
  }

  if (isCliente) {
    return <DashboardCliente />;
  }

  return null;
}
```

---

## 🐛 Troubleshooting

### Erro: "useAuth must be used within an AuthProvider"
**Solução:** Certifique-se de que `<AuthProvider>` está envolvendo seu `<Router>`

### Usuário não é redirecionado após login
**Solução:** Verifique se você tem a rota `/dashboard` configurada

### Permissões não funcionam
**Solução:** 
1. Verifique se o backend está retornando `licenca` no `/api/auth/login-cliente`
2. Verifique o console do navegador para ver os dados retornados

### Rotas desprotegidas
**Solução:** Certifique-se de envolver o componente com `<ProtectedRoute>`

---

## 📚 Documentação Completa

Para mais detalhes, consulte:
- **SISTEMA_AUTENTICACAO_DUAL.md** - Documentação completa

---

## 🎉 Está Pronto!

Seu sistema agora tem:
- ✅ Login dual (Master e Cliente)
- ✅ Proteção de rotas automática
- ✅ Verificação de permissões
- ✅ Alertas de licença
- ✅ Interface adaptativa

**Aproveite!** 🚀
