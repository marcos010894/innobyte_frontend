# 🎯 Validações e Máscaras - Sistema de Etiquetas

## 📋 Resumo das Funcionalidades Implementadas

### ✅ O Que Foi Implementado

1. **Máscaras Automáticas**
   - ✅ CNPJ: `00.000.000/0000-00`
   - ✅ Telefone: `(00) 00000-0000` ou `(00) 0000-0000`
   - ✅ CEP: `00000-000`

2. **Validações em Tempo Real**
   - ✅ Validação de CNPJ (com cálculo de dígitos verificadores)
   - ✅ Validação de e-mail (formato válido com @)
   - ✅ Validação de telefone (10-11 dígitos)
   - ✅ Validação de datas (formato YYYY-MM-DD)
   - ✅ Validação de data de expiração > data de início
   - ✅ Validação de razão social (mínimo 3 caracteres)
   - ✅ Validação de senha (mínimo 6 caracteres)

3. **🌐 Consulta Automática de CNPJ**
   - ✅ Integração com API da ReceitaWS (gratuita)
   - ✅ Botão "Consultar" ao lado do campo CNPJ
   - ✅ Preenchimento automático de:
     - Razão Social
     - Nome Fantasia
     - Telefone
     - E-mail
     - Endereço completo
   - ✅ Estados de loading durante consulta
   - ✅ Mensagens de erro amigáveis

4. **Feedback Visual**
   - ✅ Bordas vermelhas em campos inválidos
   - ✅ Mensagens de erro abaixo dos campos
   - ✅ Ícones de validação
   - ✅ Estados de loading
   - ✅ Banner de erro centralizado no topo do formulário

---

## 🚀 Como Usar

### 1. Campo CNPJ com Consulta Automática

```typescript
// O campo CNPJ tem máscara automática e validação
// Ao digitar, a máscara é aplicada: 12345678000190 → 12.345.678/0001-90

// Ao clicar em "Consultar", a API da Receita Federal é chamada:
// - Se encontrado: preenche automaticamente todos os campos
// - Se não encontrado: exibe mensagem de erro
// - Se houver limite de requisições: avisa o usuário
```

**Exemplo de uso:**
1. Digite um CNPJ válido (ex: `06.990.590/0001-23`)
2. Clique no botão "Consultar" 🔍
3. Os campos serão preenchidos automaticamente! ✨

### 2. Validações Automáticas

```typescript
// Todas as validações ocorrem em dois momentos:

// 1. onBlur (quando o usuário sai do campo)
// - Valida o formato
// - Exibe mensagem de erro se inválido

// 2. onSubmit (quando clica em "Salvar")
// - Valida todos os campos obrigatórios
// - Exibe lista de erros no banner
// - Impede o envio se houver erros
```

### 3. Máscaras em Tempo Real

As máscaras são aplicadas **enquanto você digita**:

- **CNPJ:** `12.345.678/0001-90`
- **Telefone:** `(11) 98765-4321`
- **CEP:** `01310-100`

---

## 📁 Arquivos Criados/Modificados

### 🆕 Novos Arquivos

#### `src/services/cnpj.service.ts`
Serviço para consultar CNPJ na Receita Federal:
```typescript
export const consultarCNPJ = async (cnpj: string): Promise<{ 
  success: boolean; 
  data?: CNPJData; 
  message?: string 
}> => {
  // Consulta API da ReceitaWS
  // Retorna dados da empresa
}

export const consultarCEP = async (cep: string) => {
  // Consulta API ViaCEP
  // Retorna dados de endereço
}
```

#### `src/utils/validation.ts`
Funções de validação e máscara:
```typescript
// Validações
export const validarCNPJ = (cnpj: string): boolean;
export const validarEmail = (email: string): boolean;
export const validarData = (data: string): boolean;
export const validarTelefone = (telefone: string): boolean;

// Máscaras
export const mascararCNPJ = (value: string): string;
export const mascararTelefone = (value: string): string;
export const mascararCEP = (value: string): string;

// Utilitários
export const removerMascara = (value: string): string;
export const formatarMoeda = (value: number): string;
export const formatarData = (data: string): string;
```

### ♻️ Arquivos Modificados

#### `src/components/users/ClientDataForm.tsx`
- ✅ Adicionado props `data` e `onChange` para comunicação com o pai
- ✅ Implementadas máscaras em CNPJ e Telefone
- ✅ Adicionadas validações em tempo real (onBlur)
- ✅ Implementado botão "Consultar CNPJ"
- ✅ Estado de loading durante consulta
- ✅ Feedback visual de erros

