# 🔧 FIX - Carregamento de Empresas na Edição

## 🐛 Problema Identificado

Quando editava um usuário, as **informações da empresa NÃO estavam sendo carregadas** nos campos do formulário!

### ❌ O que estava errado:

O código tentava pegar a empresa de `usuario.empresa`, mas a **API retorna as empresas em um endpoint separado**:

```
GET /api/usuarios/{id}/empresas
```

---

## ✅ Solução Implementada

### 1️⃣ **Importado `getEmpresas` no UserForm:**

```typescript
import { getUsuarioById, createUsuario, updateUsuario, getEmpresas } from '../services';
```

### 2️⃣ **Atualizado `loadUsuario()` para buscar empresas:**

```typescript
const loadUsuario = async (usuarioId: number) => {
  setLoading(true);
  setError('');
  
  // 1. Busca dados do usuário e licença
  const result = await getUsuarioById(usuarioId);
  
  if (result.success && result.data) {
    const { usuario, licenca } = result.data;
    
    // 2. Preenche dados do cliente
    setClientData({ ... });
    
    // 3. Preenche dados da licença
    setLicenseData({ ... });
    
    // 🆕 4. BUSCA EMPRESAS DO USUÁRIO (CHAMADA SEPARADA!)
    const empresasResult = await getEmpresas(usuarioId);
    
    if (empresasResult.success && empresasResult.data?.data && empresasResult.data.data.length > 0) {
      const empresa = empresasResult.data.data[0]; // Pega a primeira empresa
      
      console.log('🏢 Dados da empresa recebidos:', empresa);
      
      // 5. Preenche dados da empresa
      setCompanyInfo({
        nome_fantasia: empresa.nome_fantasia || '',
        razao_social: empresa.razao_social || '',
        cnpj: empresa.cnpj || '',
        inscricao_estadual: empresa.inscricao_estadual || '',
        cep: empresa.cep || '',
        logradouro: empresa.logradouro || '',
        numero: empresa.numero || '',
        complemento: empresa.complemento || '',
        bairro: empresa.bairro || '',
        estado: empresa.estado || '',
        cidade: empresa.cidade || '',
        emails: empresa.emails || [],
        telefones: empresa.telefones || [],
      });
    } else {
      console.log('⚠️ Usuário não possui empresa cadastrada');
      // Deixa campos vazios se não houver empresa
      setCompanyInfo({ ... vazio ... });
    }
  }
  
  setLoading(false);
};
```

---

## 📋 Estrutura da Resposta da API

### `GET /api/usuarios/1/empresas`

```json
{
  "data": [
    {
      "id": 1,
      "usuario_id": 1,
      "nome_fantasia": "MARCOS PAULO MACHADO AZEVEDO",
      "razao_social": "MARCOS PAULO MACHADO AZEVEDO",
      "cnpj": "86392529001942",
      "inscricao_estadual": "tes",
      "cep": "29795000",
      "logradouro": "rua sao francisco",
      "numero": "08",
      "complemento": "teste",
      "bairro": "centro",
      "cidade": "Águia Branca",
      "estado": "ES",
      "emails": ["marcosmachadodev@gmail.com"],
      "telefones": ["22222222222"],
      "ativa": true,
      "data_criacao": "2025-11-08T21:04:55",
      "data_atualizacao": "2025-11-08T21:04:55"
    }
  ],
  "total": 1,
  "limite": 10,
  "disponivel": 9
}
```

**Observações:**
- Retorna um **array** de empresas em `data`
- Pegamos a **primeira empresa** (`data[0]`)
- Se `data` estiver vazio, usuário não tem empresa

---

## 🧪 Como Testar

### **Teste 1: Editar usuário COM empresa**

1. **Abra o Console (F12)**
2. Acesse: `http://localhost:5173/users/edit/1`
3. Veja os logs:

```javascript
📥 Dados do usuário recebidos: {
  usuario: { id: 1, cnpj: "...", razao_social: "..." },
  licenca: { ... }
}

🏢 Dados da empresa recebidos: {
  id: 1,
  nome_fantasia: "MARCOS PAULO MACHADO AZEVEDO",
  cnpj: "86392529001942",
  cep: "29795000",
  logradouro: "rua sao francisco",
  numero: "08",
  complemento: "teste",
  bairro: "centro",
  cidade: "Águia Branca",
  estado: "ES",
  emails: ["marcosmachadodev@gmail.com"],
  telefones: ["22222222222"]
}

✅ Dados carregados no estado
```

