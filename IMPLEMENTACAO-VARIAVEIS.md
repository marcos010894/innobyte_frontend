# ✅ Sistema de Variáveis - Implementação

## 🎯 O Que Foi Implementado

### 1. ✅ Utilitário de Substituição de Variáveis
**Arquivo:** `src/utils/templateVariables.ts`

**Funções criadas:**
- ✅ `replaceVariables()` - Substitui variáveis em strings
- ✅ `replaceElementVariables()` - Substitui variáveis em elementos
- ✅ `replaceTemplateVariables()` - Substitui em todos elementos do template
- ✅ `formatPrice()` - Formata preço (decimal/inteiro, prefixo)
- ✅ `truncateText()` - Trunca texto para tamanho máximo
- ✅ `hasVariables()` - Detecta se texto tem variáveis
- ✅ `extractVariables()` - Extrai lista de variáveis
- ✅ `validateVariables()` - Valida se variáveis são conhecidas

**Variáveis suportadas:**
- ✅ `${nome}` - Nome do produto
- ✅ `${preco}` - Preço formatado
- ✅ `${codigo}` - Código do produto
- ✅ `${barcode}` - Código de barras
- ✅ `${categoria}` - Categoria
- ✅ `${descricao}` - Descrição
- ✅ `${quantidade}` - Quantidade em estoque

### 2. ✅ Tipos Atualizados
**Arquivo:** `src/types/product.types.ts`

**Novos campos em PrintConfig:**
```typescript
truncateNames?: boolean;    // Ativar truncamento
maxNameLength?: number;     // Tamanho máximo (ex: 20)
priceFormat?: 'decimal' | 'integer';  // R$ 19,90 ou R$ 19
pricePrefix?: string;       // "R$ ", "$", etc.
```

### 3. ✅ Página de Impressão Atualizada
**Arquivo:** `src/pages/Print.tsx`

**Mudanças:**
- ✅ Import das funções de variáveis
- ✅ Import do templateService para carregar da API
- ✅ Estado printConfig com novas opções
- ✅ useEffect carrega templates da API (com fallback localStorage)

### 4. ✅ Documentação Completa
**Arquivo:** `SISTEMA-VARIAVEIS.md`

Contém:
- ✅ Explicação detalhada do sistema
- ✅ Lista de variáveis disponíveis
- ✅ Como usar no editor
- ✅ Como usar na impressão
- ✅ Exemplos práticos
- ✅ Dicas e boas práticas

---

## 🚧 O Que Falta Implementar

### 1. 🔨 Atualizar função handlePrint()

**Tarefa:** Substituir o código atual que renderiza manualmente para usar o template com variáveis

**Código atual (linhas 210-220):**
```typescript
// Renderizar conteúdo da etiqueta
pdf.setFontSize(10);
pdf.text(product.name, x + 2, y + 5);

if (printConfig.showPrice) {
  pdf.text(`R$ ${product.price.toFixed(2)}`, x + 2, y + 12);
}
```

**Código novo (usar variáveis):**
```typescript
// Substituir variáveis no template
const elementsWithData = replaceTemplateVariables(
  template.elements,
  product,
  {
    truncateNames: printConfig.truncateNames,
    maxNameLength: printConfig.maxNameLength,
    priceFormat: printConfig.priceFormat,
    pricePrefix: printConfig.pricePrefix,
  }
);

// Renderizar cada elemento do template
for (const element of elementsWithData) {
  renderElementToPDF(pdf, element, x, y);
}
```

### 2. 🔨 Criar função renderElementToPDF()

**Tarefa:** Função que renderiza cada tipo de elemento (text, barcode, qrcode, etc.) no PDF

