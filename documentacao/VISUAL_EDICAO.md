# 📸 VISUAL - Como deve aparecer na edição

## 🎬 Fluxo de Edição de Usuário

### PASSO 1: Clicar em "Editar" na lista de usuários
```
┌─────────────────────────────────────────────────┐
│  👤 Gerenciar Usuários                          │
├─────────────────────────────────────────────────┤
│  ID  │  CNPJ           │  Razão Social  │ 🔧    │
│  1   │  12.345.678/... │  Empresa XYZ   │ ✏️ 🗑️ │
│                                          👆 CLICAR
└─────────────────────────────────────────────────┘
```

---

### PASSO 2: Página carrega e chama `loadUsuario(1)`

**Console (F12):**
```javascript
📥 Dados recebidos do backend: {
  usuario: {
    id: 1,
    cnpj: "12345678000195",
    razao_social: "Empresa Teste LTDA",
    telefone: "11987654321",
    email: "contato@empresa.com",
    
    // ⬇️ INFORMAÇÕES DA EMPRESA ⬇️
    cep: "01310100",
    logradouro: "Avenida Paulista",
    numero: "1578",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    emails: [
      "comercial@empresa.com",
      "financeiro@empresa.com"
    ],
    telefones: [
      "(11) 3456-7890",
      "(11) 98765-4321"
    ]
  },
  licenca: { ... }
}

✅ Dados carregados no estado: {
  clientData: {
    cnpj: "12345678000195",
    razaoSocial: "Empresa Teste LTDA"
  },
  companyInfo: {
    cep: "01310100",
    logradouro: "Avenida Paulista",
    numero: "1578",
    emails: ["comercial@empresa.com", "financeiro@empresa.com"],
    telefones: ["(11) 3456-7890", "(11) 98765-4321"]
  }
}
```

---

### PASSO 3: Formulário renderizado com dados preenchidos

```
┌─────────────────────────────────────────────────────────────┐
│  ✏️ Editar Usuário                         [← Voltar]       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────────────┐  ┌──────────────────────────┐ │
│  │ 👤 Dados do Cliente      │  │ 🏢 Informações Adicionais│ │
│  ├──────────────────────────┤  │    da Empresa            │ │
│  │                          │  ├──────────────────────────┤ │
│  │ CNPJ:                    │  │                          │ │
│  │ 12.345.678/0001-95 [📋] │  │ CEP:                     │ │
│  │                          │  │ 01310-100    [Consultar] │ │
│  │ Razão Social:            │  │                          │ │
│  │ Empresa Teste LTDA       │  │ Logradouro:              │ │
│  │                          │  │ Avenida Paulista         │ │
│  │ Telefone:                │  │                          │ │
│  │ (11) 98765-4321          │  │ Número:      Complemento:│ │
│  │                          │  │ 1578         (vazio)     │ │
│  │ E-mail:                  │  │                          │ │
│  │ contato@empresa.com      │  │ Bairro:                  │ │
│  │                          │  │ Bela Vista               │ │
│  │ Senha:                   │  │                          │ │
│  │ (deixe vazio para manter)│  │ Cidade:      Estado:     │ │
│  │                          │  │ São Paulo    [SP ▼]      │ │
│  └──────────────────────────┘  │                          │ │
│                                 │ E-mails Adicionais:      │ │
│  ┌──────────────────────────┐  │ [digite e pressione Enter]│ │
│  │ 📄 Informações da Licença│  │                          │ │
│  ├──────────────────────────┤  │ ┌───────────────────────┐│ │
│  │ ...                      │  │ │ comercial@empresa.com ×││ │
│  └──────────────────────────┘  │ │ financeiro@empresa.com×││ │
│                                 │ └───────────────────────┘│ │
│                                 │                          │ │
│                                 │ Telefones Adicionais:    │ │
│                                 │ [digite e pressione Enter]│ │
│                                 │                          │ │
│                                 │ ┌───────────────────────┐│ │
│                                 │ │ (11) 3456-7890       ×││ │
│                                 │ │ (11) 98765-4321      ×││ │
│                                 │ └───────────────────────┘│ │
│                                 └──────────────────────────┘ │
│                                                               │
│  ─────────────────────────────────────────────────────────  │
│                                          [Cancelar] [💾 Salvar]│
└─────────────────────────────────────────────────────────────┘
```

