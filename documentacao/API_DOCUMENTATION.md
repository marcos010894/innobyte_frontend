# 📋 Documentação API - Sistema de Gerenciamento de Usuários e Licenças

## 🎯 Visão Geral
Sistema para gerenciamento de usuários, licenças, empresas e integrações de API para o sistema Innobyte Etiquetas.

---

## 📊 Entidades e Modelos de Dados

### 1️⃣ **Usuario (Cliente)**

```typescript
interface Usuario {
  id: string | number;                    // ID único do usuário
  cnpj: string;                          // CNPJ (formato: 00.000.000/0000-00)
  razaoSocial: string;                   // Razão Social da empresa
  telefone: string;                      // Telefone (formato: (00) 00000-0000)
  email: string;                         // E-mail principal
  senha: string;                         // Senha (hash no backend)
  dataCriacao: string;                   // ISO 8601 (YYYY-MM-DD)
  dataAtualizacao: string;               // ISO 8601 (YYYY-MM-DD)
  ativo: boolean;                        // Se o usuário está ativo
  excluido: boolean;                     // Soft delete
}
```

**Validações:**
- `cnpj`: Obrigatório, único, formato válido de CNPJ
- `razaoSocial`: Obrigatório, min 3 caracteres, max 255
- `telefone`: Obrigatório, formato brasileiro válido
- `email`: Obrigatório, único, formato de e-mail válido
- `senha`: Obrigatório, min 8 caracteres, hash bcrypt

---

### 2️⃣ **Licenca**

```typescript
interface Licenca {
  id: string | number;                   // ID único da licença
  usuarioId: string | number;            // FK para Usuario
  
  // Tipo de Licença
  tipoLicenca: string;                   // "contrato", "experiencia", "demonstracao"
  
  // Datas
  dataInicio: string;                    // ISO 8601 (YYYY-MM-DD)
  dataExpiracao: string;                 // ISO 8601 (YYYY-MM-DD)
  diaVencimento: number;                 // Dia do mês (1-31)
  baseadoContratacao: boolean;           // Se vencimento é baseado na data de contratação
  intervalo: string;                     // "mensal", "trimestral", "semestral", "anual"
  
  // Limites e Valores
  limiteEmpresas: number;                // Quantidade máxima de empresas permitidas
  usuariosAdicionais: number;            // Quantidade de usuários extras
  valorParcela: number;                  // Valor em decimal (Ex: 199.90)
  
  // Status
  bloqueada: boolean;                    // Se a licença está bloqueada
  
  // Permissões
  renovacaoAutomatica: boolean;          // Se renova automaticamente
  apenasModelosPDF: boolean;             // Se permite apenas modelos PDF
  permiteToken: boolean;                 // Se permite inserir/alterar token
  permiteCriarModelos: boolean;          // Se permite criar novos modelos de etiquetas
  permiteCadastrarProdutos: boolean;     // Se permite cadastrar produtos manual ou planilha
  
  // Campos calculados (não salvar no DB, calcular em tempo real)
  vencida: boolean;                      // Calculado: dataExpiracao < hoje
  diasParaVencer: number;                // Calculado: dias até expirar
  
  // Auditoria
  dataCriacao: string;                   // ISO 8601
  dataAtualizacao: string;               // ISO 8601
}
```

**Validações:**
- `tipoLicenca`: Obrigatório, enum ["contrato", "experiencia", "demonstracao"]
- `dataInicio`: Obrigatório, formato ISO 8601
- `dataExpiracao`: Obrigatório, deve ser >= dataInicio
- `diaVencimento`: Opcional, inteiro entre 1-31
- `intervalo`: Obrigatório, enum ["mensal", "trimestral", "semestral", "anual"]
- `limiteEmpresas`: Obrigatório, inteiro >= 1
- `usuariosAdicionais`: Opcional, inteiro >= 0, padrão 0
- `valorParcela`: Obrigatório, decimal >= 0

---

### 3️⃣ **Empresa**

