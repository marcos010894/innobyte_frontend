# 📊 Dashboard Cliente - Documentação Visual

## 🎯 O que foi implementado

Criei um **Dashboard específico para clientes** que mostra todas as informações da licença de forma visual e intuitiva!

---

## 🎨 Visual do Dashboard Cliente

```
┌──────────────────────────────────────────────────────────────┐
│  Bem-vindo, Empresa Teste LTDA!                             │
│  Aqui está um resumo da sua licença e funcionalidades      │
└──────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────┐
│  ⚠️ Licença Próxima do Vencimento                           │
│  Sua licença vence em 171 dias. Renove com antecedência!   │
└──────────────────────────────────────────────────────────────┘

┌────────────────┬────────────────┬────────────────┬────────────────┐
│  🛡️ Status      │  📅 Validade    │  🏢 Empresas   │  🔑 Permissões │
│  Ativa         │  171 dias      │  1 / 10        │  3 / 3         │
│  Tipo:contrato │  29/04/2026    │  9 disponíveis │  Todas ativas  │
└────────────────┴────────────────┴────────────────┴────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🏢 Uso de Empresas                                          │
│  Empresas Cadastradas: 1 de 10                              │
│  ▓░░░░░░░░░ 10%                                             │
│  ✓ Você ainda pode cadastrar 9 empresas.                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  📅 Tempo de Licença                                         │
│  Dias Restantes: 171 dias                                   │
│  ▓▓▓▓▓▓▓░░░ 47%                                             │
│  ✓ Sua licença está válida.                                │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  ✅ Funcionalidades Disponíveis                              │
│                                                              │
│  ✓ Editor de Modelos        ✓ Integração API               │
│     Disponível                  Disponível                  │
│                                                              │
│  ✓ Cadastro de Produtos     ✓ Impressão de Etiquetas       │
│     Disponível                  Sempre disponível           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  🎧 Precisa de Ajuda?                                        │
│  Nossa equipe está pronta para auxiliar você.               │
│  [📞 Contatar Suporte]                                      │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Informações Mostradas

### 1. **Header Personalizado**
- Nome da empresa (Razão Social)
- Mensagem de boas-vindas

### 2. **Alerta de Status** (Condicional)
Aparece quando:
- ⛔ Licença bloqueada
- ⛔ Licença vencida  
- ⚠️ Menos de 30 dias para vencer

### 3. **Cards de Status** (4 cards)

#### 🛡️ Status da Licença
- Status: Ativa / Bloqueada / Vencida / Perto de Vencer
- Tipo de licença (contrato/teste/vitalícia)
- Cor dinâmica:
  - 🟢 Verde: Ativa
  - 🟡 Amarelo: Perto de vencer
  - 🔴 Vermelho: Vencida/Bloqueada

#### 📅 Validade
- Dias para vencer
- Data de expiração formatada (dd/mm/aaaa)

#### 🏢 Empresas
- Empresas ativas / Limite
- Quantas ainda podem cadastrar

#### 🔑 Permissões
- Contagem de permissões ativas
- Total: 3 (Token API, Criar Modelos, Cadastrar Produtos)

### 4. **Gráficos de Progresso** (2 gráficos)

#### 🏢 Uso de Empresas
- Barra de progresso visual
- Cores:
  - 🟢 Verde: < 80%
  - 🟡 Amarelo: 80-99%
  - 🔴 Vermelho: 100% (limite atingido)
- Mensagem dinâmica:
  - ✓ "Você ainda pode cadastrar X empresas"
  - ⚠️ "Próximo do limite"
  - ⚠️ "Limite atingido! Contate o suporte"

#### 📅 Tempo de Licença
- Barra de progresso baseada em dias restantes
- Cores:
  - 🟢 Verde: > 90 dias
  - 🟡 Amarelo: 30-90 dias
  - 🔴 Vermelho: < 30 dias
- Mensagens:
  - ✓ "Licença válida"
  - ⚠️ "Programe a renovação"
  - ⚠️ "Próxima do vencimento!"

### 5. **Grid de Funcionalidades** (4 cards)

Cada card mostra:
- ✅ Ícone da funcionalidade
- ✅ Nome da funcionalidade
- ✅ Status (Disponível/Indisponível)
- ✅ Check verde ou X cinza

**Funcionalidades:**
1. **Editor de Modelos**
   - Baseado em: `permite_criar_modelos`
   - Nota adicional se `apenas_modelos_pdf = true`

2. **Integração API**
   - Baseado em: `permite_token`

3. **Cadastro de Produtos**
   - Baseado em: `permite_cadastrar_produtos`

4. **Impressão de Etiquetas**
   - **Sempre disponível** (sem restrição)

### 6. **Card de Suporte**
- Botão para contatar suporte
- Design destacado (gradiente azul)

---

## 🎨 Cores e Estados

### Status da Licença

| Status | Cor | Quando |
|--------|-----|--------|
| ✅ Ativa | Verde | `!bloqueada && !vencida && dias > 30` |
| ⚠️ Perto de Vencer | Amarelo | `!bloqueada && !vencida && dias < 30` |
| ⛔ Vencida | Vermelho | `vencida = true` |
| ⛔ Bloqueada | Vermelho | `bloqueada = true` |

### Progresso de Empresas

| Uso | Cor | Mensagem |
|-----|-----|----------|
| 0-79% | 🟢 Verde | "Você ainda pode cadastrar X empresas" |
| 80-99% | 🟡 Amarelo | "Você está próximo do limite" |
| 100% | 🔴 Vermelho | "Limite atingido! Contate o suporte" |

### Progresso de Validade

| Dias Restantes | Cor | Mensagem |
|----------------|-----|----------|
| > 90 dias | 🟢 Verde | "Sua licença está válida" |
| 30-90 dias | 🟡 Amarelo | "Programe a renovação da sua licença" |
| < 30 dias | 🔴 Vermelho | "Sua licença está próxima do vencimento!" |

---

## 🔄 Fluxo de Exibição

```
1. Cliente faz login
   ↓
