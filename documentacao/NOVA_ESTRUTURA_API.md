# 🚀 ATUALIZAÇÃO - Nova Estrutura da API

## ✅ O que mudou?

A API agora aceita os dados da **empresa** como um **objeto separado** no payload!

---

## 📦 Estrutura ANTIGA (não funciona mais)

```javascript
// ❌ ANTIGA - Campos soltos no payload
{
  cnpj: "12345678000190",
  razao_social: "Empresa Teste",
  email: "teste@email.com",
  // ... outros campos do usuário ...
  
  // ❌ Campos da empresa soltos
  cep: "01310100",
  logradouro: "Av Paulista",
  numero: "1000",
  bairro: "Bela Vista",
  cidade: "São Paulo",
  estado: "SP",
  emails: ["email@empresa.com"],
  telefones: ["(11) 98765-4321"]
}
```

---

## 📦 Estrutura NOVA (implementada agora!)

```javascript
// ✅ NOVA - Empresa como objeto separado
{
  cnpj: "12345678000190",
  razao_social: "Empresa Teste",
  telefone: "(11) 98765-4321",
  email: "teste@email.com",
  senha: "SenhaSegura123",
  
  // Campos da licença
  tipo_licenca: "contrato",
  data_inicio: "2025-01-01",
  data_expiracao: "2025-12-31",
  intervalo: "mensal",
  limite_empresas: 5,
  usuarios_adicionais: 0,
  valor_parcela: 299.90,
  bloqueada: false,
  renovacao_automatica: true,
  apenas_modelos_pdf: false,
  permite_token: true,
  permite_criar_modelos: true,
  permite_cadastrar_produtos: true,
  
  // ✅ EMPRESA COMO OBJETO SEPARADO
  empresa: {
    nome_fantasia: "Empresa Teste",
    razao_social: "Empresa Teste LTDA",
    cnpj: "12345678000190",
    inscricao_estadual: "123456789",
    cep: "01310100",
    logradouro: "Avenida Paulista",
    numero: "1000",
    complemento: "Sala 101",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    emails: [
      "contato@empresa.com",
      "financeiro@empresa.com"
    ],
    telefones: [
      "(11) 98765-4321",
      "(11) 3456-7890"
    ]
  }
}
```

---

## 🔄 Mudanças no Frontend

### 1️⃣ **Estado `companyInfo` atualizado:**

```typescript
const [companyInfo, setCompanyInfo] = useState<any>({
  nome_fantasia: '',        // ✅ NOVO
  razao_social: '',         // ✅ NOVO
  cnpj: '',                 // ✅ NOVO
  inscricao_estadual: '',   // ✅ NOVO
  cep: '',
  logradouro: '',
  numero: '',
  complemento: '',          // ✅ NOVO
  bairro: '',
  estado: '',
  cidade: '',
  emails: [],
  telefones: [],
});
```

### 2️⃣ **Carregamento na edição (suporta ambas estruturas):**

```typescript
setCompanyInfo({
  // Tenta pegar do objeto empresa primeiro, senão pega direto do usuário
  nome_fantasia: usuarioData.empresa?.nome_fantasia || usuarioData.nome_fantasia || '',
  razao_social: usuarioData.empresa?.razao_social || clientData.razaoSocial || '',
  cnpj: usuarioData.empresa?.cnpj || clientData.cnpj || '',
  inscricao_estadual: usuarioData.empresa?.inscricao_estadual || '',
  cep: usuarioData.empresa?.cep || usuarioData.cep || '',
  logradouro: usuarioData.empresa?.logradouro || usuarioData.logradouro || '',
  // ... e assim por diante
});
```

### 3️⃣ **Envio para API (nova estrutura):**

```typescript
const dadosUsuario = {
  // Dados do usuário e licença...
  cnpj: removerMascara(clientData.cnpj),
  razao_social: clientData.razaoSocial,
  // ... outros campos
};

// Adiciona empresa como objeto separado
const temDadosEmpresa = companyInfo.cep || companyInfo.logradouro || 
                        companyInfo.emails?.length > 0 || companyInfo.telefones?.length > 0;

if (temDadosEmpresa) {
  dadosUsuario.empresa = {
    nome_fantasia: companyInfo.nome_fantasia || clientData.razaoSocial,
    razao_social: companyInfo.razao_social || clientData.razaoSocial,
    cnpj: removerMascara(companyInfo.cnpj || clientData.cnpj),
    inscricao_estadual: companyInfo.inscricao_estadual || '',
    cep: removerMascara(companyInfo.cep),
    logradouro: companyInfo.logradouro,
    numero: companyInfo.numero,
    complemento: companyInfo.complemento || '',
    bairro: companyInfo.bairro,
    cidade: companyInfo.cidade,
    estado: companyInfo.estado,
    emails: companyInfo.emails?.length > 0 ? companyInfo.emails : [clientData.email],
    telefones: companyInfo.telefones?.length > 0 ? companyInfo.telefones : [removerMascara(clientData.telefone)],
  };
}
```

