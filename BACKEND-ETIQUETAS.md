# 📋 Backend - Sistema de Etiquetas

## 🗄️ O QUE PRECISA SER FEITO

### 1. Criar Tabela: `label_templates`

**Campos:**
- `id` - id
- `id_cliente` - id
- `id_usuario_criador` - id
- `nome` - String (obrigatório)
- `descricao` - Texto (opcional)
- `categoria` - String (ex: "preco", "produto")
- `config` - JSON (configurações da etiqueta)
- `elements` - JSON Array (elementos como texto, QR code, etc)
- `thumbnail` - Texto (preview da etiqueta em base64)
- `compartilhado` - Boolean (padrão false, só MASTER altera)
- `created_at` - Timestamp
- `updated_at` - Timestamp

---

### 2. Criar 6 Endpoints

#### 2.1 **GET /api/templates**
- Listar templates da empresa do usuário + templates compartilhados
- Aceitar filtros: `categoria`, `search`
- Retornar array de templates

#### 2.2 **GET /api/templates/:id**
- Buscar um template específico
- Verificar se usuário tem acesso (mesma empresa OU compartilhado)

#### 2.3 **POST /api/templates**
- Criar novo template
- Receber: `nome`, `descricao`, `categoria`, `config`, `elements`, `thumbnail`
- Auto-preencher: `id_empresa` (do usuário logado), `id_usuario_criador` (do usuário logado)
- Sempre criar com `compartilhado = false`

#### 2.4 **PUT /api/templates/:id**
- Atualizar template existente
- Receber: `nome`, `descricao`, `categoria`, `config`, `elements`, `thumbnail`
- Verificar se usuário é dono OU da mesma empresa

#### 2.5 **DELETE /api/templates/:id**
- Deletar template
- Verificar se usuário é dono OU é MASTER

#### 2.6 **PATCH /api/templates/:id/compartilhar**
- Marcar/desmarcar template como compartilhado
- Receber: `compartilhado` (boolean)
- **IMPORTANTE:** Só MASTER pode usar este endpoint

---

### 3. Regras de Acesso por Tipo de Usuário

#### 🔴 MASTER (Administrador do Sistema)
**Pode tudo:**
- ✅ Ver TODOS os templates (de todas as empresas)
- ✅ Criar templates
- ✅ Editar QUALQUER template
- ✅ Deletar QUALQUER template
- ✅ **Marcar/desmarcar como compartilhado** (exclusivo do MASTER)

#### 🔵 CLIENTE 
**Templates da própria empresa:**
- ✅ Ver: Templates da sua empresa + Templates compartilhados pelo MASTER
- ✅ Criar: Novos templates na sua empresa
- ✅ Editar: Todos os templates da sua empresa
- ✅ Deletar: Todos os templates da sua empresa
- ❌ **NÃO pode marcar como compartilhado**

#### 🟢 COLABORADOR (Funcionário da Empresa)
**Acesso limitado:**
- ✅ Ver: Templates da empresa dele + Templates compartilhados pelo MASTER
- ✅ Criar: Novos templates na empresa
- ✅ Editar: **APENAS templates que ELE criou** (`id_usuario_criador` = id dele)
- ✅ Deletar: **APENAS templates que ELE criou**
- ❌ **NÃO pode editar/deletar templates de outros colaboradores**
- ❌ **NÃO pode marcar como compartilhado**

---

### 4. Lógica de Filtro por Endpoint

#### **GET /api/templates (Listar)**

**Se MASTER:**
```
Retornar: TODOS os templates (sem filtro)
```

**Se CLIENTE ou COLABORADOR:**
```
Retornar: Templates onde (id_empresa = empresa_do_usuario OR compartilhado = true)
```

#### **PUT /api/templates/:id (Editar)**

**Se MASTER:**
```
Permitir: Sempre
```

**Se CLIENTE:**
```
Permitir: Se (id_empresa do template = id_empresa do usuário)
```

**Se COLABORADOR:**
```
Permitir: Se (id_usuario_criador = id do usuário logado)
```

#### **DELETE /api/templates/:id (Deletar)**

**Se MASTER:**
```
Permitir: Sempre
```