#### `src/components/users/LicenseDataForm.tsx`
- ✅ Adicionado props `data` e `onChange`
- ✅ Validações de datas (formato e lógica)
- ✅ Validação: data_expiracao > data_inicio
- ✅ Campo `min` no input de data de expiração
- ✅ Feedback visual de erros

#### `src/pages/UserForm.tsx`
- ✅ Removido dados mockados
- ✅ Implementada coleta real de dados dos forms filhos
- ✅ Adicionada função `validateForm()` completa
- ✅ Validação antes do envio à API
- ✅ Banner de erros consolidado
- ✅ Remoção de máscaras antes de enviar à API

---

## 🔧 API da ReceitaWS

### Como Funciona

A API da ReceitaWS é **gratuita** e **não requer autenticação**:

```
GET https://receitaws.com.br/v1/cnpj/{cnpj}
```

**Resposta de sucesso:**
```json
{
  "status": "OK",
  "nome": "EMPRESA EXEMPLO LTDA",
  "fantasia": "EXEMPLO",
  "cnpj": "12.345.678/0001-90",
  "telefone": "(11) 9876-5432",
  "email": "contato@exemplo.com.br",
  "logradouro": "RUA EXEMPLO",
  "numero": "123",
  "bairro": "CENTRO",
  "municipio": "SÃO PAULO",
  "uf": "SP",
  "cep": "01310-100"
}
```

### Limites

- ⚠️ **3 requisições por minuto** (limite gratuito)
- Se exceder: retorna HTTP 429 (Too Many Requests)
- Solução: aguardar alguns segundos e tentar novamente

### Alternativas

Se precisar de mais requisições:
1. **Brasil API**: https://brasilapi.com.br/
2. **API CNPJ**: https://api-publica.speedio.com.br/
3. **Serviço próprio**: implementar scraping da Receita Federal

---

## 🎨 Feedback Visual

### Estados dos Campos

#### ✅ Campo Válido
```tsx
<input className="border border-gray-300 ..." />
```

#### ❌ Campo Inválido
```tsx
<input className="border border-red-500 ..." />
<p className="text-red-500 text-xs">CNPJ inválido</p>
```

#### ⏳ Campo em Loading
```tsx
<button disabled>
  <i className="fas fa-spinner fa-spin"></i>
  Consultando...
</button>
```

### Banner de Erros

```tsx
{error && (
  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
    <i className="fas fa-exclamation-circle text-red-500"></i>
    <h3 className="font-semibold text-red-800">Erro</h3>
    <p className="text-sm text-red-700">{error}</p>
  </div>
)}
```

---

## 🧪 Como Testar

### 1. Teste de Consulta CNPJ

```bash
# CNPJs válidos para teste:
06.990.590/0001-23  # Embracon
33.000.167/0001-01  # Petrobras
00.000.000/0001-91  # Banco do Brasil
```

1. Acesse: http://localhost:3000/users/new
2. Digite um CNPJ válido
3. Clique em "Consultar"
4. Verifique se os campos foram preenchidos

### 2. Teste de Validações

```bash
# Testes de CNPJ inválido:
12.345.678/0001-00  # Dígitos verificadores errados
11.111.111/1111-11  # Todos os dígitos iguais
123                  # Incompleto

# Testes de E-mail inválido:
teste@              # Sem domínio
@exemplo.com        # Sem usuário
teste               # Sem @

# Testes de Datas:
# Data de expiração antes da data de início
# Datas no formato errado
# Datas vazias em campos obrigatórios
```

### 3. Teste de Máscaras

1. Digite apenas números em qualquer campo com máscara
2. Verifique se a formatação é aplicada automaticamente
3. Tente colar valores sem formatação
4. Verifique se a máscara é aplicada corretamente

---

## 📊 Fluxo de Validação

```
┌─────────────────────────────────────────────────────┐
│ 1. Usuário preenche o formulário                   │
│    - Máscaras aplicadas em tempo real              │
│    - Validação onBlur em cada campo                │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 2. Usuário clica em "Salvar"                       │
│    - validateForm() executa                         │
│    - Verifica todos os campos obrigatórios         │
└─────────────────────────────────────────────────────┘
                        ↓
                ┌───────┴───────┐
                │  Há erros?    │
                └───────┬───────┘
                        │
            ┌───────────┴───────────┐
           SIM                      NÃO
            │                        │
            ↓                        ↓
┌────────────────────┐    ┌───────────────────┐
│ Exibe banner       │    │ Remove máscaras   │
│ com lista de erros │    │ dos campos        │
│ e impede envio     │    └─────────┬─────────┘
└────────────────────┘              │
                                    ↓
                        ┌───────────────────┐
                        │ Envia para API    │
                        │ createUsuario()   │
                        │ updateUsuario()   │
                        └─────────┬─────────┘
                                  │
                        ┌─────────┴─────────┐
                        │  Sucesso?         │
                        └─────────┬─────────┘
                                  │
                      ┌───────────┴───────────┐
                     SIM                      NÃO
                      │                        │
                      ↓                        ↓
          ┌───────────────────┐    ┌──────────────────┐
          │ Alert de sucesso  │    │ Exibe erro da    │
          │ Navega para /users│    │ API no banner    │
          └───────────────────┘    └──────────────────┘
```