```typescript
interface Empresa {
  id: string | number;                   // ID único da empresa
  usuarioId: string | number;            // FK para Usuario
  nomeFantasia: string;                  // Nome fantasia
  razaoSocial: string;                   // Razão social
  cnpj: string;                          // CNPJ da empresa
  inscricaoEstadual?: string;            // Inscrição estadual (opcional)
  
  // Endereço
  cep: string;                           // CEP (formato: 00000-000)
  logradouro: string;                    // Rua/Avenida
  numero: string;                        // Número
  complemento?: string;                  // Complemento (opcional)
  bairro: string;                        // Bairro
  cidade: string;                        // Cidade
  estado: string;                        // UF (2 letras)
  
  // Contatos
  emails: string[];                      // Array de e-mails
  telefones: string[];                   // Array de telefones
  
  ativa: boolean;                        // Se a empresa está ativa
  dataCriacao: string;                   // ISO 8601
}
```

**Validações:**
- `nomeFantasia`: Obrigatório, max 255
- `cnpj`: Obrigatório, formato CNPJ válido
- `cep`: Obrigatório, formato 00000-000
- `estado`: Obrigatório, enum de UFs brasileiras
- `emails`: Array com pelo menos 1 e-mail válido
- `telefones`: Array com pelo menos 1 telefone

---

### 4️⃣ **IntegracaoAPI**

```typescript
interface IntegracaoAPI {
  id: string | number;                   // ID único da integração
  usuarioId: string | number;            // FK para Usuario
  provedor: string;                      // "eGestor", "Omie", "Bling", "Tiny", "Conta Azul", "Outro"
  nomeIntegracao: string;                // Nome dado à integração
  appKey: string;                        // Chave da aplicação (criptografada)
  appSecret: string;                     // Segredo da aplicação (criptografado)
  token?: string;                        // Token de acesso (criptografado, opcional)
  urlWebhook?: string;                   // URL do webhook (opcional)
  ativa: boolean;                        // Se a integração está ativa
  dataUltimaConexao?: string;            // ISO 8601, última vez que conectou
  statusConexao: string;                 // "conectado", "desconectado", "erro"
  dataCriacao: string;                   // ISO 8601
}
```

**Validações:**
- `provedor`: Obrigatório, enum dos provedores
- `nomeIntegracao`: Obrigatório, max 100
- `appKey`: Obrigatório, criptografar no backend
- `appSecret`: Obrigatório, criptografar no backend
- `statusConexao`: Enum ["conectado", "desconectado", "erro"]

---

### 5️⃣ **TokenAPI**

```typescript
interface TokenAPI {
  id: string | number;                   // ID único do token
  usuarioId: string | number;            // FK para Usuario
  nome: string;                          // Nome/descrição do token
  tipo: string;                          // "producao", "desenvolvimento", "teste"
  token: string;                         // Token gerado (UUID v4 ou JWT)
  expiracao?: string;                    // ISO 8601 (opcional, null = sem expiração)
  ativo: boolean;                        // Se o token está ativo
  ultimoUso?: string;                    // ISO 8601, última vez usado
  dataCriacao: string;                   // ISO 8601
}
```

**Validações:**
- `nome`: Obrigatório, max 100
- `tipo`: Enum ["producao", "desenvolvimento", "teste"]
- `token`: Gerado automaticamente, único, 64+ caracteres

---

## 🔗 Endpoints da API

### **USUÁRIOS**

#### `GET /api/usuarios`
Lista todos os usuários com filtros e paginação

**Query Parameters:**
```typescript
{
  cliente?: string;              // Busca por nome (LIKE)
  email?: string;                // Busca por e-mail (LIKE)
  tipoLicenca?: string;          // "contrato" | "experiencia" | "demonstracao"
  bloqueada?: boolean;           // true = bloqueadas, false = ativas
  inicioDE?: string;             // Data início >= (ISO 8601)
  inicioAte?: string;            // Data início <= (ISO 8601)
  expiracaoDE?: string;          // Data expiração >= (ISO 8601)
  expiracaoAte?: string;         // Data expiração <= (ISO 8601)
  vencimento?: string;           // "hoje" | "3-dias" | "7-dias" | "30-dias" | "vencidas"
  ignorarExcluidas?: boolean;    // true = não retorna excluídos
  page?: number;                 // Página atual (padrão: 1)
  limit?: number;                // Itens por página (padrão: 10, max: 100)
  sortBy?: string;               // Campo para ordenar (ex: "dataExpiracao", "cliente")
  sortOrder?: string;            // "asc" | "desc"
}
```

