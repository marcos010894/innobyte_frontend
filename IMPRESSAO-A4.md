# 📄 Guia de Impressão A4 - Múltiplas Etiquetas

## Como Funciona?

O sistema agora permite que você configure quantas etiquetas deseja imprimir por página A4. Ao exportar o PDF, todas as etiquetas serão automaticamente replicadas na folha!

## Passo a Passo

### 1. Configure a Etiqueta Individual
- Crie sua etiqueta com os elementos desejados (texto, QR code, barcode, etc.)
- Ajuste o tamanho da etiqueta individual (ex: 50×30mm)

### 2. Configure o Layout da Página
- Clique em **"Avançado"** no header
- Vá para a aba **"Layout e Margens"**
- Configure:
  - **Número de Colunas**: Quantas etiquetas por linha (ex: 3)
  - **Número de Linhas**: Quantas linhas por página (ex: 8)
  - **Espaçamento Horizontal**: Espaço entre colunas em mm (ex: 2mm)
  - **Espaçamento Vertical**: Espaço entre linhas em mm (ex: 2mm)

### 3. Use Configurações Pré-definidas
Clique nos botões rápidos para configurações comuns:
- **⚡ 3×8** = 24 etiquetas (3 colunas × 8 linhas) - Ideal para etiquetas 50×30mm
- **⚡ 2×5** = 10 etiquetas (2 colunas × 5 linhas) - Ideal para etiquetas maiores
- **⚡ 4×10** = 40 etiquetas (4 colunas × 10 linhas) - Ideal para etiquetas pequenas

### 4. Visualize no Header
No header do editor você verá um indicador verde mostrando:
```
Total de Etiquetas
24 por página
3 colunas × 8 linhas
```

### 5. Exporte o PDF
- Clique em **"Exportar"**
- Escolha **"PDF A4"**
- O tooltip mostrará: "Gera 24 etiquetas" (ou o número configurado)
- O PDF será gerado com uma folha A4 completa!

## Exemplos de Configuração

### Etiquetas de Preço (50×30mm)
```
Tamanho: 50mm × 30mm
Colunas: 3
Linhas: 8
Espaçamento H: 2mm
Espaçamento V: 2mm
Total: 24 etiquetas por folha
```

### Etiquetas de Produto (70×40mm)
```
Tamanho: 70mm × 40mm
Colunas: 2
Linhas: 5
Espaçamento H: 5mm
Espaçamento V: 5mm
Total: 10 etiquetas por folha
```

### Etiquetas Pequenas (30×20mm)
```
Tamanho: 30mm × 20mm
Colunas: 4
Linhas: 10
Espaçamento H: 3mm
Espaçamento V: 3mm
Total: 40 etiquetas por folha
```

### Etiquetas Grandes (100×50mm)
```
Tamanho: 100mm × 50mm
Colunas: 2
Linhas: 4
Espaçamento H: 5mm
Espaçamento V: 10mm
Total: 8 etiquetas por folha
```

## Dicas Importantes

### ✅ Boas Práticas
- Sempre ajuste os espaçamentos para facilitar o corte
- Use as **Bordas de Teste** (botão preto no header) para visualizar limites
- Configure as **Margens** para não imprimir próximo às bordas da folha
- Teste com 1 folha antes de imprimir muitas

### ⚠️ Atenção
- O tamanho da etiqueta + espaçamentos deve caber na página A4
- A4 tem aproximadamente: **210mm × 297mm**
- Deixe margens mínimas de **5-10mm** em todos os lados
- Considere o espaçamento entre etiquetas para facilitar o corte

### 🎯 Cálculo Rápido
Para verificar se cabe na página:
```
Largura total = (largura_etiqueta × colunas) + (espaçamento_H × (colunas-1)) + margens
Altura total = (altura_etiqueta × linhas) + (espaçamento_V × (linhas-1)) + margens

Exemplo para 50×30mm com 3×8:
Largura = (50 × 3) + (2 × 2) + 10 = 150 + 4 + 10 = 164mm ✅ (cabe em 210mm)
Altura = (30 × 8) + (2 × 7) + 10 = 240 + 14 + 10 = 264mm ✅ (cabe em 297mm)
```

## Comparação: PNG vs PDF

### 📷 Exportar PNG
- Exporta **apenas 1 etiqueta**
- Alta qualidade (2x de resolução)
- Ideal para:
  - Uso digital (e-commerce, redes sociais)
  - Enviar para gráfica
  - Visualização individual

### 📄 Exportar PDF A4
- Exporta **múltiplas etiquetas** em uma folha A4
- Layout configurável (colunas × linhas)
- Ideal para:
  - Impressão em impressora comum
  - Produção em lote
  - Folhas de etiquetas adesivas
  - Economia de papel

## Resolução de Problemas

### ❌ Etiquetas não cabem na página
- **Solução**: Reduza o número de colunas ou linhas
- Ou diminua o tamanho da etiqueta individual

### ❌ Etiquetas muito próximas
- **Solução**: Aumente o espaçamento horizontal e vertical

### ❌ Margens da impressora cortando conteúdo
- **Solução**: Aumente as margens nas configurações avançadas
- Impressoras comuns precisam de **5-10mm** de margem

### ❌ Preciso deixar espaços vazios (folha parcialmente usada)
- **Solução**: Use o campo **"Pular primeiras N etiquetas"** (em desenvolvimento)

## Recursos Visuais

### Indicadores Úteis
- **Grade** (cinza): Ajuda no alinhamento
- **Margens** (vermelho): Mostra áreas não imprimíveis
- **Linha Central** (azul): Para etiquetas dobráveis
- **Bordas** (preto): Limites de cada etiqueta

### Como Ativar/Desativar
Use os botões no header:
- 🔲 **Grade**: Toggle grade de alinhamento
- 📏 **Margens**: Toggle margens vermelhas
- ↔️ **Centro**: Toggle linha central
- ⬛ **Bordas**: Toggle bordas de corte

---

## 💡 Exemplo Prático

**Objetivo**: Imprimir etiquetas de preço 50×30mm

1. **Criar Etiqueta**
   - Adicione texto com o preço
   - Adicione código de barras
   - Configure tamanho: 50×30mm

2. **Configurar Layout**
   - Clique em "Avançado" → "Layout e Margens"
   - Clique no botão **"⚡ 3×8 (24 etiquetas)"**
   - Ou configure manualmente: 3 colunas, 8 linhas, 2mm de espaçamento

3. **Verificar**
   - Veja o contador no header: "24 por página"
   - Ative as bordas pretas para visualizar

4. **Exportar**
   - Clique em "Exportar" → "PDF A4"
   - Arquivo será salvo como: `NomeTemplate_3x8.pdf`

5. **Imprimir**
   - Abra o PDF
   - Configure impressora para 100% de escala
   - Imprima em folha A4 de etiquetas adesivas

**Resultado**: 24 etiquetas perfeitamente alinhadas em uma folha A4! 🎉

---

**Desenvolvido por**: InnobyteX  
**Versão**: 2.0 - Impressão A4 Múltipla  
**Data**: Novembro 2025
