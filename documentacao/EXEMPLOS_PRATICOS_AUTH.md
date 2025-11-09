# 💡 Exemplos Práticos de Uso - Sistema de Autenticação

## 🎯 Casos de Uso Reais

---

## 1. 🏠 Exemplo: Dashboard Adaptativo Completo

```typescript
// src/pages/Dashboard.tsx
import React from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import LicenseInfo from '@/components/LicenseInfo';
import { BannerAlerta } from '@/components/AlertaLicenca';

const Dashboard: React.FC = () => {
  const {
    user,
    isMaster,
    isCliente,
    licencaPertoDeVencer,
    licencaVencida,
    licencaBloqueada,
    diasRestantes,
    podeCriarModelos,
    podeCadastrarProdutos,
    podeUsarToken,
    empresasAtivas,
    limitEmpresas,
  } = usePermissions();

  // Dashboard para Master
  if (isMaster) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Dashboard - Administrador</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <StatCard 
            title="Total de Usuários" 
            value="150" 
            icon="👥"
            color="blue"
          />
          <StatCard 
            title="Licenças Ativas" 
            value="120" 
            icon="📄"
            color="green"
          />
          <StatCard 
            title="Receita Mensal" 
            value="R$ 45.000" 
            icon="💰"
            color="yellow"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">📈 Gráfico de Crescimento</h2>
            {/* Seu gráfico aqui */}
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">📋 Últimas Atividades</h2>
            <ul className="space-y-2">
              <li>✅ Novo usuário cadastrado</li>
              <li>🔄 Licença renovada</li>
              <li>🔑 Token gerado</li>
            </ul>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard para Cliente
  if (isCliente) {
    return (
      <div className="p-6">
        {/* Banners de Alerta */}
        {licencaBloqueada && <BannerAlerta tipo="bloqueada" />}
        {licencaVencida && !licencaBloqueada && <BannerAlerta tipo="vencida" />}
        {licencaPertoDeVencer && !licencaVencida && !licencaBloqueada && (
          <BannerAlerta tipo="perto-vencer" diasRestantes={diasRestantes} />
        )}

        <h1 className="text-3xl font-bold mb-6">
          Bem-vindo, {(user as any).razao_social}!
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card de Licença */}
          <LicenseInfo />

          {/* Acesso Rápido */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">🚀 Acesso Rápido</h2>
            <div className="grid grid-cols-2 gap-3">
              {podeCriarModelos && (
                <QuickActionButton
                  to="/modelos"
                  icon="📄"
                  label="Criar Modelo"
                />
              )}
              {podeCadastrarProdutos && (
                <QuickActionButton
                  to="/produtos"
                  icon="📦"
                  label="Produtos"
                />
              )}
              {podeUsarToken && (
                <QuickActionButton
                  to="/tokens"
                  icon="🔑"
                  label="Tokens API"
                />
              )}
              <QuickActionButton
                to="/empresas"
                icon="🏢"
                label="Empresas"
              />
            </div>
          </div>
        </div>

        {/* Estatísticas */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard
            title="Empresas Ativas"
            value={`${empresasAtivas} / ${limitEmpresas}`}
            icon="🏢"
            color="blue"
          />
          <StatCard
            title="Modelos Criados"
            value="12"
            icon="📄"
            color="green"
          />
          <StatCard
            title="Produtos Cadastrados"
            value="48"
            icon="📦"
            color="purple"
          />
        </div>
      </div>
    );
  }

  return null;
};

// Componentes auxiliares
const StatCard = ({ title, value, icon, color }: any) => (
  <div className={`bg-${color}-50 border border-${color}-200 p-4 rounded-lg`}>
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm text-gray-600">{title}</p>
        <p className="text-2xl font-bold">{value}</p>
      </div>
      <span className="text-4xl">{icon}</span>
    </div>
  </div>
);

const QuickActionButton = ({ to, icon, label }: any) => (
  <a
    href={to}
    className="flex flex-col items-center justify-center p-4 bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
  >
    <span className="text-3xl mb-2">{icon}</span>
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </a>
);

export default Dashboard;
```

---

## 2. 🗂️ Exemplo: Sidebar Completa com Permissões

