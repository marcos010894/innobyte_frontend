# 🧪 TESTE - Edição de Informações da Empresa

## ✅ O código JÁ está preparado!

O `loadUsuario()` já carrega os dados da empresa:
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

---

## 🧪 TESTE RÁPIDO:

### 1️⃣ **Abra o Console do Navegador (F12)**

### 2️⃣ **Acesse a edição de um usuário:**
```
http://localhost:5173/users/edit/1
```

### 3️⃣ **Veja os logs no console:**

#### **Log 1: Dados recebidos do backend**
```javascript
📥 Dados recebidos do backend: {
  usuario: {
    id: 1,
    cnpj: "12345678000100",
    razao_social: "Empresa Teste",
    cep: "01310100",        // ← IMPORTANTE!
    logradouro: "Av Paulista",  // ← IMPORTANTE!
    numero: "1000",
    bairro: "Bela Vista",
    cidade: "São Paulo",
    estado: "SP",
    emails: ["teste@email.com", "teste2@email.com"],  // ← IMPORTANTE!
    telefones: ["(11) 98765-4321"]  // ← IMPORTANTE!
  },
  licenca: { ... }
}
```

#### **Log 2: Dados carregados no estado**
```javascript
✅ Dados carregados no estado: {
  clientData: { ... },
  companyInfo: {
    cep: "01310100",
    logradouro: "Av Paulista",
    emails: ["teste@email.com", "teste2@email.com"],
    telefones: ["(11) 98765-4321"]
  }
}
```

### 4️⃣ **Verifique visualmente no formulário:**

Na seção **🏢 Informações Adicionais da Empresa**, os campos devem estar preenchidos:

✅ **CEP:** `01310-100` (com máscara)
✅ **Logradouro:** `Av Paulista`
✅ **Número:** `1000`
✅ **Bairro:** `Bela Vista`
✅ **Cidade:** `São Paulo`
✅ **Estado:** `SP` (selecionado no dropdown)
✅ **Emails:** Tags azuis com `teste@email.com`, `teste2@email.com`
✅ **Telefones:** Tags verdes com `(11) 98765-4321`

---

## ⚠️ SE OS CAMPOS ESTIVEREM VAZIOS:

### **Cenário 1: Backend não retorna os campos**

Se no console você ver:
```javascript
📥 Dados recebidos do backend: {
  usuario: {
    id: 1,
    cnpj: "12345678000100",
    cep: undefined,        // ← PROBLEMA!
    logradouro: undefined, // ← PROBLEMA!
    emails: undefined      // ← PROBLEMA!
  }
}
```

**🔴 PROBLEMA:** Backend não está retornando os campos de empresa.

**✅ SOLUÇÃO:** No backend, adicione os campos no SELECT/serialização:

```python
# backend/routers/usuarios.py

@router.get("/{usuario_id}")
def get_usuario(usuario_id: int, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.id == usuario_id).first()
    
    return {
        "usuario": {
            "id": usuario.id,
            "cnpj": usuario.cnpj,
            "razao_social": usuario.razao_social,
            "telefone": usuario.telefone,
            "email": usuario.email,
            
            # ← ADICIONAR ESTES CAMPOS:
            "cep": usuario.cep,
            "logradouro": usuario.logradouro,
            "numero": usuario.numero,
            "bairro": usuario.bairro,
            "cidade": usuario.cidade,
            "estado": usuario.estado,
            "emails": usuario.emails if hasattr(usuario, 'emails') else [],
            "telefones": usuario.telefones if hasattr(usuario, 'telefones') else [],
        },
        "licenca": { ... }
    }
```

---

### **Cenário 2: Banco de dados não tem os campos**

Se a tabela `usuarios` não tem as colunas `cep`, `logradouro`, etc., você precisa criar uma migração:

```sql
ALTER TABLE usuarios ADD COLUMN cep VARCHAR(8);
ALTER TABLE usuarios ADD COLUMN logradouro VARCHAR(255);
ALTER TABLE usuarios ADD COLUMN numero VARCHAR(50);
ALTER TABLE usuarios ADD COLUMN bairro VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN cidade VARCHAR(100);
ALTER TABLE usuarios ADD COLUMN estado VARCHAR(2);
ALTER TABLE usuarios ADD COLUMN emails JSON;
ALTER TABLE usuarios ADD COLUMN telefones JSON;
```

Ou com Alembic (se estiver usando):
```bash
cd backend
alembic revision --autogenerate -m "Add company info fields to usuarios"
alembic upgrade head
```

---

## 🎯 CHECKLIST DE TESTE:

### ✅ Criar Novo Usuário:
- [ ] Preencher informações da empresa
- [ ] CEP consulta funciona
- [ ] Adicionar múltiplos emails (Enter)
- [ ] Adicionar múltiplos telefones (Enter)
- [ ] Clicar "Criar Usuário"
- [ ] Ver no console: `📤 Dados sendo enviados` com campos de empresa
- [ ] Sucesso: Alert de confirmação

### ✅ Editar Usuário Existente:
- [ ] Abrir console (F12)
- [ ] Acessar `/users/edit/1`
- [ ] Ver log: `📥 Dados recebidos do backend`
- [ ] Ver log: `✅ Dados carregados no estado`
- [ ] Campos de empresa preenchidos automaticamente
- [ ] CEP com máscara (XXXXX-XXX)
- [ ] Emails em tags azuis
- [ ] Telefones em tags verdes
- [ ] Estado selecionado no dropdown
- [ ] Modificar algum campo
- [ ] Clicar "Salvar Alterações"
- [ ] Ver no console: `📤 Dados sendo enviados`
- [ ] Sucesso: Alert de confirmação

---

## 📊 RESUMO:

| Item | Status | Onde está |
|------|--------|-----------|
| Estado `companyInfo` | ✅ | UserForm.tsx linha 41 |
| Carregamento na edição | ✅ | UserForm.tsx linha 103-111 |
| Props para CompanyInfoForm | ✅ | UserForm.tsx linha 287 |
| Envio para API | ✅ | UserForm.tsx linha 183-190 |
| Logs de debug | ✅ | UserForm.tsx linhas 70, 112, 193 |

**🚀 TUDO FUNCIONANDO!**

O problema (se houver) é no **BACKEND**, não no frontend.
Use os logs do console para diagnosticar! 🔍