**Se CLIENTE:**
```
Permitir: Se (id_empresa do template = id_empresa do usuário)
```

**Se COLABORADOR:**
```
Permitir: Se (id_usuario_criador = id do usuário logado)
```

#### **PATCH /api/templates/:id/compartilhar (Compartilhar)**

**Apenas MASTER pode usar este endpoint!**
```
Verificar: tipo_usuario = 'MASTER'
Se não for MASTER: retornar erro 403 (Forbidden)
```

---

## � Exemplos de JSON que o Frontend Vai Enviar

### Criar Template (POST):
```json
{
  "nome": "Etiqueta de Preço",
  "descricao": "Template padrão",
  "categoria": "preco",
  "config": {
    "width": 50,
    "height": 30,
    "unit": "mm",
    "backgroundColor": "#FFFFFF",
    "columns": 3,
    "rows": 8
  },
  "elements": [
    {
      "id": "elem-1",
      "type": "text",
      "x": 10,
      "y": 10,
      "width": 100,
      "height": 30,
      "content": "R$ 10,00",
      "fontSize": 16,
      "fontFamily": "Arial",
      "color": "#000000"
    }
  ],
  "thumbnail": "data:image/png;base64,..."
}
```

### Atualizar Template (PUT):
```json
{
  "nome": "Novo Nome",
  "config": { ... },
  "elements": [ ... ]
}
```

### Marcar como Compartilhado (PATCH - SÓ MASTER):
```json
{
  "compartilhado": true
}
```

---

## 🎯 RESUMO FINAL

**O QUE FAZER:**

1. ✅ Criar tabela `label_templates` com 12 campos
2. ✅ Criar 6 endpoints (listar, buscar, criar, atualizar, deletar, compartilhar)
3. ✅ Implementar filtro: mostrar templates da empresa + compartilhados
4. ✅ Implementar permissão especial: só MASTER marca como compartilhado
5. ✅ Campos `config` e `elements` são JSON (o frontend envia o objeto completo)

**IMPORTANTE:**
- `compartilhado = false` por padrão
- Só MASTER pode alterar `compartilhado` para `true`
- Templates compartilhados aparecem para TODAS as empresas (MASTER, CLIENTE e COLABORADOR)
- COLABORADOR só edita/deleta templates que ELE criou
- CLIENTE edita/deleta todos templates da empresa dele
- MASTER faz tudo

---

## 📊 Exemplos de Cenários

### Cenário 1: COLABORADOR cria template
```json
{
  "id": "123",
  "id_empresa": "empresa-abc",
  "id_usuario_criador": "colaborador-joao",  // ID do colaborador
  "nome": "Etiqueta João",
  "compartilhado": false
}
```
**Quem pode ver:** Todos da empresa-abc + MASTER
**Quem pode editar:** Apenas colaborador-joao + CLIENTE da empresa-abc + MASTER
**Quem pode deletar:** Apenas colaborador-joao + CLIENTE da empresa-abc + MASTER

### Cenário 2: MASTER marca template como compartilhado
```json
{
  "id": "456",
  "id_empresa": "empresa-xyz",
  "id_usuario_criador": "cliente-maria",
  "nome": "Etiqueta Padrão",
  "compartilhado": true  // MASTER marcou como compartilhado
}
```
**Quem pode ver:** TODOS (todas empresas + colaboradores + MASTER)
**Quem pode editar:** cliente-maria + MASTER
**Quem pode deletar:** cliente-maria + MASTER

### Cenário 3: CLIENTE cria template
```json
{
  "id": "789",
  "id_empresa": "empresa-def",
  "id_usuario_criador": "cliente-pedro",  // ID do cliente
  "nome": "Etiqueta Pedro",
  "compartilhado": false
}
```
**Quem pode ver:** Todos da empresa-def + MASTER
**Quem pode editar:** cliente-pedro + colaboradores da empresa-def (NÃO! só o criador) + MASTER
**Quem pode deletar:** cliente-pedro + MASTER

**CORREÇÃO:** Colaboradores NÃO podem editar templates de outros, só os que eles criaram!

---

**Pronto! 🚀**