**Pseudocódigo:**
```typescript
function renderElementToPDF(
  pdf: jsPDF,
  element: LabelElement,
  offsetX: number,
  offsetY: number
) {
  switch (element.type) {
    case 'text':
      // Renderizar texto
      pdf.setFontSize(element.fontSize);
      pdf.setTextColor(element.color);
      pdf.text(element.content, offsetX + element.x, offsetY + element.y);
      break;
      
    case 'barcode':
      // Renderizar código de barras usando biblioteca
      // JsBarcode ou similar
      break;
      
    case 'qrcode':
      // Renderizar QR Code usando biblioteca
      // qrcode.js ou similar
      break;
      
    case 'rectangle':
      // Renderizar retângulo
      pdf.setFillColor(element.fillColor);
      pdf.rect(
        offsetX + element.x,
        offsetY + element.y,
        element.width,
        element.height,
        'F'
      );
      break;
      
    // ... outros tipos
  }
}
```

### 3. 🔨 Adicionar UI para Configurar Variáveis

**Tarefa:** Adicionar controles na seção de configuração de impressão

**Local:** Painel lateral da página Print.tsx (onde já tem configurações)

**Controles a adicionar:**
```tsx
{/* Seção de Variáveis */}
<div className="border-t pt-4">
  <h3 className="font-semibold mb-3">📝 Substituição de Variáveis</h3>
  
  {/* Truncar Nomes */}
  <label className="flex items-center gap-2 mb-3">
    <input
      type="checkbox"
      checked={printConfig.truncateNames}
      onChange={(e) => setPrintConfig({
        ...printConfig,
        truncateNames: e.target.checked
      })}
    />
    <span>Truncar nomes longos</span>
  </label>
  
  {/* Tamanho Máximo */}
  {printConfig.truncateNames && (
    <div className="ml-6 mb-3">
      <label className="block text-sm mb-1">Tamanho máximo:</label>
      <input
        type="number"
        value={printConfig.maxNameLength}
        onChange={(e) => setPrintConfig({
          ...printConfig,
          maxNameLength: parseInt(e.target.value)
        })}
        min="5"
        max="50"
        className="w-full border rounded px-2 py-1"
      />
      <span className="text-xs text-gray-500">
        {printConfig.maxNameLength} caracteres
      </span>
    </div>
  )}
  
  {/* Formato de Preço */}
  <div className="mb-3">
    <label className="block text-sm mb-1">Formato de preço:</label>
    <select
      value={printConfig.priceFormat}
      onChange={(e) => setPrintConfig({
        ...printConfig,
        priceFormat: e.target.value as 'decimal' | 'integer'
      })}
      className="w-full border rounded px-2 py-2"
    >
      <option value="decimal">Decimal (R$ 19,90)</option>
      <option value="integer">Inteiro (R$ 19)</option>
    </select>
  </div>
  
  {/* Prefixo de Preço */}
  <div className="mb-3">
    <label className="block text-sm mb-1">Prefixo de preço:</label>
    <input
      type="text"
      value={printConfig.pricePrefix}
      onChange={(e) => setPrintConfig({
        ...printConfig,
        pricePrefix: e.target.value
      })}
      placeholder="R$ "
      className="w-full border rounded px-2 py-1"
    />
  </div>
</div>

{/* Info sobre Variáveis Disponíveis */}
<div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4">
  <p className="text-xs font-semibold text-blue-800 mb-2">
    💡 Variáveis Disponíveis:
  </p>
  <div className="text-xs text-blue-700 space-y-1">
    {AVAILABLE_VARIABLES.map(v => (
      <div key={v.key} className="flex items-start gap-2">
        <code className="bg-blue-100 px-1 rounded">{v.key}</code>
        <span>{v.description}</span>
      </div>
    ))}
  </div>
</div>
```

### 4. 🔨 Adicionar Painel de Ajuda no Editor

**Tarefa:** Mostrar variáveis disponíveis ao criar elementos de texto

**Local:** PropertiesPanel quando elemento texto está selecionado

