# 🧪 TESTE - Informações Adicionais da Empresa

## ✅ O que foi implementado:

### 1️⃣ **Estado no UserForm** ✅
```typescript
const [companyInfo, setCompanyInfo] = useState<any>({
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  estado: '',
  cidade: '',
  emails: [],
  telefones: [],
});
```

### 2️⃣ **Carregamento na Edição (loadUsuario)** ✅
```typescript
setCompanyInfo({
  cep: usuarioData.cep || '',
  logradouro: usuarioData.logradouro || '',
  numero: usuarioData.numero || '',
  bairro: usuarioData.bairro || '',
  estado: usuarioData.estado || '',
  cidade: usuarioData.cidade || '',
  emails: usuarioData.emails || [],
  telefones: usuarioData.telefones || [],
});
```

### 3️⃣ **Props passadas para CompanyInfoForm** ✅
```typescript
<CompanyInfoForm data={companyInfo} onChange={setCompanyInfo} />
```

### 4️⃣ **Dados enviados para API (handleSave)** ✅
```typescript
const dadosUsuario = {
  // ... outros campos ...
  cep: removerMascara(companyInfo.cep),
  logradouro: companyInfo.logradouro,
  numero: companyInfo.numero,
  bairro: companyInfo.bairro,
  cidade: companyInfo.cidade,
  estado: companyInfo.estado,
  emails: companyInfo.emails,
  telefones: companyInfo.telefones,
};
```

### 5️⃣ **Console.log para Debug** ✅
Adicionei logs em 3 pontos:

1. **Quando carrega do backend:**
```
📥 Dados recebidos do backend: { usuario, licenca }
```

2. **Quando preenche os estados:**
```
✅ Dados carregados no estado: { clientData, companyInfo }
```

3. **Quando envia para API:**
```
📤 Dados sendo enviados para a API: { dadosUsuario }
```

---

## 🧪 Como testar:

### **TESTE 1: Criar Novo Usuário**
1. Acesse `/users/new`
2. Preencha **Dados do Cliente**
3. Preencha **Informações da Licença**
4. Preencha **🏢 Informações Adicionais da Empresa:**
   - CEP: Digite e clique "Consultar" para puxar endereço
   - Número, complemento
   - Emails: Digite e pressione **Enter** (adiciona à lista)
   - Telefones: Digite e pressione **Enter** (adiciona à lista)
5. Clique em **"Criar Usuário"**
6. **Abra o Console (F12)** e veja:
   ```
   📤 Dados sendo enviados para a API: {
     cep: "12345678",
     logradouro: "Rua Exemplo",
     numero: "123",
     emails: ["email1@teste.com", "email2@teste.com"],
     telefones: ["(11) 98765-4321"],
     ...
   }
   ```

### **TESTE 2: Editar Usuário Existente**
1. Acesse `/users/edit/1` (ou outro ID)
2. **Abra o Console (F12)** ANTES de carregar
3. Veja os logs:
   ```
   📥 Dados recebidos do backend: {
     usuario: {
       id: 1,
       cnpj: "12345678000100",
       cep: "12345678",
       logradouro: "Rua Teste",
       emails: ["teste@email.com"],
       ...
     }
   }
   ```
   ```
   ✅ Dados carregados no estado: {
     companyInfo: {
       cep: "12345678",
       logradouro: "Rua Teste",
       emails: ["teste@email.com"],
       ...
     }
   }
   ```
4. **Verifique se os campos estão preenchidos:**
   - CEP com valor
   - Logradouro, número, bairro, cidade, estado
   - Lista de emails
   - Lista de telefones
5. Edite algum campo (ex: adicione mais um email)
6. Clique em **"Salvar Alterações"**
7. Veja no console:
   ```
   📤 Dados sendo enviados para a API: {
     cep: "12345678",
     emails: ["teste@email.com", "novo@email.com"],
     ...
   }
   ```

---

## 🔍 O que verificar:

### ✅ DEVE FUNCIONAR:
- [ ] **Criar:** Dados de empresa são enviados e salvos
- [ ] **Editar:** Dados de empresa são carregados nos campos
- [ ] **Editar:** Dados modificados são salvos
- [ ] **CEP:** Consulta preenche endereço automaticamente
- [ ] **Emails:** Pressionar Enter adiciona à lista
- [ ] **Telefones:** Pressionar Enter adiciona à lista
- [ ] **Arrays:** Botão "×" remove item da lista

### ❌ PROBLEMAS POSSÍVEIS:

#### **Se os campos NÃO carregam na edição:**
→ **Backend não está retornando os campos** (`cep`, `logradouro`, etc.)
→ Veja o log: `📥 Dados recebidos do backend`
→ Se `usuario.cep` for `undefined`, o backend precisa incluir esses campos no SELECT

#### **Se os dados NÃO salvam:**
→ Veja o log: `📤 Dados sendo enviados para a API`
→ Se os campos estão no payload mas não salvam, o backend não está processando
→ Backend precisa aceitar e salvar: `cep`, `logradouro`, `numero`, `bairro`, `cidade`, `estado`, `emails`, `telefones`

---

## 🛠️ Próximos passos SE necessário:

### Se backend não retorna os campos:
```python
# No backend, adicionar no SELECT:
usuario = db.query(Usuario).options(
    selectinload(Usuario.licenca)
).filter(Usuario.id == usuario_id).first()

return {
    "usuario": {
        "id": usuario.id,
        "cnpj": usuario.cnpj,
        "cep": usuario.cep,  # ← IMPORTANTE
        "logradouro": usuario.logradouro,  # ← IMPORTANTE
        "numero": usuario.numero,
        "bairro": usuario.bairro,
        "cidade": usuario.cidade,
        "estado": usuario.estado,
        "emails": usuario.emails,  # ← IMPORTANTE (array)
        "telefones": usuario.telefones,  # ← IMPORTANTE (array)
        ...
    }
}
```

### Se backend não salva os campos:
```python
# No backend, adicionar no create/update:
usuario.cep = dados_usuario.get("cep")
usuario.logradouro = dados_usuario.get("logradouro")
usuario.numero = dados_usuario.get("numero")
usuario.bairro = dados_usuario.get("bairro")
usuario.cidade = dados_usuario.get("cidade")
usuario.estado = dados_usuario.get("estado")
usuario.emails = dados_usuario.get("emails", [])
usuario.telefones = dados_usuario.get("telefones", [])
```

---

## 📊 Status Atual:

| Funcionalidade | Status | Observações |
|---------------|--------|-------------|
| Estado `companyInfo` | ✅ | Criado com todos os campos |
| Props para CompanyInfoForm | ✅ | `data={companyInfo} onChange={setCompanyInfo}` |
| Carregamento na edição | ✅ | `setCompanyInfo()` em `loadUsuario()` |
| Envio para API | ✅ | Todos os campos em `dadosUsuario` |
| Logs de debug | ✅ | 3 console.log estratégicos |
| Consulta CEP | ✅ | ViaCEP com auto-fill |
| Máscaras | ✅ | CEP formatado |
| Arrays (emails/telefones) | ✅ | Enter adiciona, × remove |

**🎯 PRONTO PARA TESTAR!**

Abra o navegador, abra o console (F12), e teste criar/editar um usuário.
Os logs vão mostrar EXATAMENTE o que está acontecendo! 🚀
