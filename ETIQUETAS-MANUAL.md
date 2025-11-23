# 🏷️ Sistema de Criação de Etiquetas - Innobyte

## ✨ Funcionalidades Implementadas

### 🎨 Editor Visual Completo

O sistema possui um editor drag-and-drop profissional com as seguintes funcionalidades:

#### Elementos Disponíveis:

1. **Texto** 📝
   - Fonte personalizável (16 fontes disponíveis)
   - Tamanhos de 8px a 72px
   - Negrito, itálico, sublinhado
   - Alinhamento (esquerda, centro, direita)
   - Cores personalizadas
   - Duplo clique para editar conteúdo
   - Suporta variáveis dinâmicas: `{{nome}}`, `{{preco}}`, `{{codigo}}`, `{{quantidade}}`

2. **QR Code** 📱
   - Personalizável com qualquer URL ou texto
   - Cores de fundo e QR Code ajustáveis
   - 4 níveis de correção de erro (L, M, Q, H)
   - Proporção mantida automaticamente
   - Duplo clique para editar valor

3. **Código de Barras** 📊
   - Múltiplos formatos: CODE128, EAN13, EAN8, UPC, CODE39, ITF14
   - Exibição opcional do valor
   - Cores personalizadas (linha e fundo)
   - Tamanho ajustável
   - Duplo clique para editar código

4. **Imagem** 🖼️
   - Upload de arquivo local
   - Inserir por URL
   - Ajuste de opacidade
   - Modos de preenchimento: conter, cobrir, preencher
   - Duplo clique para alterar

5. **Retângulo** ▭
   - Cor de preenchimento personalizável
   - Borda com cor e espessura ajustáveis
   - Bordas arredondadas
   - Ideal para molduras e destaques

### 🎯 Recursos do Editor:

- **Drag and Drop**: Arraste elementos livremente pelo canvas
- **Redimensionamento**: Ajuste o tamanho de qualquer elemento
- **Zoom**: 50% a 200% (com controles + e -)
- **Grid**: Grade visual opcional para alinhamento preciso
- **Propriedades em Tempo Real**: Painel lateral com todas as opções do elemento selecionado
- **Posicionamento Preciso**: Controle X, Y, Largura e Altura por números
- **Bloqueio de Elementos**: Impede movimentação/edição acidental
- **Deletar Rápido**: Botão × em cada elemento selecionado

### 📏 Tamanhos de Etiqueta:

- **40×30mm** - Etiqueta Preço Pequena
- **50×30mm** - Etiqueta Preço Média
- **60×40mm** - Etiqueta Grande
- **70×50mm** - Etiqueta Extra Grande
- **100×50mm** - Etiqueta Prateleira (Rabicho)
- **100×150mm** - Formato A6
- **210×297mm** - Folha A4 completa
- **Personalizado** - Defina suas próprias dimensões

### 💾 Gerenciamento de Templates:

- **Salvar Localmente**: Templates salvos no localStorage
- **Carregar Templates**: Abra e edite templates existentes
- **Duplicar**: Crie cópias de templates
- **Excluir**: Remova templates não utilizados
- **Busca**: Encontre templates por nome
- **Estatísticas**: Total de templates, elementos, última atualização

### 📤 Exportação:

- **PNG**: Exportação em alta qualidade (2x scale)
- **PDF**: Geração de PDF com dimensões exatas da etiqueta
- **Formato preservado**: Mantém cores, fontes e posicionamento

### ⚙️ Configurações:

- **Tamanho do Canvas**: Ajustável em mm, cm, in ou px
- **Cor de Fundo**: Escolha qualquer cor
- **Grade**: Ativar/desativar visualização
- **Nome do Template**: Personalizável

## 🚀 Como Usar

### 1. Criar Nova Etiqueta

```
1. Clique em "Editor de Modelos" no menu lateral
2. Escolha o tamanho ou use "Configurações" para personalizar
3. Adicione elementos clicando na barra lateral esquerda
4. Arraste e redimensione os elementos no canvas
5. Use o painel direito para ajustar propriedades
6. Clique em "Salvar" quando terminar
```

### 2. Adicionar Texto

```
1. Clique em "Texto" na barra de ferramentas
2. O texto aparece no canvas
3. Duplo clique para editar o conteúdo
4. Use o painel de propriedades para:
   - Alterar fonte e tamanho
   - Mudar cor
   - Ajustar alinhamento
   - Adicionar negrito/itálico/sublinhado
```

### 3. Inserir QR Code

```
1. Clique em "QR Code" na barra de ferramentas
2. Duplo clique no QR Code para inserir URL/texto
3. Ajuste tamanho arrastando as bordas
4. Configure cores no painel de propriedades
5. Escolha nível de correção de erro
```

### 4. Adicionar Código de Barras