---

## ⚙️ Configuração

Não é necessária nenhuma configuração adicional! 🎉

As APIs utilizadas são **públicas** e **gratuitas**:
- ReceitaWS: sem autenticação
- ViaCEP: sem autenticação

Se precisar de mais requisições, considere:
1. Implementar cache local (localStorage)
2. Usar outra API com limites maiores
3. Implementar backend proxy

---

## 🐛 Problemas Conhecidos

### Limite de Requisições da ReceitaWS
- **Problema:** 3 requisições por minuto
- **Solução:** Aguardar 20 segundos entre consultas
- **Mensagem:** "Limite de consultas atingido. Tente novamente em alguns segundos."

### CORS em Produção
- **Problema:** Algumas APIs podem bloquear requisições do frontend
- **Solução:** Implementar proxy no backend

---

## 🚀 Próximos Passos

### Funcionalidades Sugeridas

1. **Cache de CNPJs consultados**
   ```typescript
   // Salvar consultas no localStorage
   // Evitar consultas duplicadas
   ```

2. **Debounce na digitação**
   ```typescript
   // Aguardar usuário parar de digitar
   // Aplicar validações após 500ms
   ```

3. **Autocomplete de endereço por CEP**
   ```typescript
   // Campo CEP no form
   // Preencher automaticamente logradouro, bairro, cidade
   ```

4. **Validação de senha forte**
   ```typescript
   // Verificar maiúsculas, minúsculas, números, caracteres especiais
   // Barra de força da senha
   ```

5. **Toast notifications**
   ```typescript
   // Substituir alert() por react-toastify
   // Notificações mais elegantes
   ```

---

## 📝 Exemplos de Código

### Como usar validação em novos componentes

```typescript
import { validarCNPJ, mascararCNPJ, removerMascara } from '@/utils/validation';

const MeuComponente = () => {
  const [cnpj, setCnpj] = useState('');
  const [erro, setErro] = useState('');

  const handleChange = (valor: string) => {
    // Aplica máscara
    const mascarado = mascararCNPJ(valor);
    setCnpj(mascarado);
    setErro('');
  };

  const handleBlur = () => {
    // Remove máscara e valida
    const limpo = removerMascara(cnpj);
    if (!validarCNPJ(limpo)) {
      setErro('CNPJ inválido');
    }
  };

  return (
    <input
      value={cnpj}
      onChange={(e) => handleChange(e.target.value)}
      onBlur={handleBlur}
      className={erro ? 'border-red-500' : 'border-gray-300'}
    />
  );
};
```

### Como consultar CNPJ em outros componentes

```typescript
import { consultarCNPJ } from '@/services/cnpj.service';

const handleConsultar = async () => {
  const result = await consultarCNPJ('12345678000190');
  
  if (result.success && result.data) {
    console.log('Razão Social:', result.data.razao_social);
    console.log('Telefone:', result.data.telefone);
    console.log('E-mail:', result.data.email);
  } else {
    console.error('Erro:', result.message);
  }
};
```

---

## 🎯 Checklist de Implementação

- ✅ Máscaras de CNPJ, Telefone e CEP
- ✅ Validações de CNPJ com dígitos verificadores
- ✅ Validações de e-mail, telefone, datas
- ✅ Consulta automática de CNPJ (ReceitaWS)
- ✅ Feedback visual de erros
- ✅ Loading states
- ✅ Remoção de máscaras antes do envio
- ✅ Validação completa antes do submit
- ✅ Banner de erros consolidado
- ✅ Comunicação entre forms filhos e pai
- ✅ Layout original preservado 100%

---

## 📞 Suporte

Se tiver dúvidas ou problemas:

1. Verifique o console do navegador (F12)
2. Confirme que as APIs externas estão acessíveis
3. Verifique se não excedeu o limite de requisições
4. Teste com CNPJs válidos conhecidos

---

**Status:** ✅ **IMPLEMENTADO E FUNCIONAL**

Todas as validações e máscaras estão prontas e testadas! 🎉
