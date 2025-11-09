# 🚀 Guia Rápido - Sistema de Usuários

## 📋 Como Usar

### **1️⃣ Criar Novo Usuário**

1. Acesse `/users`
2. Clique no botão **"Novo Usuário"** (verde, canto superior direito)
3. Preencha os campos obrigatórios:

**Dados do Cliente:**
- CNPJ *
- Razão Social *
- Telefone *
- E-mail *
- Senha * (mínimo 6 caracteres)

**Dados da Licença:**
- Tipo de Licença * (Contrato / Experiência / Demonstração)
- Limite de Empresas * (mínimo 1)
- Data de Início *
- Data de Expiração *
- Intervalo * (Mensal / Trimestral / Semestral / Anual)
- Valor da Parcela *

4. Clique em **"Criar Usuário"**
5. Aguarde confirmação
6. Será redirecionado para a lista

---

### **2️⃣ Editar Usuário Existente**

1. Na tabela de usuários, clique no ícone ✏️ **Editar**
2. Formulário abre com dados preenchidos
3. Altere os campos desejados

**Campos Especiais em Edição:**
- **Senha**: Deixe em branco para manter a senha atual
- **Permissões**: Checkboxes aparecem apenas em edição
  - Licença Bloqueada
  - Renovação Automática
  - Permite Token API
  - Permite Criar Modelos
  - Permite Cadastrar Produtos
  - Apenas Modelos PDF

4. Clique em **"Atualizar"**
5. Aguarde confirmação
6. Volta para a lista

---

### **3️⃣ Bloquear/Desbloquear Usuário**

**Bloquear:**
1. Clique no ícone 🚫 amarelo na tabela
2. Confirme: "Tem certeza que deseja bloquear?"
3. Licença é bloqueada
4. Linha fica vermelha
5. Badge muda para "Bloqueada"

**Desbloquear:**
1. Clique no ícone 🔓 verde
2. Confirme: "Tem certeza que deseja desbloquear?"
3. Licença é desbloqueada
4. Linha volta ao normal
5. Badge muda para status atual

---

### **4️⃣ Excluir Usuário**

⚠️ **ATENÇÃO: Ação irreversível!**

1. Clique no ícone 🗑️ vermelho
2. Confirme: "Tem certeza que deseja excluir?"
3. Usuário é removido permanentemente
4. Lista atualiza automaticamente
5. Summary cards atualizam

---

### **5️⃣ Filtrar Usuários**

1. Clique no botão **"Filtros"** (azul, canto superior direito)
2. Sidebar abre pela direita
3. Preencha os filtros desejados:
   - **Cliente**: Nome da empresa/pessoa
   - **E-mail**: E-mail do usuário
   - **Tipo de Licença**: Contrato / Experiência / Demonstração
   - **Apenas Bloqueadas**: Checkbox

4. Clique em **"Aplicar Filtros"**
5. Tabela filtra resultados
6. Sidebar fecha automaticamente

**Limpar Filtros:**
- Clique em "Limpar Filtros"
- Todos os campos são resetados
- Mostra todos os usuários

---

### **6️⃣ Paginar Resultados**

📄 **Quando há mais de 10 usuários:**

1. Veja o contador: "Mostrando X de Y usuários"
2. Use os botões:
   - **Anterior** ← (desabilitado na primeira página)
   - **Página X de Y** (indicador)
   - **Próxima** → (desabilitado na última página)

3. Página muda automaticamente
4. Loading aparece brevemente
5. Tabela atualiza com novos dados

---

## 📊 **Entendendo a Interface**

### **Summary Cards** (Topo da página)

**Card Vermelho** 🔴
- **Vencidas hoje**: Quantas expiraram hoje
- **Vencendo em 3 dias**: Próximas a vencer (3 dias)
- **Vencendo em 7 dias**: Próximas a vencer (7 dias)

**Card Amarelo** 🟡
- **Licenças Bloqueadas**: Total de licenças bloqueadas

**Card Verde** 🟢
- **Licenças Ativas**: Quantas estão ativas
- **Total**: Total geral de licenças

---

### **Badges de Status**

| Badge | Cor | Significado |
|-------|-----|-------------|
| **Ativa** | Verde 🟢 | Funcionando normalmente |
| **Bloqueada** | Vermelho 🔴 | Licença bloqueada manualmente |
| **Vencida** | Laranja 🟠 | Data de expiração passou |
| **Próximo Vencimento** | Amarelo 🟡 | Vence em até 7 dias |

---

### **Badges de Tipo**

| Tipo | Cor | Descrição |
|------|-----|-----------|
| **CONTRATO** | Azul 🔵 | Licença contratada |
| **EXPERIENCIA** | Roxo 🟣 | Período de teste |
| **DEMONSTRACAO** | Cinza ⚫ | Demo temporária |

---

### **Tabela de Usuários**