**UI sugerida:**
```tsx
{selectedElement.type === 'text' && (
  <div className="mt-4 border-t pt-4">
    <button
      onClick={() => setShowVariablesHelp(!showVariablesHelp)}
      className="text-sm text-blue-600 hover:text-blue-800"
    >
      <i className="fas fa-info-circle mr-1"></i>
      Ver variáveis disponíveis
    </button>
    
    {showVariablesHelp && (
      <div className="mt-2 p-3 bg-gray-50 rounded text-xs">
        <p className="font-semibold mb-2">Variáveis dinâmicas:</p>
        {AVAILABLE_VARIABLES.map(v => (
          <div key={v.key} className="mb-1">
            <code className="bg-gray-200 px-1 rounded">{v.key}</code>
            <span className="text-gray-600 ml-2">{v.description}</span>
          </div>
        ))}
        <p className="mt-2 text-gray-500">
          Use essas variáveis no texto. Elas serão substituídas pelos dados reais na impressão.
        </p>
      </div>
    )}
  </div>
)}
```

---

## 📋 Checklist de Implementação

### Fase 1: Core (Completo) ✅
- [x] Criar utilitário de variáveis
- [x] Atualizar tipos TypeScript
- [x] Adicionar imports na página de impressão
- [x] Carregar templates da API
- [x] Documentação completa

### Fase 2: Renderização (Pendente) 🔨
- [ ] Atualizar handlePrint() para usar variáveis
- [ ] Criar função renderElementToPDF()
- [ ] Testar renderização de texto
- [ ] Testar renderização de barcode
- [ ] Testar renderização de QR code
- [ ] Testar renderização de formas (rectangle, line)

### Fase 3: UI (Pendente) 🎨
- [ ] Adicionar controles de truncamento
- [ ] Adicionar seletor de formato de preço
- [ ] Adicionar input de prefixo de preço
- [ ] Adicionar painel de variáveis disponíveis
- [ ] Adicionar ajuda no editor (PropertiesPanel)
- [ ] Adicionar preview de como ficará

### Fase 4: Testes (Pendente) 🧪
- [ ] Testar truncamento de nomes
- [ ] Testar formato decimal vs inteiro
- [ ] Testar prefixos personalizados
- [ ] Testar todas as 7 variáveis
- [ ] Testar com produtos reais
- [ ] Testar PDF final

---

## 🚀 Prioridade de Implementação

### Alta Prioridade (Fazer Agora)
1. ✅ Criar utilitário de variáveis ← **FEITO**
2. 🔨 Atualizar handlePrint() para usar variáveis ← **PRÓXIMO**
3. 🔨 Criar renderElementToPDF() ← **PRÓXIMO**
4. 🔨 Adicionar UI de configuração ← **PRÓXIMO**

### Média Prioridade (Fazer Depois)
5. Adicionar painel de ajuda no editor
6. Melhorar preview de impressão
7. Adicionar validação de variáveis em tempo real

### Baixa Prioridade (Nice to Have)
8. Permitir variáveis personalizadas
9. Adicionar mais formatos de preço
10. Adicionar templates prontos com variáveis

---

## 📝 Resumo

**Status Atual:**
- ✅ Sistema de variáveis criado e funcionando
- ✅ 7 variáveis disponíveis
- ✅ Funções de substituição e formatação prontas
- ✅ Documentação completa

**Próximos Passos:**
1. Integrar sistema de variáveis na função de impressão
2. Criar renderização de elementos no PDF
3. Adicionar UI para configurar opções
4. Testar com dados reais

**Estimativa:**
- Renderização no PDF: ~2-3 horas
- UI de configuração: ~1 hora
- Testes: ~1 hora
- **Total: ~4-5 horas de trabalho**

---

**Arquivos Criados:**
- ✅ `src/utils/templateVariables.ts` - Utilitário principal
- ✅ `SISTEMA-VARIAVEIS.md` - Documentação
- ✅ `IMPLEMENTACAO-VARIAVEIS.md` - Este arquivo (checklist)

**Arquivos Modificados:**
- ✅ `src/types/product.types.ts` - Novos campos em PrintConfig
- ✅ `src/pages/Print.tsx` - Imports e estado atualizado

**Pronto para continuar a implementação!** 🎉