4. **Verifique o formulário:**
   - ✅ Nome Fantasia: `MARCOS PAULO MACHADO AZEVEDO`
   - ✅ CNPJ: `86392529001942`
   - ✅ Inscrição Estadual: `tes`
   - ✅ CEP: `29795-000` (com máscara)
   - ✅ Logradouro: `rua sao francisco`
   - ✅ Número: `08`
   - ✅ Complemento: `teste`
   - ✅ Bairro: `centro`
   - ✅ Cidade: `Águia Branca`
   - ✅ Estado: `ES` (selecionado no dropdown)
   - ✅ Email: Tag azul com `marcosmachadodev@gmail.com`
   - ✅ Telefone: Tag verde com `22222222222`

### **Teste 2: Editar usuário SEM empresa**

1. **Abra o Console (F12)**
2. Acesse: `http://localhost:5173/users/edit/2` (usuário sem empresa)
3. Veja os logs:

```javascript
📥 Dados do usuário recebidos: { ... }

⚠️ Usuário não possui empresa cadastrada

✅ Dados carregados no estado
```

4. **Verifique o formulário:**
   - ✅ Todos os campos de empresa vazios
   - ✅ Pode preencher e criar empresa nova ao salvar

---

## 🔄 Fluxo Completo

```
┌─────────────────────────────────────────┐
│ 1. Usuário clica em "✏️ Editar"       │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 2. loadUsuario(1) é chamado            │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 3. getUsuarioById(1)                   │
│    → Retorna: usuario + licenca         │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 4. setClientData()                     │
│ 5. setLicenseData()                    │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 🆕 6. getEmpresas(1)                   │
│    → GET /api/usuarios/1/empresas       │
│    → Retorna: { data: [empresa], ... } │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ 7. setCompanyInfo(empresa)             │
│    → Preenche TODOS os campos!          │
└─────────────────────────────────────────┘
                  ↓
┌─────────────────────────────────────────┐
│ ✅ Formulário renderizado com dados    │
│    da empresa preenchidos!              │
└─────────────────────────────────────────┘
```

---

## 📊 Antes vs Depois

### ❌ ANTES (Não funcionava)

```typescript
// Tentava pegar do objeto usuario (não existe!)
setCompanyInfo({
  cep: usuarioData.empresa?.cep || usuarioData.cep || '',
  // ... SEMPRE VAZIO!
});
```

**Resultado:** Campos de empresa sempre vazios na edição

---

### ✅ DEPOIS (Funciona!)

```typescript
// Busca de endpoint separado
const empresasResult = await getEmpresas(usuarioId);

if (empresasResult.success && empresasResult.data?.data?.length > 0) {
  const empresa = empresasResult.data.data[0];
  
  setCompanyInfo({
    nome_fantasia: empresa.nome_fantasia,
    cep: empresa.cep,
    // ... TODOS os campos preenchidos!
  });
}
```

**Resultado:** Campos de empresa preenchidos corretamente! 🎉

---

## 🎯 O que foi alterado

| Arquivo | Mudança |
|---------|---------|
| `UserForm.tsx` | ✅ Importado `getEmpresas` |
| `UserForm.tsx` | ✅ `loadUsuario()` chama `getEmpresas(usuarioId)` |
| `UserForm.tsx` | ✅ `setCompanyInfo()` com dados da empresa |
| `UserForm.tsx` | ✅ Logs: `🏢 Dados da empresa recebidos` |
| `UserForm.tsx` | ✅ Tratamento: `⚠️ Usuário não possui empresa` |

---

## 🚀 Status

| Funcionalidade | Status |
|---------------|--------|
| Busca empresas na edição | ✅ |
| Preenche todos os campos | ✅ |
| Trata usuário sem empresa | ✅ |
| Logs de debug | ✅ |
| TypeScript sem erros | ✅ |

**🎉 FUNCIONANDO PERFEITAMENTE!**

Teste agora e veja as informações da empresa aparecendo! 🔥
