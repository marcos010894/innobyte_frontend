# 🚀 AUTO-PREENCHIMENTO COMPLETO COM CNPJ

## 🎯 Melhorias Implementadas

### ✅ 1. Consulta de CNPJ agora preenche TUDO automaticamente

Quando você consulta um CNPJ, agora preenche **automaticamente**:

#### **ClientDataForm (Dados do Cliente):**
- ✅ Razão Social
- ✅ Telefone
- ✅ E-mail

#### **CompanyInfoForm (Informações da Empresa):**
- ✅ CEP
- ✅ Logradouro
- ✅ Número
- ✅ Complemento
- ✅ Bairro
- ✅ Cidade
- ✅ Estado
- ✅ E-mails (array)
- ✅ Telefones (array)

### ✅ 2. Removida seção desnecessária

- ❌ **Removido:** `ApiConfigForm` da criação de usuário
- ✅ **Tokens** aparecem apenas na edição (quando `isEditing = true`)

---

## 🔄 Como Funciona Agora

### **Fluxo de Preenchimento Automático:**

```
1. Usuário digita CNPJ: 12.345.678/0001-95
   ↓
2. Clica em "📋 Consultar"
   ↓
3. consultarCNPJ() busca dados na API
   (BrasilAPI → ReceitaWS → CNPJ.ws)
   ↓
4. Retorna JSON completo:
   {
     razao_social: "EMPRESA TESTE LTDA",
     telefone: "(11) 98765-4321",
     email: "contato@empresa.com",
     cep: "01310100",
     logradouro: "Avenida Paulista",
     numero: "1000",
     complemento: "Sala 10",
     bairro: "Bela Vista",
     municipio: "São Paulo",
     uf: "SP"
   }
   ↓
5. ClientDataForm preenche seus campos:
   - Razão Social
   - Telefone (com máscara)
   - E-mail
   ↓
6. 🆕 ClientDataForm chama onCompanyDataFetched()
   ↓
7. 🆕 CompanyInfoForm recebe os dados e preenche:
   - CEP (com máscara)
   - Logradouro
   - Número
   - Complemento
   - Bairro
   - Cidade
   - Estado (dropdown)
   - Emails (array)
   - Telefones (array)
   ↓
8. ✅ TUDO PREENCHIDO AUTOMATICAMENTE!
```

---

## 📝 Código Implementado

### 1️⃣ **ClientDataForm - Nova prop `onCompanyDataFetched`**

```typescript
interface ClientDataFormProps {
  data?: { ... };
  onChange?: (data: any) => void;
  onCompanyDataFetched?: (companyData: any) => void; // 🆕 Callback
}

const ClientDataForm = ({ data, onChange, onCompanyDataFetched }: ClientDataFormProps) => {
  // ...
  
  const handleConsultarCNPJ = async () => {
    const result = await consultarCNPJ(cnpjLimpo);
    
    if (result.success && result.data) {
      // Preenche dados do cliente
      const newData = {
        ...clientData,
        razaoSocial: result.data.razao_social,
        telefone: mascararTelefone(result.data.telefone),
        email: result.data.email,
      };
      setClientData(newData);
      onChange?.(newData);

      // 🆕 Envia dados da empresa para o CompanyInfoForm
      if (onCompanyDataFetched) {
        onCompanyDataFetched({
          inscricao_estadual: '',
          cep: result.data.cep || '',
          logradouro: result.data.logradouro || '',
          numero: result.data.numero || '',
          complemento: result.data.complemento || '',
          bairro: result.data.bairro || '',
          cidade: result.data.municipio || '',
          estado: result.data.uf || '',
          emails: result.data.email ? [result.data.email] : [],
          telefones: result.data.telefone ? [result.data.telefone] : [],
        });
      }
      
      alert('✅ Dados da empresa preenchidos automaticamente!');
    }
  };
};
```

### 2️⃣ **UserForm - Passa callback para ClientDataForm**

```typescript
<ClientDataForm 
  data={clientData} 
  onChange={setClientData}
  onCompanyDataFetched={setCompanyInfo} // 🆕 Preenche CompanyInfoForm
/>
```

### 3️⃣ **UserForm - Removido ApiConfigForm**

```typescript
// ❌ ANTES:
<div className="space-y-6">
  <CompanyInfoForm data={companyInfo} onChange={setCompanyInfo} />
  <ApiConfigForm />  // ← Removido!
</div>

// ✅ DEPOIS:
<div className="space-y-6">
  <CompanyInfoForm data={companyInfo} onChange={setCompanyInfo} />
</div>
```

### 4️⃣ **TokensTable - Só na edição**

```typescript
{isEditing && (
  <div className="mt-6 pt-6 border-t border-gray-200">
    <TokensTable />
  </div>
)}
```

---

## 🎨 Visual do Formulário

### **ANTES (manual):**

```
1. Digite CNPJ → Consultar
2. ✅ Razão Social preenchida
3. ✅ Telefone preenchido
4. ✅ E-mail preenchido
5. ❌ CEP vazio
6. ❌ Endereço vazio
7. ❌ Cidade/Estado vazios
```

