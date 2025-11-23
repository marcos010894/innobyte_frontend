# 🏷️ Sistema de Variáveis para Templates de Etiquetas

## 📋 Visão Geral

O sistema de variáveis permite criar templates **dinâmicos** que são preenchidos automaticamente com dados reais dos produtos na hora da impressão.

## 🎯 Diferença entre Editor e Impressão

### Editor (`/editor`)
- **Propósito:** Criar o **design** da etiqueta
- **Conteúdo:** Usa **variáveis** (placeholders)
- **Exemplo:** Texto com `${nome}`, `${preco}`, `${barcode}`
- **Resultado:** Template reutilizável

### Impressão (`/print`)
- **Propósito:** Gerar etiquetas **reais** em massa
- **Conteúdo:** Substitui variáveis por **dados dos produtos**
- **Exemplo:** `${nome}` vira "Notebook Dell XPS"
- **Resultado:** PDF com etiquetas prontas para imprimir

---

## 🔤 Variáveis Disponíveis

| Variável | Descrição | Exemplo |
|----------|-----------|---------|
| `${nome}` | Nome do produto | "Notebook Dell XPS" |
| `${preco}` | Preço do produto | "R$ 4.999,00" |
| `${codigo}` | Código do produto | "PROD001" |
| `${barcode}` | Código de barras | "7891234567890" |
| `${categoria}` | Categoria do produto | "Eletrônicos" |
| `${descricao}` | Descrição do produto | "Notebook de alta performance" |
| `${quantidade}` | Quantidade em estoque | "100" |

---

## 🎨 Como Usar no Editor

### 1. Criar Elemento de Texto
1. Adicione um elemento de **Texto** no editor
2. No conteúdo, digite a variável: `${nome}`
3. Salve o template

### 2. Criar QR Code Dinâmico
1. Adicione um elemento de **QR Code**
2. No valor, use: `${codigo}` ou `${barcode}`
3. O QR Code será gerado com o código real de cada produto

### 3. Criar Código de Barras Dinâmico
1. Adicione um elemento de **Barcode**
2. No valor, use: `${barcode}`
3. O código de barras mostrará o código real de cada produto

### Exemplo Completo:
```
┌─────────────────────────────┐
│  ${nome}                    │  ← Nome do produto
│                             │
│  R$ ${preco}                │  ← Preço formatado
│                             │
│  [QR CODE: ${codigo}]       │  ← QR com código
│                             │
│  ${barcode}                 │  ← Código de barras
└─────────────────────────────┘
```

---

## 🖨️ Como Funciona na Impressão

### Fluxo de Impressão:

1. **Selecionar Template**
   - Escolha um template que você criou no editor
   - Templates podem conter variáveis

2. **Selecionar Produtos**
   - Marque os produtos que deseja imprimir etiquetas
   - Pode selecionar 1, 10, 100+ produtos

3. **Configurar Opções**
   - **Truncar Nomes:** Limita tamanho do nome (ex: 20 caracteres)
   - **Formato de Preço:** Decimal (19,90) ou Inteiro (19)
   - **Prefixo de Preço:** "R$ ", "$", etc.
   - **Layout:** Colunas × Linhas por página A4

4. **Gerar PDF**
   - Sistema substitui variáveis pelos dados reais
   - Cada produto gera uma etiqueta
   - Etiquetas são organizadas em folhas A4

### Exemplo de Substituição:

**Template no Editor:**
```
Produto: ${nome}
Preço: ${preco}
Código: ${codigo}
```

**Produto 1 na Impressão:**
```
Produto: Notebook Dell XPS
Preço: R$ 4.999,00
Código: PROD001
```

**Produto 2 na Impressão:**
```
Produto: Mouse Logitech
Preço: R$ 89,90
Código: PROD002
```

---

## ⚙️ Opções de Configuração

### 1. Truncar Nomes
**O que faz:** Limita o tamanho do nome do produto

**Exemplo:**
- Nome original: `"Notebook Dell XPS 15 Polegadas 16GB RAM 512GB SSD"`
- Truncado (20 chars): `"Notebook Dell XPS 15..."`