**Response:**
```typescript
{
  data: Array<{
    id: number;
    cliente: string;               // Razão social do usuário
    email: string;
    limiteEmpresas: number;
    empresasAtivas: number;        // Contagem atual de empresas (calculado)
    dataInicio: string;            // Formato: DD/MM/YYYY
    dataExpiracao: string;         // Formato: DD/MM/YYYY
    tipoLicenca: string;           // "contrato" | "experiencia" | "demonstracao"
    bloqueada: boolean;
    vencida: boolean;              // Calculado em tempo real
    diasParaVencer: number;        // Calculado em tempo real
  }>;
  pagination: {
    total: number;               // Total de registros
    page: number;                // Página atual
    limit: number;               // Itens por página
    totalPages: number;          // Total de páginas
  };
  summary: {
    vencidasHoje: number;        // Quantidade vencidas hoje
    vencendo3Dias: number;       // Vencendo em 3 dias
    vencendo7Dias: number;       // Vencendo em 7 dias
    bloqueadas: number;          // Total bloqueadas
    ativas: number;              // Total ativas (não bloqueadas)
    totalLicencas: number;       // Total geral
  };
}
```

---

#### `GET /api/usuarios/:id`
Retorna detalhes completos de um usuário específico

**Response:**
```typescript
{
  usuario: Usuario;
  licenca: Licenca;
  empresas: Empresa[];
  integracoes: IntegracaoAPI[];
  tokens: TokenAPI[];
  estatisticas: {
    totalEmpresas: number;
    empresasAtivas: number;
    ultimoAcesso: string;
    totalIntegracoes: number;
    integracoesAtivas: number;
  };
}
```

---

#### `POST /api/usuarios`
Cria um novo usuário com licença

**Request Body:**
```typescript
{
  // Dados do Cliente
  cnpj: string;                  // Obrigatório
  razaoSocial: string;           // Obrigatório
  telefone: string;              // Obrigatório
  email: string;                 // Obrigatório
  senha: string;                 // Obrigatório
  
  // Dados da Licença
  tipoLicenca: string;           // Obrigatório: "contrato" | "experiencia" | "demonstracao"
  dataInicio: string;            // Obrigatório: ISO 8601 (YYYY-MM-DD)
  dataExpiracao: string;         // Obrigatório: ISO 8601 (YYYY-MM-DD)
  diaVencimento?: number;        // Opcional: 1-31
  baseadoContratacao: boolean;   // Padrão: true
  intervalo: string;             // Obrigatório: "mensal" | "trimestral" | "semestral" | "anual"
  limiteEmpresas: number;        // Obrigatório: >= 1
  usuariosAdicionais?: number;   // Opcional: >= 0, padrão: 0
  valorParcela: number;          // Obrigatório: >= 0
  bloqueada: boolean;            // Padrão: false
  
  // Permissões da Licença
  renovacaoAutomatica: boolean;         // Padrão: false
  apenasModelosPDF: boolean;            // Padrão: false
  permiteToken: boolean;                // Padrão: false
  permiteCriarModelos: boolean;         // Padrão: false
  permiteCadastrarProdutos: boolean;    // Padrão: false
}
```

**Response:**
```typescript
{
  success: true;
  message: "Usuário criado com sucesso";
  data: {
    usuarioId: number;
    licencaId: number;
  };
}
```

---

#### `PUT /api/usuarios/:id`
Atualiza dados de um usuário e licença

**Request Body:** (Mesma estrutura do POST, todos os campos opcionais)

**Response:**
```typescript
{
  success: true;
  message: "Usuário atualizado com sucesso";
  data: {
    usuarioId: number;
    licencaId: number;
  };
}
```

---

#### `DELETE /api/usuarios/:id`
Soft delete de um usuário (marca como excluído)

**Response:**
```typescript
{
  success: true;
  message: "Usuário excluído com sucesso";
}
```

---

### **EMPRESAS**

#### `GET /api/usuarios/:usuarioId/empresas`
Lista todas as empresas de um usuário