---

### PASSO 4: Usuário modifica algo (ex: adiciona email)

```
Telefones Adicionais:
┌─────────────────────────────────────┐
│ suporte@empresa.com                 │ ← Digite aqui
└─────────────────────────────────────┘
Adicionar com 'Enter'

↓ Pressiona Enter ↓

┌───────────────────────────────────────┐
│ comercial@empresa.com              × │
│ financeiro@empresa.com             × │
│ suporte@empresa.com                × │ ← Novo!
└───────────────────────────────────────┘
```

---

### PASSO 5: Clicar em "Salvar Alterações"

**Console (F12):**
```javascript
📤 Dados sendo enviados para a API: {
  cnpj: "12345678000195",
  razao_social: "Empresa Teste LTDA",
  telefone: "11987654321",
  email: "contato@empresa.com",
  tipo_licenca: "contrato",
  data_inicio: "2025-01-01",
  data_expiracao: "2026-01-01",
  intervalo: "mensal",
  // ... outros campos de licença ...
  
  // ⬇️ INFORMAÇÕES DA EMPRESA ⬇️
  cep: "01310100",                    // ← Sem máscara!
  logradouro: "Avenida Paulista",
  numero: "1578",
  bairro: "Bela Vista",
  cidade: "São Paulo",
  estado: "SP",
  emails: [
    "comercial@empresa.com",
    "financeiro@empresa.com",
    "suporte@empresa.com"             // ← Novo email!
  ],
  telefones: [
    "(11) 3456-7890",
    "(11) 98765-4321"
  ]
}
```

---

### PASSO 6: Sucesso!

```
┌──────────────────────────────┐
│  ✅                          │
│  Usuário atualizado com      │
│  sucesso!                    │
│                              │
│           [OK]               │
└──────────────────────────────┘

↓ Redireciona para /users ↓

┌─────────────────────────────────────────────────┐
│  👤 Gerenciar Usuários                          │
├─────────────────────────────────────────────────┤
│  ID  │  CNPJ           │  Razão Social  │ 🔧    │
│  1   │  12.345.678/... │  Empresa XYZ   │ ✏️ 🗑️ │
│  ...                                             │
└─────────────────────────────────────────────────┘
```

---

## ⚠️ SE NÃO APARECER OS DADOS:

### ❌ CAMPOS VAZIOS:

```
🏢 Informações Adicionais da Empresa
┌──────────────────────────────┐
│ CEP:                         │
│ [____________]  [Consultar]  │ ← VAZIO!
│                              │
│ Logradouro:                  │
│ [________________________]   │ ← VAZIO!
│                              │
│ E-mails Adicionais:          │
│ [digite e pressione Enter]   │
│ (nenhum email)               │ ← SEM TAGS!
└──────────────────────────────┘
```

**🔍 DEBUG:**
1. Abra o Console (F12)
2. Veja o log `📥 Dados recebidos do backend`
3. Verifique se `usuario.cep`, `usuario.emails`, etc. existem
4. Se forem `undefined` → **Problema no BACKEND**

---

## ✅ TUDO CERTO QUANDO:

✅ Console mostra `�� Dados recebidos` com todos os campos
✅ Console mostra `✅ Dados carregados no estado`
✅ Campos de empresa preenchidos automaticamente
✅ Tags de emails aparecem
✅ Tags de telefones aparecem
✅ CEP com máscara (01310-100)
✅ Estado selecionado no dropdown
✅ Ao salvar, console mostra `📤 Dados sendo enviados`
✅ Alert de sucesso aparece
✅ Redireciona para lista de usuários

---

## 🎯 PRÓXIMO PASSO:

**TESTE AGORA:**
1. `npm run dev` (se não estiver rodando)
2. Abra http://localhost:5173/users
3. Clique em ✏️ para editar um usuário
4. Abra Console (F12)
5. Veja os logs
6. Verifique se os campos estão preenchidos

**SE NÃO FUNCIONAR:**
→ Copie o log `📥 Dados recebidos do backend` e me mostre!
→ Vou identificar o problema na hora! 🔍