```typescript
// src/components/Sidebar.tsx
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { usePermissions } from '@/hooks/usePermissions';
import { useAuth } from '@/contexts/AuthContext';

const Sidebar: React.FC = () => {
  const location = useLocation();
  const { logout } = useAuth();
  const {
    isMaster,
    isCliente,
    podeCriarModelos,
    podeCadastrarProdutos,
    podeUsarToken,
    getStatusColor,
    getStatusText,
  } = usePermissions();

  const isActive = (path: string) => location.pathname === path;

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen p-4">
      {/* Logo/Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-primary">Sistema</h1>
        <p className="text-sm text-gray-600">
          {isMaster ? '👑 Administrador' : '👤 Cliente'}
        </p>
      </div>

      {/* Status Badge (para clientes) */}
      {isCliente && (
        <div className={`mb-4 p-3 rounded-lg border-2 ${
          getStatusColor() === 'green' ? 'bg-green-50 border-green-200' :
          getStatusColor() === 'yellow' ? 'bg-yellow-50 border-yellow-200' :
          'bg-red-50 border-red-200'
        }`}>
          <p className="text-xs font-medium">Status da Licença</p>
          <p className="text-sm font-bold">{getStatusText()}</p>
        </div>
      )}

      {/* Menu Items */}
      <nav className="space-y-1">
        <SidebarItem
          to="/dashboard"
          icon="📊"
          label="Dashboard"
          active={isActive('/dashboard')}
        />

        {/* Itens só para Master */}
        {isMaster && (
          <>
            <SidebarItem
              to="/usuarios"
              icon="👥"
              label="Usuários"
              active={isActive('/usuarios')}
            />
            <SidebarItem
              to="/licencas"
              icon="📄"
              label="Licenças"
              active={isActive('/licencas')}
            />
            <SidebarItem
              to="/configuracoes"
              icon="⚙️"
              label="Configurações"
              active={isActive('/configuracoes')}
            />
          </>
        )}

        {/* Itens condicionais para Cliente */}
        {podeCriarModelos && (
          <SidebarItem
            to="/modelos"
            icon="📄"
            label="Modelos"
            active={isActive('/modelos')}
          />
        )}

        {podeCadastrarProdutos && (
          <SidebarItem
            to="/produtos"
            icon="📦"
            label="Produtos"
            active={isActive('/produtos')}
          />
        )}

        {podeUsarToken && (
          <SidebarItem
            to="/tokens"
            icon="🔑"
            label="Tokens API"
            active={isActive('/tokens')}
          />
        )}

        {/* Empresas (sempre para cliente) */}
        {isCliente && (
          <SidebarItem
            to="/empresas"
            icon="🏢"
            label="Empresas"
            active={isActive('/empresas')}
          />
        )}

        {/* Licença (só para cliente) */}
        {isCliente && (
          <SidebarItem
            to="/minha-licenca"
            icon="📋"
            label="Minha Licença"
            active={isActive('/minha-licenca')}
          />
        )}
      </nav>

      {/* Logout */}
      <div className="mt-auto pt-4 border-t border-gray-200">
        <button
          onClick={logout}
          className="w-full flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
        >
          <span>🚪</span>
          <span>Sair</span>
        </button>
      </div>
    </aside>
  );
};

const SidebarItem = ({ to, icon, label, active }: any) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors ${
      active
        ? 'bg-primary text-white'
        : 'text-gray-700 hover:bg-gray-100'
    }`}
  >
    <span>{icon}</span>
    <span className="font-medium">{label}</span>
  </Link>
);

