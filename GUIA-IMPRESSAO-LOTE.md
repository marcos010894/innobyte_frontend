# 🖨️ Guia de Impressão em Lote

## Visão Geral

O sistema de **Impressão em Lote** permite que você:
- ✅ Selecione múltiplos produtos de uma lista
- ✅ Configure quantas etiquetas por folha A4
- ✅ Escolha um template de etiqueta
- ✅ Personalize espaçamentos e margens
- ✅ Gere PDF com todas as etiquetas de uma vez

---

## 📋 Como Usar

### 1. Acesse a Impressão em Lote

Há duas formas de acessar:

**Opção A: Pelo Dashboard**
- No dashboard, na seção "Ações Rápidas"
- Clique no card **"Impressão em Lote"** (roxo com ícone de impressora)

**Opção B: Pelo Menu**
- Navegue para `/batch-print` na URL
- Ou adicione no menu lateral (futuro)

### 2. Selecione os Produtos

#### Buscar Produtos
- Use a barra de pesquisa para filtrar por:
  - Nome do produto
  - Código do produto

#### Marcar Produtos
- Clique em qualquer produto para marcar/desmarcar
- Ou use o botão **"Marcar Todos"** para selecionar todos visíveis
- Produtos selecionados ficam com fundo azul claro

#### Visualização dos Produtos
Cada produto mostra:
- ✓ Nome
- ✓ Código
- ✓ Preço
- ✓ Estoque disponível
- ✓ Código de barras (se houver)
- ✓ Categoria

### 3. Configure a Impressão

No painel lateral direito você tem:

#### 📊 Estatísticas
```
Produtos: 5 (selecionados)
Por página: 24 (etiquetas por folha)
Total de páginas: 1 (quantas folhas serão geradas)
```

#### 🏷️ Template de Etiqueta
- Selecione qual template usar para as etiquetas
- Os templates são os que você criou no Editor

#### ⚡ Configurações Rápidas (Presets)

Clique em um dos botões para aplicar configuração automática:

| Preset | Descrição | Ideal para |
|--------|-----------|------------|
| 📋 3×8 (24 etiquetas) | 3 colunas × 8 linhas | Etiquetas pequenas 50×30mm |
| 📄 2×5 (10 etiquetas) | 2 colunas × 5 linhas | Etiquetas médias 70×40mm |
| 📑 4×10 (40 etiquetas) | 4 colunas × 10 linhas | Etiquetas muito pequenas 30×20mm |
| 📃 2×4 (8 etiquetas) | 2 colunas × 4 linhas | Etiquetas grandes 90×50mm |

#### ⚙️ Configurações Avançadas

Clique em **"Mostrar Configurações"** para ajustar:

**Layout:**
- **Colunas**: Quantas etiquetas por linha (1-10)
- **Linhas**: Quantas linhas por página (1-20)

**Espaçamentos:**
- **Horizontal**: Espaço entre colunas em mm
- **Vertical**: Espaço entre linhas em mm

**Opções Visuais:**
- ☐ Mostrar bordas (para teste de impressão)
- ☑ Mostrar preço (incluir preço na etiqueta)
- ☑ Mostrar código de barras (incluir barcode)

### 4. Imprimir

- Clique no botão **"Imprimir (X)"** no header
  - O número mostra quantos produtos estão selecionados
- O sistema validará:
  - ✓ Se há produtos selecionados
  - ✓ Se um template foi escolhido
- O PDF será gerado automaticamente

---

## 💡 Exemplos Práticos

### Exemplo 1: Etiquetas de Preço Pequenas

**Objetivo**: Imprimir etiquetas de preço para 12 produtos

1. **Selecione** os 12 produtos na lista
2. **Template**: Escolha "Etiqueta Preço Básica"
3. **Preset**: Clique em "📋 3×8 (24 etiquetas)"
4. **Resultado**:
   - Produtos: 12
   - Por página: 24
   - Total de páginas: 1
5. **Imprimir** → 1 folha A4 com 12 etiquetas

### Exemplo 2: Etiquetas Grandes para Produtos Premium

