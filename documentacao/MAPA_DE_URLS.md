# 🗺️ Mapa de URLs do Sistema

## 📍 URLs Disponíveis

---

## 🔓 **Rotas Públicas (Sem Login)**

### Login
```
URL: http://localhost:5173/login
Descrição: Página de login (Master ou Cliente)
Componente: Login.tsx
```

---

## 🔐 **Rotas Protegidas (Requer Login)**

### 1. Dashboard (Página Inicial)
```
URL: http://localhost:5173/
Descrição: Dashboard principal (Master ou Cliente)
Componente: Dashboard.tsx
Acesso: Todos autenticados
```

### 2. Editor de Etiquetas
```
URL: http://localhost:5173/editor
Descrição: Editor de etiquetas
Componente: Editor.tsx
Acesso: Todos autenticados
```

### 3. Impressão
```
URL: http://localhost:5173/print
Descrição: Página de impressão
Componente: Print.tsx
Acesso: Todos autenticados
```

### 4. Integração API
```
URL: http://localhost:5173/api-integration
Descrição: Integração com API
Componente: ApiIntegration.tsx
Acesso: Clientes com permissão 'permite_token'
```

### 5. Modelos/Templates
```
URL: http://localhost:5173/templates
Descrição: Gerenciamento de modelos de etiquetas
Componente: Templates.tsx
Acesso: Clientes com permissão 'permite_criar_modelos'
```

### 6. **Gerenciamento de Usuários** ⭐
```
URL: http://localhost:5173/users
Descrição: Lista de usuários clientes
Componente: UsersManagement.tsx
Acesso: APENAS MASTER (Administradores)
```

### 7. **Criar Novo Usuário** ⭐
```
URL: http://localhost:5173/users/new
Descrição: Formulário de cadastro de novo usuário cliente
Componente: UserForm.tsx
Acesso: APENAS MASTER (Administradores)
```

### 8. **Editar Usuário** ⭐
```
URL: http://localhost:5173/users/edit/1
Descrição: Formulário de edição de usuário existente
Componente: UserForm.tsx
Acesso: APENAS MASTER (Administradores)
Parâmetro: {id} = ID do usuário (ex: 1, 2, 3...)
```

### 9. Histórico
```
URL: http://localhost:5173/history
Descrição: Histórico de ações
Componente: History.tsx
Acesso: Todos autenticados
```

### 10. Configurações
```
URL: http://localhost:5173/settings
Descrição: Configurações do sistema
Componente: Settings.tsx
Acesso: APENAS MASTER
```

### 11. Perfil
```
URL: http://localhost:5173/profile
Descrição: Perfil do usuário logado
Componente: Profile.tsx
Acesso: Todos autenticados
```

---

## 🎯 **Como Acessar as URLs de Usuários**

### ✅ **Para Listar Usuários:**
```bash
http://localhost:5173/users
```
- Mostra a tabela com todos os usuários cadastrados
- Botões de "Editar" e "Excluir" em cada linha
- Botão "Novo Usuário" no topo

### ✅ **Para Criar Novo Usuário:**
```bash
http://localhost:5173/users/new
```
- Formulário completo em branco
- Preenche dados do cliente
- Preenche dados da licença
- Preenche informações da empresa
- Botão "Criar Usuário"

### ✅ **Para Editar Usuário Existente:**
```bash
http://localhost:5173/users/edit/1    # Edita usuário com ID 1
http://localhost:5173/users/edit/2    # Edita usuário com ID 2
http://localhost:5173/users/edit/123  # Edita usuário com ID 123
```
- Formulário preenchido com dados atuais
- Permite alterar qualquer campo
- Botão "Salvar Alterações"

---

## 🧪 **Testando o Sistema de Usuários**

### Passo 1: Fazer Login como Master
```
1. Acesse: http://localhost:5173/login
2. Clique em "👑 Administrador"
3. Digite suas credenciais de Master
4. Será redirecionado para: http://localhost:5173/
```

### Passo 2: Acessar Lista de Usuários
```
1. No menu lateral, clique em "👥 Usuários"
   OU
2. Digite na barra de endereço: http://localhost:5173/users
```

### Passo 3: Criar Novo Usuário
```
1. Na página de usuários, clique em "Novo Usuário"
   OU
2. Digite na barra: http://localhost:5173/users/new
3. Preencha o formulário:
   - CNPJ (use o botão "Consultar" para auto-preencher)
   - Razão Social (preenchido automaticamente)
   - Telefone (preenchido automaticamente)
   - E-mail
   - Senha
   - Tipo de licença
   - Datas
   - Permissões
   - Informações da empresa (preenchido automaticamente)
4. Clique em "Criar Usuário"
```