```
1. Clique em "Código Barras"
2. Duplo clique para inserir o código
3. Escolha o formato no painel de propriedades
4. Ative/desative exibição do texto
5. Personalize cores
```

### 5. Usar Variáveis Dinâmicas

```
No texto, use:
- {{nome}} para nome do produto
- {{preco}} para preço
- {{codigo}} para código
- {{quantidade}} para quantidade

Exemplo: "{{nome}} - R$ {{preco}}"
```

### 6. Exportar Etiqueta

```
1. Clique em "Exportar" no canto superior direito
2. Escolha PNG ou PDF
3. O arquivo será baixado automaticamente
```

## 📂 Estrutura de Arquivos

```
src/
├── components/
│   └── labels/
│       ├── LabelCanvas.tsx          # Canvas principal
│       ├── ElementsToolbar.tsx      # Barra de ferramentas
│       ├── PropertiesPanel.tsx      # Painel de propriedades
│       └── elements/
│           ├── DraggableText.tsx    # Elemento de texto
│           ├── DraggableQRCode.tsx  # Elemento QR Code
│           ├── DraggableBarcode.tsx # Elemento código de barras
│           ├── DraggableImage.tsx   # Elemento imagem
│           └── DraggableRectangle.tsx # Elemento retângulo
│
├── pages/
│   ├── Editor.tsx                   # Página principal do editor
│   └── TemplatesPage.tsx            # Lista de templates
│
└── types/
    └── label.types.ts               # Tipos TypeScript
```

## 🎨 Atalhos do Teclado

| Atalho | Ação |
|--------|------|
| **Clique** | Selecionar elemento |
| **Duplo Clique** | Editar conteúdo |
| **Arrastar** | Mover elemento |
| **Arrastar bordas** | Redimensionar |
| **× no elemento** | Deletar |

## 🔧 Tecnologias Utilizadas

- **React 18** com TypeScript
- **react-rnd** - Drag and drop + resize
- **qrcode.react** - Geração de QR Codes
- **react-barcode** - Códigos de barras
- **html2canvas** - Exportação PNG
- **jsPDF** - Exportação PDF
- **Tailwind CSS** - Estilização

## 📊 Tipos de Etiquetas Sugeridas

### 1. Etiqueta de Preço
```
Elementos:
- Texto: Nome do Produto
- Texto: Preço (grande e destacado)
- Código de Barras: EAN13
- Retângulo: Fundo destacado para preço
```

### 2. Etiqueta de Produto Completa
```
Elementos:
- Texto: Nome do Produto
- Texto: Descrição
- QR Code: Link para produto online
- Código de Barras: Código interno
- Texto: Preço
- Imagem: Logo da empresa
```

### 3. Etiqueta de Prateleira (Rabicho)
```
Elementos:
- Texto: Categoria
- Texto: Nome do Produto (grande)
- Código de Barras: EAN13
- Retângulo: Fundo colorido por categoria
```

### 4. Etiqueta de Estoque
```
Elementos:
- QR Code: Código do produto
- Texto: Código interno
- Texto: Quantidade
- Texto: Data de entrada
- Texto: Localização
```

## 🎯 Boas Práticas

1. **Nomeie seus templates**: Use nomes descritivos
2. **Use variáveis**: Para dados que mudam frequentemente
3. **Teste o tamanho**: Verifique se cabe na impressora
4. **Salve regularmente**: Use o botão Salvar frequentemente
5. **Duplique antes de editar**: Mantenha backup de templates importantes
6. **Use o grid**: Para alinhamento profissional
7. **Bloqueie elementos**: Evite mover elementos finalizados acidentalmente

## 🐛 Solução de Problemas

### QR Code não escaneia
- Aumente o tamanho do QR Code
- Use nível de correção de erro mais alto (H)
- Verifique o contraste (preto em fundo branco)

### Código de barras não funciona
- Verifique se o código tem o número correto de dígitos
- Use o formato apropriado (EAN13 tem 13 dígitos)
- Aumente o tamanho se a leitura estiver difícil

### Texto cortado
- Aumente a altura do elemento de texto
- Reduza o tamanho da fonte
- Use quebra de linha adequada

### Exportação com qualidade baixa
- Use o zoom 100% antes de exportar
- Exporte em PNG para melhor qualidade
- Aumente o tamanho da etiqueta se possível

## 🔄 Próximas Funcionalidades

- [ ] Impressão direta (sem exportar)
- [ ] Templates de biblioteca pública
- [ ] Importação de dados CSV para impressão em lote
- [ ] Histórico de versões (Ctrl+Z)
- [ ] Alinhamento automático de elementos
- [ ] Grupos de elementos
- [ ] Camadas (Z-index visual)
- [ ] Duplicar elemento
- [ ] Copiar/Colar elementos

## 📞 Suporte

Para dúvidas ou problemas, entre em contato com a equipe Innobyte.

---

**Desenvolvido com ❤️ pela equipe Innobyte**