**Objetivo**: Imprimir etiquetas grandes para 6 produtos especiais

1. **Selecione** os 6 produtos
2. **Template**: "Etiqueta Premium com Logo"
3. **Preset**: "📃 2×4 (8 etiquetas)"
4. **Resultado**:
   - Produtos: 6
   - Por página: 8
   - Total de páginas: 1
5. **Imprimir** → 1 folha A4 com 6 etiquetas grandes

### Exemplo 3: Lote Grande com Múltiplas Páginas

**Objetivo**: Imprimir etiquetas para 50 produtos diferentes

1. **Busque** e selecione os 50 produtos
2. **Template**: "Etiqueta Padrão"
3. **Preset**: "📋 3×8 (24 etiquetas)"
4. **Resultado**:
   - Produtos: 50
   - Por página: 24
   - Total de páginas: 3 (24 + 24 + 2)
5. **Imprimir** → 3 folhas A4:
   - Folha 1: 24 etiquetas
   - Folha 2: 24 etiquetas
   - Folha 3: 2 etiquetas

---

## 🎯 Dicas e Boas Práticas

### ✅ Antes de Imprimir

1. **Teste com 1 produto primeiro**
   - Selecione apenas 1 produto
   - Imprima para verificar qualidade
   - Ajuste configurações se necessário

2. **Verifique o template**
   - Certifique-se de que o template tem todos os dados necessários
   - Teste variáveis dinâmicas ({{nome}}, {{preco}}, etc)

3. **Configure o preset correto**
   - Use o preset adequado ao tamanho de suas etiquetas
   - Folhas A4 adesivas vêm em tamanhos padrões

4. **Ative "Mostrar bordas"**
   - Na primeira impressão, ative as bordas
   - Isso ajuda a verificar alinhamento

### ⚠️ Resolução de Problemas

**Problema: Etiquetas cortadas na impressão**
- **Solução**: Aumente as margens nas configurações avançadas
- Impressoras precisam de 5-10mm de margem mínima

**Problema: Etiquetas desalinhadas**
- **Solução**: Ajuste os espaçamentos horizontal e vertical
- Ou use um preset diferente

**Problema: Muitas páginas sendo geradas**
- **Solução**: Use um preset com mais etiquetas por página
- Exemplo: Troque de 2×5 (10) para 3×8 (24)

**Problema: "Selecione pelo menos um produto"**
- **Solução**: Marque os checkboxes dos produtos na lista

**Problema: "Selecione um template"**
- **Solução**: Escolha um template no dropdown
- Se não há templates, crie um no Editor primeiro

---

## 🔮 Recursos Futuros (Em Desenvolvimento)

- [ ] Salvar configurações de impressão favoritas
- [ ] Pré-visualizar PDF antes de gerar
- [ ] Imprimir quantidade diferente de cada produto
- [ ] Filtrar produtos por categoria
- [ ] Importar lista de produtos via Excel
- [ ] Pular primeiras N etiquetas (folha parcialmente usada)
- [ ] Histórico de impressões

---

## 📊 Casos de Uso Comuns

### Varejo
- Etiquetas de preço para produtos em promoção
- Remarcação sazonal (Black Friday, Natal)
- Novos produtos chegando ao estoque

### Atacado
- Etiquetas de lote/validade
- Códigos de rastreamento
- Etiquetas de expedição

### Indústria
- Etiquetas de produto acabado
- Identificação de componentes
- Etiquetas de conformidade

### E-commerce
- Etiquetas de envio personalizadas
- Etiquetas de código de barras para estoque
- Etiquetas promocionais para embalagens

---

## 🎓 Tutoriais em Vídeo (Futuros)

1. **Básico**: Como fazer sua primeira impressão em lote (3min)
2. **Intermediário**: Configurando presets personalizados (5min)
3. **Avançado**: Otimizando impressão para grande volume (8min)

---

**Desenvolvido por**: InnobyteX  
**Versão**: 1.0 - Impressão em Lote  
**Data**: Novembro 2025  
**Suporte**: suporte@innobytex.com