**Response:**
```typescript
{
  data: Empresa[];
  total: number;
  limite: number;              // Limite da licença
  disponivel: number;          // Quantas ainda pode criar
}
```

---

#### `POST /api/usuarios/:usuarioId/empresas`
Adiciona uma nova empresa

**Request Body:**
```typescript
{
  nomeFantasia: string;        // Obrigatório
  razaoSocial: string;         // Obrigatório
  cnpj: string;                // Obrigatório
  inscricaoEstadual?: string;
  cep: string;                 // Obrigatório
  logradouro: string;          // Obrigatório
  numero: string;              // Obrigatório
  complemento?: string;
  bairro: string;              // Obrigatório
  cidade: string;              // Obrigatório
  estado: string;              // Obrigatório (UF)
  emails: string[];            // Obrigatório, min 1
  telefones: string[];         // Obrigatório, min 1
}
```

**Response:**
```typescript
{
  success: true;
  message: "Empresa cadastrada com sucesso";
  data: Empresa;
}
```

**Regras de Negócio:**
- Verificar se o usuário não excedeu o `limiteEmpresas` da licença
- Retornar erro 403 se limite atingido
- CNPJ deve ser único por usuário

---

#### `PUT /api/empresas/:id`
Atualiza dados de uma empresa

#### `DELETE /api/empresas/:id`
Remove uma empresa (soft delete)

---

### **INTEGRAÇÕES API**

#### `GET /api/usuarios/:usuarioId/integracoes`
Lista integrações do usuário

**Response:**
```typescript
{
  data: IntegracaoAPI[];
}
```

---

#### `POST /api/usuarios/:usuarioId/integracoes`
Cria nova integração

**Request Body:**
```typescript
{
  provedor: string;            // Obrigatório
  nomeIntegracao: string;      // Obrigatório
  appKey: string;              // Obrigatório
  appSecret: string;           // Obrigatório
  token?: string;
  urlWebhook?: string;
}
```

---

#### `POST /api/integracoes/:id/testar`
Testa conexão com a integração

**Response:**
```typescript
{
  success: boolean;
  message: string;
  statusConexao: "conectado" | "erro";
  detalhes?: string;           // Mensagem de erro se houver
}
```

---

### **TOKENS API**

#### `GET /api/usuarios/:usuarioId/tokens`
Lista tokens do usuário

**Response:**
```typescript
{
  data: Array<{
    id: number;
    nome: string;
    tipo: string;
    token: string;             // Mascarado no frontend (primeiros 12 chars)
    expiracao: string | null;
    ativo: boolean;
    ultimoUso: string | null;
    dataCriacao: string;
  }>;
}
```

---

#### `POST /api/usuarios/:usuarioId/tokens`
Cria novo token

**Request Body:**
```typescript
{
  nome: string;                // Obrigatório
  tipo: string;                // Obrigatório
  expiracao?: string;          // Opcional (null = sem expiração)
}
```

**Response:**
```typescript
{
  success: true;
  message: "Token criado com sucesso";
  data: {
    id: number;
    token: string;             // Token completo (mostrar apenas uma vez!)
    nome: string;
    tipo: string;
  };
}
```

---

#### `DELETE /api/tokens/:id`
Remove um token (hard delete, não pode ser recuperado)

---

## 🔒 Autenticação e Segurança

### Headers Obrigatórios:
```
Authorization: Bearer {JWT_TOKEN}
Content-Type: application/json
```

### Criptografia:
- **Senhas**: bcrypt com salt rounds = 12
- **appKey, appSecret, token**: AES-256-GCM
- **Tokens API**: UUID v4 ou JWT com HS256

### Validações:
- Sanitizar todos os inputs (prevenir XSS e SQL Injection)
- Rate limiting: 100 requisições/minuto por IP
- CORS: Apenas origens permitidas

---

## 📦 Códigos de Status HTTP

- `200`: Sucesso
- `201`: Criado com sucesso
- `400`: Requisição inválida (validação falhou)
- `401`: Não autenticado
- `403`: Sem permissão (ex: limite de empresas excedido)
- `404`: Recurso não encontrado
- `409`: Conflito (ex: CNPJ duplicado)
- `422`: Entidade não processável (validação de negócio)
- `429`: Muitas requisições (rate limit)
- `500`: Erro interno do servidor

