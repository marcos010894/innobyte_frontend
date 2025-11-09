# 👥 Gerenciamento de Usuários e Licenças

Esta tela foi desenvolvida para gerenciar usuários, licenças e permissões do sistema de etiquetas Innobyte.

## 📋 Estrutura da Página

### 1. ⚙️ **Seção de Filtros**
Permite refinar a busca pelas licenças com os seguintes campos:

**Campos de Busca:**
- Cliente (texto livre)
- E-mail (texto livre)
- Plano (texto livre)
- Status Pagamento (dropdown: Pago, Não Pago, Pendente)
- Tipo Licença (dropdown: Contrato, Experiência, Demonstração)
- Status Bloqueio (dropdown: Bloqueado, Ativo)
- Início De: (data)
- Início Até: (data)
- Expiração De: (data)
- Expiração Até: (data)
- Filtros Especiais (dropdown: Nenhum, Vencidas, Próximas a Vencer)
- Vencimento (dropdown: Nenhum, Hoje, 3 dias, 7 dias, 30 dias)

**Ações:**
- ✅ **APLICAR FILTROS** (botão verde)
- ❌ **Limpar Filtros** (botão cinza)
- ☑️ **Ignorar Contas Excluídas** (checkbox)

**Alertas:**
- 🔔 Aviso de licenças vencidas (com contador)
- ⚠️ Licenças vencendo em breve

---

### 2. 📊 **Tabela de Licenças**
Exibe todas as licenças com as seguintes informações:

**Colunas:**
- Cliente
- E-mail
- Plano
- Limite de Empresas
- Data Início
- Data Expiração (com destaque para vencidas)
- Forma de Pagamento
- Preço
- Repasse (✓/✗)
- Bloqueada (✓/✗)
- Isenta (✓/✗)
- Ações (Editar, Visualizar, Excluir)

**Recursos:**
- Linhas vencidas ficam com fundo vermelho claro
- Hover nas linhas muda cor de fundo
- Paginação na parte inferior
- Ícone de alerta para licenças vencidas

---

### 3. 📝 **Formulário de Edição**
Aparece ao clicar em "Editar" uma licença. Dividido em seções:

#### 👤 **Dados Principais do Cliente**
- CNPJ * (máscara: 00.000.000/0000-00)
- Razão Social *
- Telefone * (máscara: (00) 00000-0000)
- E-mail *
- Senha *

#### 🔑 **Dados da Licença**
- Tipo Licença * (Contrato, Experiência, Demonstração)
- Data Início *
- Data Expiração *
- Dia de Vencimento (1-31)
  - ☑️ Com base no dia da contratação
- Intervalo * (Mensal, Trimestral, Semestral, Anual)
- Usuários Adicionais (número)
- Valor Parcela (R$)
- ☑️ Bloqueado

**Renovação:**
- ☑️ Renovação Automática
- ☑️ Apenas Modelos PDF
- ☑️ Permite inserir ou alterar o token?
- ☑️ Permite criar novos modelos de etiquetas?
- ☑️ Permite cadastrar novos produtos manual ou planilha

#### 🏢 **Informações Adicionais da Empresa**
- CEP * (máscara: 00000-000)
- Logradouro *
- Número
- Bairro *
- Estado * (dropdown com todos os estados)
- Cidade *
- E-mails (adicionar com Enter, pode ter múltiplos)
- Telefones (adicionar com Enter, pode ter múltiplos)

**Funcionalidades Especiais:**
- Tags removíveis para e-mails e telefones
- Cores diferentes para e-mails (azul) e telefones (verde)

#### 🤖 **Configurações de API**
- Dados de Emissão (dropdown)
- 💡 Link "Precisa de ajuda?"
- Nome do Cliente
- Fornecedor da API (eGestor, Omie, Bling, Tiny, SAP, TOTVS, Outro)
- Token da API (campo mono)
- 🔌 **Testar Conexão** (botão amarelo)

#### 📄 **Listagem de Token // API // Clientes**
Tabela para gerenciar tokens de API:

**Colunas:**
- Nome do Emissor
- CNPJ/CPF do Emissor
- Token (mascarado com ..., com botão copiar)
- Ações (Editar, Excluir)

**Funcionalidades:**
- ➕ **Novo** (botão verde para adicionar token)
- Modal para adicionar novo token
- Copiar token para área de transferência
- Confirmação antes de excluir

---

## 🎨 **Cores Utilizadas**

```javascript
// Cores do sistema
primary: '#3B82F6'    // Azul - botões primários
success: '#10B981'    // Verde - sucesso, salvar
accent: '#F59E0B'     // Laranja/Amarelo - alertas, testar
red: '#EF4444'        // Vermelho - avisos, vencidas
```

---

## ⌨️ **Atalhos e Interações**

- **Enter** - Adicionar e-mail ou telefone
- **Hover** - Animações suaves em cards e linhas
- **Click** - Editar licença abre formulário completo
- **Escape** (futuro) - Fechar modais

---

## 🔒 **Validações**

- Campos obrigatórios marcados com *
- CNPJ deve ter formato válido
- E-mail deve ter formato válido
- Datas de expiração devem ser posteriores às de início
- Valor da parcela deve ser maior que 0

---

## 📱 **Responsividade**

A tela é totalmente responsiva:

- **Mobile** (< 768px): 1 coluna, tabelas com scroll horizontal
- **Tablet** (768px - 1024px): 2 colunas nos formulários
- **Desktop** (> 1024px): Layout completo com 2 colunas

---

## 🚀 **Funcionalidades Implementadas**

✅ Filtros avançados com múltiplos critérios
✅ Tabela de licenças com ordenação visual
✅ Alertas de vencimento
✅ Formulário completo de edição
✅ Gerenciamento de múltiplos e-mails e telefones
✅ Gerenciamento de tokens de API
✅ Modal para adicionar novos tokens
✅ Copiar token para área de transferência
✅ Validação de formulários
✅ Feedback visual em todas as ações

---

## 🔜 **Próximas Implementações**

- [ ] Integração real com API
- [ ] Exportação de dados (Excel, CSV, PDF)
- [ ] Importação em lote
- [ ] Envio de e-mail para clientes
- [ ] Logs de alterações
- [ ] Filtros salvos (favoritos)
- [ ] Gráficos de inadimplência
- [ ] Relatórios personalizados
- [ ] Notificações automáticas de vencimento
- [ ] Integração com gateway de pagamento

---

## 📂 **Arquivos Criados**

```
src/
├── pages/
│   └── UsersManagement.tsx       # Página principal
└── components/
    └── users/
        ├── FiltersSection.tsx     # Seção de filtros
        ├── LicensesTable.tsx      # Tabela de licenças
        ├── ClientDataForm.tsx     # Form dados do cliente
        ├── LicenseDataForm.tsx    # Form dados da licença
        ├── CompanyInfoForm.tsx    # Form info da empresa
        ├── ApiConfigForm.tsx      # Form config de API
        └── TokensTable.tsx        # Tabela de tokens
```

---

## 🎯 **Como Usar**

1. **Filtrar Licenças:**
   - Preencha os campos desejados
   - Clique em "APLICAR FILTROS"
   - Use "Limpar Filtros" para resetar

2. **Editar Licença:**
   - Clique no ícone de lápis na tabela
   - Preencha os formulários
   - Clique em "Salvar" ou "Voltar"

3. **Adicionar Token:**
   - Clique em "+ Novo" na seção de tokens
   - Preencha o modal
   - Clique em "Adicionar"

4. **Copiar Token:**
   - Clique no ícone de cópia ao lado do token mascarado

---

## 💡 **Dicas de UX**

- Campos obrigatórios têm asterisco vermelho
- Licenças vencidas ficam em vermelho na tabela
- E-mails e telefones podem ser múltiplos (pressione Enter)
- Tokens são mascarados por segurança
- Hover mostra animações suaves
- Confirmação antes de excluir

---

**Desenvolvido com ❤️ seguindo as cores e padrões do sistema Innobyte**