2. Sistema verifica user.tipo === 'cliente'
   ↓
3. Dashboard.tsx detecta e renderiza <DashboardCliente />
   ↓
4. DashboardCliente lê user.licenca do contexto
   ↓
5. Exibe todas as informações da licença
```

---

## 📱 Responsividade

- **Mobile**: Cards empilhados (1 coluna)
- **Tablet**: 2 colunas
- **Desktop**: 4 colunas para cards, 2 para gráficos

---

## 🧪 Dados de Exemplo

Com a licença fornecida:
```json
{
  "tipo_licenca": "contrato",
  "data_expiracao": "2026-04-29",
  "dias_para_vencer": 171,
  "limite_empresas": 10,
  "empresas_ativas": 1,
  "bloqueada": false,
  "permite_token": true,
  "permite_criar_modelos": true,
  "permite_cadastrar_produtos": true,
  "apenas_modelos_pdf": false
}
```

**Dashboard mostrará:**
- ✅ Status: **Ativa** (verde)
- 📅 Validade: **171 dias** até 29/04/2026
- 🏢 Empresas: **1 / 10** (9 disponíveis)
- 🔑 Permissões: **3 / 3** ativas
- Barra de empresas: **10%** (verde)
- Barra de validade: **47%** (verde)
- Todas as 4 funcionalidades **disponíveis** ✓

---

## ✅ Resumo

### ✨ Benefícios

1. **Visual e Intuitivo**: Cliente vê status da licença de forma clara
2. **Alertas Proativos**: Avisos de vencimento e limites
3. **Progresso Visual**: Barras mostram uso de recursos
4. **Permissões Claras**: Cliente sabe exatamente o que pode usar
5. **Call-to-Action**: Botão de suporte bem posicionado

### 📊 Dados Exibidos

✅ Status da licença (ativa/bloqueada/vencida)
✅ Tipo de licença
✅ Data de expiração
✅ Dias para vencer
✅ Limite de empresas
✅ Empresas ativas
✅ Status de bloqueio
✅ Todas as permissões (4 flags)

### 🎯 Funcionalidades Controladas

O dashboard mostra quais funcionalidades o cliente pode acessar:
- ✅ Editor de Modelos (se permitido)
- ✅ Integração API (se permitido)
- ✅ Cadastro de Produtos (se permitido)
- ✅ Impressão (sempre disponível)

---

## 🚀 Próximos Passos

O dashboard está pronto! Agora você pode:

1. **Testar**: Faça login como cliente e veja o dashboard
2. **Ocultar menus**: Ajustar sidebar para mostrar apenas opções permitidas
3. **Adicionar gráficos**: Estatísticas de uso do cliente

🎉 **Dashboard Cliente completo e funcional!**