| Coluna | Descrição |
|--------|-----------|
| **Cliente** | Avatar + Nome da empresa |
| **E-mail** | E-mail de acesso |
| **Tipo Licença** | Badge colorido do tipo |
| **Empresas** | Ativas / Limite (ex: 3/5) |
| **Data Início** | Quando começou |
| **Data Expiração** | Quando vence + dias restantes |
| **Status** | Badge de status atual |
| **Ações** | Botões (editar/bloquear/excluir) |

---

## ⚠️ **Validações e Regras**

### **Ao Criar Usuário:**
- ✅ Todos os campos obrigatórios (*) devem ser preenchidos
- ✅ E-mail deve ter formato válido
- ✅ Senha deve ter no mínimo 6 caracteres
- ✅ Limite de empresas deve ser no mínimo 1
- ✅ Valor da parcela não pode ser negativo
- ✅ Data de início não pode ser maior que expiração

### **Ao Editar Usuário:**
- ✅ Mesmas validações de criação
- ✅ Senha é opcional (deixe em branco para manter)
- ✅ Permissões podem ser alteradas via checkboxes

### **Ao Bloquear:**
- ⚠️ Usuário não consegue mais acessar o sistema
- ⚠️ Empresas associadas são afetadas
- ⚠️ Pode ser desbloqueado a qualquer momento

### **Ao Excluir:**
- ⚠️ **AÇÃO IRREVERSÍVEL!**
- ⚠️ Todas as empresas associadas são removidas
- ⚠️ Todas as integrações são removidas
- ⚠️ Todos os tokens são invalidados
- ⚠️ Dados não podem ser recuperados

---

## 🎯 **Fluxo Completo de Uso**

### **Cenário: Novo Cliente**
1. ✅ Clique em "Novo Usuário"
2. ✅ Preencha CNPJ, Razão Social, Telefone, E-mail
3. ✅ Defina senha inicial
4. ✅ Selecione tipo "Experiência" (30 dias de teste)
5. ✅ Defina limite de 1 empresa
6. ✅ Data início = hoje, expiração = hoje + 30 dias
7. ✅ Intervalo = Mensal, Valor = R$ 0,00
8. ✅ Crie usuário
9. ✅ Cliente recebe acesso por 30 dias

### **Cenário: Converter Trial em Contrato**
1. ✅ Busque usuário por e-mail nos filtros
2. ✅ Clique em "Editar"
3. ✅ Mude tipo para "Contrato"
4. ✅ Aumente limite de empresas (ex: 5)
5. ✅ Estenda data de expiração (ex: +12 meses)
6. ✅ Defina valor da parcela (ex: R$ 299,00)
7. ✅ Intervalo = Mensal
8. ✅ Marque "Renovação Automática"
9. ✅ Marque permissões desejadas
10. ✅ Atualize usuário

### **Cenário: Cliente Inadimplente**
1. ⚠️ Busque cliente na lista
2. ⚠️ Clique em "Bloquear" (ícone 🚫)
3. ⚠️ Confirme bloqueio
4. ⚠️ Cliente não consegue mais acessar
5. ⚠️ Quando pagar, clique em "Desbloquear"

### **Cenário: Cliente Cancelou**
1. 🗑️ Busque cliente na lista
2. 🗑️ Clique em "Excluir" (ícone 🗑️)
3. 🗑️ **ATENÇÃO:** Confirme exclusão
4. 🗑️ Todos os dados são removidos
5. 🗑️ Ação não pode ser desfeita

---

## 💡 **Dicas Úteis**

### **Performance**
- 📄 Use filtros para encontrar usuários rapidamente
- 📄 Paginação carrega apenas 10 por vez
- 📄 Summary atualiza automaticamente

### **Segurança**
- 🔒 Senhas são criptografadas
- 🔒 Tokens de acesso expiram
- 🔒 Bloqueio imediato do acesso
- 🔒 Confirmação em ações destrutivas

### **Manutenção**
- 🔔 Acompanhe cards de vencimento
- 🔔 Bloqueie temporariamente antes de excluir
- 🔔 Faça backup antes de exclusões em massa
- 🔔 Teste em demonstração antes de aplicar

---

## 🐛 **Solução de Problemas**

### **"Erro ao carregar usuários"**
- ✅ Verifique conexão com internet
- ✅ Verifique se API está online
- ✅ Recarregue a página (F5)

### **"E-mail inválido"**
- ✅ Use formato: nome@dominio.com
- ✅ Sem espaços antes/depois
- ✅ Domínio válido (.com, .br, etc)

### **"Senha deve ter no mínimo 6 caracteres"**
- ✅ Use senha com 6+ caracteres
- ✅ Combine letras, números e símbolos
- ✅ Evite senhas óbvias

### **Botões não respondem**
- ✅ Aguarde loading terminar
- ✅ Não clique múltiplas vezes
- ✅ Verifique campos obrigatórios

### **Filtros não funcionam**
- ✅ Clique em "Aplicar Filtros"
- ✅ Digite valores válidos
- ✅ Use "Limpar Filtros" para resetar

---

**📞 Suporte:** Em caso de dúvidas, entre em contato com o administrador do sistema.

**📖 Documentação Técnica:** Veja `INTEGRATION_STATUS.md` para detalhes técnicos.