### Passo 4: Editar Usuário
```
1. Na lista de usuários, clique no botão "Editar" (✏️)
   OU
2. Digite na barra: http://localhost:5173/users/edit/[ID]
3. Modifique os campos desejados
4. Clique em "Salvar Alterações"
```

---

## 🔒 **Controle de Acesso**

### URLs Acessíveis por **MASTER** (Administrador)
```
✅ /                          Dashboard
✅ /editor                    Editor
✅ /print                     Impressão
✅ /api-integration           API
✅ /templates                 Modelos
✅ /users                     ⭐ Lista de usuários
✅ /users/new                 ⭐ Criar usuário
✅ /users/edit/:id            ⭐ Editar usuário
✅ /history                   Histórico
✅ /settings                  Configurações
✅ /profile                   Perfil
```

### URLs Acessíveis por **CLIENTE**
```
✅ /                          Dashboard (versão cliente)
✅ /editor                    Editor
✅ /print                     Impressão
⚠️ /api-integration           Só se permite_token = true
⚠️ /templates                 Só se permite_criar_modelos = true
❌ /users                     Acesso Negado
❌ /users/new                 Acesso Negado
❌ /users/edit/:id            Acesso Negado
✅ /history                   Histórico
❌ /settings                  Acesso Negado
✅ /profile                   Perfil
```

---

## 🚨 **O que Acontece ao Acessar URLs Sem Permissão**

### Cliente tentando acessar `/users`
```
Resultado: Tela de "Acesso Negado"
Mensagem: "Esta área é restrita para administradores do sistema"
Botão: "Voltar"
```

### Usuário não logado tentando acessar qualquer rota protegida
```
Resultado: Redirecionamento automático para /login
```

### Cliente sem permissão tentando acessar `/templates`
```
Resultado: Tela de "Permissão Negada"
Mensagem: "Você não tem permissão para criar modelos"
Botão: "Solicitar Acesso" e "Voltar"
```

---

## 📱 **URLs Completas para Testes**

### Desenvolvimento Local
```
Login:              http://localhost:5173/login
Dashboard:          http://localhost:5173/
Usuários:           http://localhost:5173/users
Novo Usuário:       http://localhost:5173/users/new
Editar Usuário:     http://localhost:5173/users/edit/1
```

### Produção (exemplo)
```
Login:              https://seusistema.com.br/login
Dashboard:          https://seusistema.com.br/
Usuários:           https://seusistema.com.br/users
Novo Usuário:       https://seusistema.com.br/users/new
Editar Usuário:     https://seusistema.com.br/users/edit/1
```

---

## 🗂️ **Estrutura de Navegação no Menu**

```
Sidebar (Master):
├── 📊 Dashboard           → /
├── ✏️ Editor              → /editor
├── 🖨️ Impressão           → /print
├── 🔗 API                 → /api-integration
├── 📄 Modelos             → /templates
├── 👥 Usuários            → /users        ⭐
├── 📜 Histórico           → /history
├── ⚙️ Configurações       → /settings
└── 👤 Perfil              → /profile
```

```
Sidebar (Cliente):
├── 📊 Dashboard           → /
├── ✏️ Editor              → /editor
├── 🖨️ Impressão           → /print
├── 🔗 API                 → /api-integration (se permitido)
├── 📄 Modelos             → /templates (se permitido)
├── 📜 Histórico           → /history
└── 👤 Perfil              → /profile
```

---

## 💡 **Dicas Importantes**

1. **Sempre use URLs absolutas** (começando com `/`)
2. **IDs são numéricos** (ex: `/users/edit/1`, não `/users/edit/abc`)
3. **Sem login = redireciona para `/login`**
4. **Master vê tudo, Cliente vê apenas o permitido**
5. **URLs não existentes redirecionam para `/login`**

---

## 🎯 **Resposta Direta à sua Pergunta:**

### **Para acessar o gerenciamento de usuários:**

```bash
# Lista de usuários
http://localhost:5173/users

# Criar novo usuário
http://localhost:5173/users/new

# Editar usuário específico (substitua 1 pelo ID do usuário)
http://localhost:5173/users/edit/1
```

**⚠️ IMPORTANTE:** Você precisa estar logado como **Master (Administrador)** para acessar essas URLs!

---

## ✅ **Pronto para Usar!**

Agora você sabe exatamente qual URL usar para cada funcionalidade! 🚀