---

## 🎨 Estados Brasileiros (UFs)

```typescript
const ESTADOS_BRASILEIROS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO"
];
```

---

## 📅 Regras de Negócio Importantes

### Licenças Vencidas:
- Licença é considerada **vencida** quando: `dataExpiracao < hoje`
- Calcular `diasParaVencer` = `dataExpiracao - hoje`
- Se `diasParaVencer < 0`, a licença está vencida

### Bloqueio:
- Licenças podem ser bloqueadas **manualmente** através do campo `bloqueada`
- Quando bloqueada, o usuário não consegue acessar o sistema
- Licenças vencidas devem ter indicação visual (linha vermelha na tabela)

### Limites:
- Campo `limiteEmpresas` define quantas empresas o usuário pode cadastrar
- Ao atingir o limite, não permitir cadastro de novas empresas
- Retornar erro 403 com mensagem clara

### Filtro "Próximas a Vencer":
- **Hoje**: `diasParaVencer = 0`
- **3 dias**: `0 < diasParaVencer <= 3`
- **7 dias**: `0 < diasParaVencer <= 7`
- **30 dias**: `0 < diasParaVencer <= 30`
- **Vencidas**: `diasParaVencer < 0`

### Permissões da Licença:
- `apenasModelosPDF`: Se true, usuário só pode usar modelos PDF, não pode criar personalizados
- `permiteToken`: Se true, usuário pode inserir/alterar tokens de integração
- `permiteCriarModelos`: Se true, usuário pode criar novos modelos de etiquetas
- `permiteCadastrarProdutos`: Se true, usuário pode cadastrar produtos manual ou via planilha
- Essas permissões devem ser checadas no backend antes de permitir ações

### Renovação Automática:
- Se `renovacaoAutomatica = true` e `diasParaVencer <= 0`
- Sistema deve renovar automaticamente a licença
- Calcular nova `dataExpiracao` baseado no `intervalo`
- Se `intervalo = "mensal"`, adicionar 1 mês
- Se `intervalo = "trimestral"`, adicionar 3 meses
- Se `intervalo = "semestral"`, adicionar 6 meses
- Se `intervalo = "anual"`, adicionar 12 meses

---

## 🧪 Dados de Teste Sugeridos

### Usuário 1 - Ativo:
```json
{
  "cnpj": "12.345.678/0001-90",
  "razaoSocial": "CF SAÚDE LTDA",
  "email": "contato@cfsaude.com.br",
  "tipoLicenca": "contrato",
  "limiteEmpresas": 5,
  "dataInicio": "2024-11-30",
  "dataExpiracao": "2025-12-03",
  "intervalo": "mensal",
  "valorParcela": 199.90,
  "bloqueada": false,
  "renovacaoAutomatica": true,
  "permiteCriarModelos": true
}
```

### Usuário 2 - Vencida:
```json
{
  "cnpj": "98.765.432/0001-10",
  "razaoSocial": "ANA CAROLINA S/A",
  "email": "financeiro@anacarolina.com",
  "tipoLicenca": "contrato",
  "limiteEmpresas": 3,
  "dataInicio": "2024-01-04",
  "dataExpiracao": "2024-12-04",
  "intervalo": "mensal",
  "valorParcela": 199.90,
  "bloqueada": true,
  "vencida": true
}
```

### Usuário 3 - Demonstração:
```json
{
  "cnpj": "11.222.333/0001-44",
  "razaoSocial": "Empresa Demo LTDA",
  "email": "demo@empresa.com",
  "tipoLicenca": "demonstracao",
  "limiteEmpresas": 1,
  "dataInicio": "2025-11-01",
  "dataExpiracao": "2025-11-30",
  "intervalo": "mensal",
  "valorParcela": 0.00,
  "apenasModelosPDF": true,
  "permiteCriarModelos": false
}
```

---

## 📞 Contato e Dúvidas

Em caso de dúvidas sobre a implementação dos endpoints, consulte esta documentação ou entre em contato com o time de frontend.

**Versão:** 1.0.0  
**Data:** 07/11/2025  
**Sistema:** Innobyte Etiquetas - Gerenciamento de Usuários