**Quando usar:**
- Etiquetas pequenas
- Design com espaço limitado
- Nomes muito longos

### 2. Formato de Preço

**Decimal (padrão):**
- Mostra centavos: `R$ 19,90`
- Use para: Produtos com preços variados

**Inteiro:**
- Sem centavos: `R$ 19`
- Use para: Preços redondos, melhor legibilidade

### 3. Prefixo de Preço
- `R$ ` - Real brasileiro (padrão)
- `$ ` - Dólar
- `€ ` - Euro
- Personalizado - Qualquer texto

### 4. Layout A4
Configure quantas etiquetas cabem por folha:
- **3×8 = 24 etiquetas** (etiquetas pequenas 50×30mm)
- **2×5 = 10 etiquetas** (etiquetas médias 100×50mm)
- **Custom** - Configure manualmente

---

## 📊 Exemplo Prático Completo

### Passo 1: Criar Template no Editor

1. Acesse `/editor`
2. Adicione elementos:
   ```
   [Texto] Conteúdo: ${nome}
   [Texto] Conteúdo: R$ ${preco}
   [Barcode] Valor: ${barcode}
   ```
3. Salve como "Template Preço com Barcode"

### Passo 2: Imprimir com Dados Reais

1. Acesse `/print`
2. Selecione template "Template Preço com Barcode"
3. Marque produtos:
   - ✅ Notebook Dell XPS
   - ✅ Mouse Logitech
   - ✅ Teclado Mecânico
4. Configure:
   - 🔧 Truncar nomes: Sim (20 caracteres)
   - 🔧 Formato preço: Decimal
   - 🔧 Layout: 3×8 (24 etiquetas/página)
5. Clique em "Gerar PDF"

### Resultado:
```
PDF gerado com 3 etiquetas:

┌─────────────────────┐ ┌─────────────────────┐ ┌─────────────────────┐
│ Notebook Dell XPS...│ │ Mouse Logitech      │ │ Teclado Mecânico    │
│ R$ 4.999,00         │ │ R$ 89,90            │ │ R$ 299,00           │
│ ▐▐▐││▐▐││▐▐▐▐        │ │ ▐▐▐││▐▐││▐▐▐▐        │ │ ▐▐▐││▐▐││▐▐▐▐        │
│ 789123456789        │ │ 789123456790        │ │ 789123456791        │
└─────────────────────┘ └─────────────────────┘ └─────────────────────┘
```

---

## 🔍 Validação de Variáveis

O sistema valida automaticamente se as variáveis usadas são válidas.

### Variáveis Válidas ✅
```
${nome}
${preco}
${codigo}
${barcode}
${categoria}
${descricao}
${quantidade}
```

### Variáveis Inválidas ❌
```
${price}     // Use ${preco}
${product}   // Use ${nome}
${sku}       // Use ${codigo}
${value}     // Use ${preco}
```

---

## 💡 Dicas e Boas Práticas

### ✅ Faça:
1. **Use nomes descritivos no editor**
   - Bom: "Template Preço Grande" 
   - Ruim: "Template 1"

2. **Teste com dados reais**
   - Imprima 1 etiqueta de teste antes de imprimir 1000

3. **Configure margens apropriadas**
   - Deixe espaço nas bordas da folha A4

4. **Use truncamento para nomes longos**
   - Evita textos cortados ou sobrepostos

### ❌ Evite:
1. **Não use variáveis inválidas**
   - Sistema não substituirá, ficará literal `${invalid}`

2. **Não misture dados fixos e variáveis**
   - Ruim: "Nome: Produto X"  (sempre "Produto X")
   - Bom: "Nome: ${nome}"     (nome real do produto)

3. **Não esqueça de configurar o formato**
   - Preços em centavos para maior precisão

---

## 🚀 Próximos Passos

Agora você está pronto para:

1. ✅ Criar templates com variáveis
2. ✅ Imprimir etiquetas em massa
3. ✅ Personalizar formato e layout
4. ✅ Gerar PDFs prontos para impressão

**Comece criando seu primeiro template no `/editor`!** 🎨