---

## 🎨 Novos Campos no Formulário

O **CompanyInfoForm** agora tem:

### ✅ Campos Adicionados:
1. **Nome Fantasia** - Nome comercial da empresa
2. **Razão Social** - Razão social completa
3. **CNPJ** - CNPJ da empresa
4. **Inscrição Estadual** - IE da empresa
5. **Complemento** - Complemento do endereço (sala, andar, etc.)

### ✅ Campos Existentes (mantidos):
- CEP (com consulta automática)
- Logradouro
- Número
- Bairro
- Cidade
- Estado (dropdown)
- E-mails Adicionais (array)
- Telefones Adicionais (array)

---

## 🧪 Como Testar

### **Teste 1: Criar Usuário COM Empresa**

1. Acesse `/users/new`
2. Preencha **Dados do Cliente**
3. Preencha **Informações da Licença**
4. Preencha **🏢 Informações Adicionais da Empresa**:
   - Nome Fantasia: `Empresa Exemplo`
   - Razão Social: `Empresa Exemplo LTDA`
   - CNPJ: `12.345.678/0001-95`
   - Inscrição Estadual: `123456789`
   - CEP: `01310-100` → Clicar "Consultar"
   - Número: `1000`
   - Complemento: `Sala 10`
   - Adicionar email: `teste@empresa.com` + Enter
   - Adicionar telefone: `(11) 98765-4321` + Enter
5. Clicar "Criar Usuário"
6. **Abrir Console (F12)** e ver:
   ```javascript
   📤 Dados sendo enviados para a API: {
     cnpj: "12345678000195",
     razao_social: "...",
     // ... outros campos usuário/licença ...
     
     empresa: {  // ← OBJETO EMPRESA SEPARADO!
       nome_fantasia: "Empresa Exemplo",
       razao_social: "Empresa Exemplo LTDA",
       cnpj: "12345678000195",
       inscricao_estadual: "123456789",
       cep: "01310100",
       logradouro: "Avenida Paulista",
       numero: "1000",
       complemento: "Sala 10",
       bairro: "Bela Vista",
       cidade: "São Paulo",
       estado: "SP",
       emails: ["teste@empresa.com"],
       telefones: ["11987654321"]
     }
   }
   ```

### **Teste 2: Criar Usuário SEM Empresa**

1. Acesse `/users/new`
2. Preencha **apenas** Dados do Cliente e Licença
3. **NÃO preencha** Informações da Empresa
4. Clicar "Criar Usuário"
5. Console mostra:
   ```javascript
   📤 Dados sendo enviados para a API: {
     cnpj: "12345678000195",
     razao_social: "...",
     // ... outros campos ...
     
     // SEM campo 'empresa'!
   }
   ```

### **Teste 3: Editar Usuário e Adicionar Empresa**

1. Acesse `/users/edit/1`
2. Console mostra:
   ```javascript
   📥 Dados recebidos do backend: {
     usuario: {
       id: 1,
       empresa: {  // ← Se backend retorna assim
         nome_fantasia: "...",
         cep: "...",
         // ...
       }
     }
   }
   
   ✅ Dados carregados no estado: {
     companyInfo: {
       nome_fantasia: "...",
       cep: "...",
       // Campos preenchidos!
     }
   }
   ```
3. Campos da empresa aparecem preenchidos
4. Modificar algum campo
5. Clicar "Salvar"
6. Console mostra payload com objeto `empresa` atualizado

---

## 📊 Resumo das Alterações

| Arquivo | O que mudou |
|---------|-------------|
| `UserForm.tsx` | ✅ Estado `companyInfo` com 5 campos novos |
| `UserForm.tsx` | ✅ `loadUsuario()` suporta empresa como objeto ou campos soltos |
| `UserForm.tsx` | ✅ `handleSave()` envia empresa como objeto separado |
| `CompanyInfoForm.tsx` | ✅ Estado com 5 campos novos |
| `CompanyInfoForm.tsx` | ✅ useEffect sincroniza 5 campos novos |
| `CompanyInfoForm.tsx` | ✅ JSX com 5 novos inputs no formulário |

---

## 🎯 Compatibilidade

O código agora é **retrocompatível**:

- ✅ Se backend retorna `usuario.empresa.cep` → funciona
- ✅ Se backend retorna `usuario.cep` → funciona também
- ✅ Se não preencher empresa → não envia objeto `empresa`
- ✅ Se preencher empresa → envia como objeto separado

---

## 🚀 Status

| Funcionalidade | Status |
|---------------|--------|
| Novos campos no estado | ✅ |
| Novos campos no formulário | ✅ |
| Carregamento retrocompatível | ✅ |
| Envio com objeto empresa | ✅ |
| Logs de debug | ✅ |
| TypeScript sem erros | ✅ |

**🎉 TUDO FUNCIONANDO!**

Teste agora e veja a mágica! 🔍