export default Sidebar;
```

---

## 3. 🔐 Exemplo: Configuração de Rotas Completa

```typescript
// src/routes/index.tsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from '@/components/ProtectedRoute';
import LoginPage from '@/pages/LoginPage';
import Dashboard from '@/pages/Dashboard';
import UsuariosPage from '@/pages/UsuariosPage';
import ModelosPage from '@/pages/ModelosPage';
import ProdutosPage from '@/pages/ProdutosPage';
import TokensPage from '@/pages/TokensPage';
import EmpresasPage from '@/pages/EmpresasPage';
import MinhaLicencaPage from '@/pages/MinhaLicencaPage';

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rota Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rota Inicial - Redireciona para Dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />

      {/* Dashboard - Acessível por todos autenticados */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* Rotas Exclusivas para Master */}
      <Route
        path="/usuarios"
        element={
          <ProtectedRoute requireMaster>
            <UsuariosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/usuarios/new"
        element={
          <ProtectedRoute requireMaster>
            <UsuariosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/usuarios/edit/:id"
        element={
          <ProtectedRoute requireMaster>
            <UsuariosPage />
          </ProtectedRoute>
        }
      />

      {/* Rotas com Permissões Específicas */}
      <Route
        path="/modelos"
        element={
          <ProtectedRoute requiredPermission="permite_criar_modelos">
            <ModelosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/produtos"
        element={
          <ProtectedRoute requiredPermission="permite_cadastrar_produtos">
            <ProdutosPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/tokens"
        element={
          <ProtectedRoute requiredPermission="permite_token">
            <TokensPage />
          </ProtectedRoute>
        }
      />

      {/* Rotas Exclusivas para Cliente */}
      <Route
        path="/empresas"
        element={
          <ProtectedRoute requireCliente>
            <EmpresasPage />
          </ProtectedRoute>
        }
      />

      <Route
        path="/minha-licenca"
        element={
          <ProtectedRoute requireCliente>
            <MinhaLicencaPage />
          </ProtectedRoute>
        }
      />

      {/* Rota 404 */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
```

---

## 4. 📄 Exemplo: Página de Modelos com Verificação

```typescript
// src/pages/ModelosPage.tsx
import React, { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import AlertaLicenca from '@/components/AlertaLicenca';

const ModelosPage: React.FC = () => {
  const { 
    podeCriarModelos, 
    apenasModelosPDF,
    licencaOK 
  } = usePermissions();

  const [modelos, setModelos] = useState([]);

  const handleCriarModelo = () => {
    if (!podeCriarModelos) {
      alert('Você não tem permissão para criar modelos');
      return;
    }
    // Lógica de criação
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">📄 Modelos de Etiquetas</h1>
        
        {podeCriarModelos && (
          <button
            onClick={handleCriarModelo}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark transition-colors"
          >
            ➕ Criar Novo Modelo
          </button>
        )}
      </div>

      {/* Alerta de Restrição */}
      {apenasModelosPDF && (
        <div className="mb-4">
          <AlertaLicenca
            tipo="sem-permissao"
            mensagem="Sua licença permite apenas modelos em PDF. Entre em contato para upgrade."
          />
        </div>
      )}

      {/* Lista de Modelos */}
      {modelos.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <p className="text-gray-600">
            Nenhum modelo criado ainda.
          </p>
          {podeCriarModelos && (
            <button
              onClick={handleCriarModelo}
              className="mt-4 text-primary hover:underline"
            >
              Criar seu primeiro modelo
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {modelos.map((modelo: any) => (
            <ModeloCard key={modelo.id} modelo={modelo} />
          ))}
        </div>
      )}
    </div>
  );
};

const ModeloCard = ({ modelo }: any) => (
  <div className="bg-white p-4 rounded-lg shadow hover:shadow-lg transition-shadow">
    <h3 className="font-bold mb-2">{modelo.nome}</h3>
    <p className="text-sm text-gray-600">{modelo.descricao}</p>
  </div>
);

export default ModelosPage;
```

---

## 5. 🏢 Exemplo: Página de Empresas com Limite

```typescript
// src/pages/EmpresasPage.tsx
import React, { useState } from 'react';
import { usePermissions } from '@/hooks/usePermissions';
import AlertaLicenca from '@/components/AlertaLicenca';

const EmpresasPage: React.FC = () => {
  const {
    limitEmpresas,
    empresasAtivas,
    podeAdicionarEmpresa,
  } = usePermissions();

  const [empresas, setEmpresas] = useState([]);

  const handleAdicionarEmpresa = () => {
    if (!podeAdicionarEmpresa) {
      alert('Você atingiu o limite de empresas');
      return;
    }
    // Lógica de adição
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">🏢 Empresas</h1>
          <p className="text-gray-600 mt-1">
            {empresasAtivas} / {limitEmpresas} empresas ativas
          </p>
        </div>

        {podeAdicionarEmpresa ? (
          <button
            onClick={handleAdicionarEmpresa}
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-dark"
          >
            ➕ Adicionar Empresa
          </button>
        ) : (
          <button
            disabled
            className="bg-gray-300 text-gray-500 px-4 py-2 rounded-lg cursor-not-allowed"
          >
            Limite Atingido
          </button>
        )}
      </div>

      {/* Alerta de Limite */}
      {!podeAdicionarEmpresa && (
        <div className="mb-4">
          <AlertaLicenca
            tipo="limite-empresas"
            onContato={() => window.location.href = 'mailto:suporte@sistema.com'}
          />
        </div>
      )}

      {/* Progresso */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Uso do Limite</span>
          <span className="text-sm text-gray-600">
            {empresasAtivas} / {limitEmpresas}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${
              empresasAtivas >= limitEmpresas ? 'bg-red-500' : 'bg-green-500'
            }`}
            style={{ width: `${(empresasAtivas / limitEmpresas) * 100}%` }}
          />
        </div>
      </div>

      {/* Lista de Empresas */}
      <div className="space-y-4">
        {empresas.map((empresa: any) => (
          <div key={empresa.id} className="bg-white p-4 rounded-lg shadow">
            <h3 className="font-bold">{empresa.razao_social}</h3>
            <p className="text-sm text-gray-600">CNPJ: {empresa.cnpj}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmpresasPage;
```

---

## 🎉 Todos os Exemplos Prontos!

Agora você tem exemplos completos de:
- ✅ Dashboard adaptativo
- ✅ Sidebar com permissões
- ✅ Configuração de rotas
- ✅ Páginas com verificação de permissões
- ✅ Controle de limites

**Basta copiar, colar e adaptar para seu projeto!** 🚀