### **DEPOIS (automático):**

```
1. Digite CNPJ → Consultar
2. ✅ Razão Social preenchida
3. ✅ Telefone preenchido
4. ✅ E-mail preenchido
5. ✅ CEP preenchido (com máscara)
6. ✅ Logradouro preenchido
7. ✅ Número preenchido
8. ✅ Complemento preenchido
9. ✅ Bairro preenchido
10. ✅ Cidade preenchida
11. ✅ Estado selecionado no dropdown
12. ✅ E-mail adicionado à lista
13. ✅ Telefone adicionado à lista
```

---

## 🧪 Como Testar

### **Teste 1: Criar Novo Usuário**

1. Acesse: `http://localhost:5173/users/new`
2. Digite CNPJ: `12.345.678/0001-95`
3. Clique em **"📋 Consultar"**
4. **Aguarde** o loading...
5. **Veja a mágica acontecer:**
   ```
   ✅ Razão Social: EMPRESA TESTE LTDA
   ✅ Telefone: (11) 98765-4321
   ✅ E-mail: contato@empresa.com
   
   (Role para baixo)
   
   ✅ CEP: 01310-100
   ✅ Logradouro: Avenida Paulista
   ✅ Número: 1000
   ✅ Complemento: Sala 10
   ✅ Bairro: Bela Vista
   ✅ Cidade: São Paulo
   ✅ Estado: SP
   ✅ E-mail na lista: [contato@empresa.com ×]
   ✅ Telefone na lista: [(11) 98765-4321 ×]
   ```

6. ✅ Alert: "Dados da empresa preenchidos automaticamente!"
7. Adicione **senha** e **informações da licença**
8. Clique **"Criar Usuário"**
9. ✅ Sucesso!

### **Teste 2: Verificar seções**

1. **Na CRIAÇÃO** (`/users/new`):
   - ✅ Mostra: Dados do Cliente, Licença, Informações da Empresa
   - ❌ **NÃO mostra:** ApiConfigForm
   - ❌ **NÃO mostra:** TokensTable

2. **Na EDIÇÃO** (`/users/edit/1`):
   - ✅ Mostra: Dados do Cliente, Licença, Informações da Empresa
   - ❌ **NÃO mostra:** ApiConfigForm
   - ✅ **Mostra:** TokensTable (para gerenciar tokens do usuário)

---

## 📊 Dados que vêm da API de CNPJ

### **BrasilAPI retorna:**

```json
{
  "cnpj": "12345678000195",
  "razao_social": "EMPRESA TESTE LTDA",
  "nome_fantasia": "EMPRESA TESTE",
  "cep": "01310100",
  "logradouro": "Avenida Paulista",
  "numero": "1000",
  "complemento": "Sala 10",
  "bairro": "Bela Vista",
  "municipio": "São Paulo",
  "uf": "SP",
  "ddd_telefone_1": "1198765432",
  "email": "contato@empresa.com"
}
```

### **Mapeamento para o formulário:**

| Campo API | Campo Formulário | Formatação |
|-----------|------------------|------------|
| `razao_social` | ClientData → Razão Social | Nenhuma |
| `ddd_telefone_1` | ClientData → Telefone | Máscara: (XX) XXXXX-XXXX |
| `email` | ClientData → E-mail | Nenhuma |
| `cep` | CompanyInfo → CEP | Máscara: XXXXX-XXX |
| `logradouro` | CompanyInfo → Logradouro | Nenhuma |
| `numero` | CompanyInfo → Número | Nenhuma |
| `complemento` | CompanyInfo → Complemento | Nenhuma |
| `bairro` | CompanyInfo → Bairro | Nenhuma |
| `municipio` | CompanyInfo → Cidade | Nenhuma |
| `uf` | CompanyInfo → Estado | Dropdown |
| `email` | CompanyInfo → E-mails | Array: [email] |
| `ddd_telefone_1` | CompanyInfo → Telefones | Array: [telefone] |

---

## ✅ Benefícios

1. **Menos digitação** - Usuário só precisa digitar CNPJ e senha
2. **Menos erros** - Dados vêm direto da Receita Federal
3. **Mais rápido** - Formulário preenchido em segundos
4. **Interface limpa** - Removida seção desnecessária (ApiConfig)
5. **Tokens organizados** - Aparecem só na edição

---

## 🎯 Status Final

| Funcionalidade | Status |
|---------------|--------|
| CNPJ preenche ClientDataForm | ✅ |
| CNPJ preenche CompanyInfoForm | ✅ |
| Callback onCompanyDataFetched | ✅ |
| CEP com máscara | ✅ |
| Estado no dropdown | ✅ |
| E-mails em array | ✅ |
| Telefones em array | ✅ |
| ApiConfigForm removido | ✅ |
| TokensTable só na edição | ✅ |
| TypeScript sem erros | ✅ |

**🎉 AGORA É SÓ DIGITAR O CNPJ E PRONTO!** 🚀
