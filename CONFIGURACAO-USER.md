# Configuração do Usuário (id_empresa)

## ✅ Problema Resolvido!

O campo **`id_empresa`** agora está sendo enviado corretamente no JSON de criação de templates.

## Como Funciona

O `id_empresa` é obtido automaticamente do **localStorage** onde você armazena os dados do usuário após o login.

### Implementação Atual

O código está em `src/services/templateService.ts`, método `convertToCreateRequest()`:

```typescript
convertToCreateRequest(template: LabelTemplate): CreateTemplateRequest {
  // Obter id_empresa do localStorage
  const userData = localStorage.getItem('user');
  let id_empresa = 1; // Valor padrão
  
  if (userData) {
    try {
      const user = JSON.parse(userData);
      id_empresa = user.id_empresa || 1;
    } catch (err) {
      console.error('Erro ao parsear dados do usuário:', err);
    }
  }
  
  return {
    id_empresa,  // ✅ Campo obrigatório agora incluído!
    nome: template.config.name,
    descricao: template.config.description,
    categoria: template.category,
    config: template.config,
    elements: template.elements,
    thumbnail: template.thumbnail,
  };
}
```

## Como Configurar o localStorage

Quando o usuário fizer **login**, você deve armazenar os dados dele no localStorage assim:

```typescript
// Exemplo: após login bem-sucedido
const userData = {
  id: 123,
  id_empresa: 1,  // ⚠️ CAMPO OBRIGATÓRIO
  nome: "João Silva",
  email: "joao@empresa.com",
  tipo_usuario: "CLIENTE",
  // ... outros campos
};

localStorage.setItem('user', JSON.stringify(userData));
localStorage.setItem('token', 'seu-jwt-token-aqui');
```

## Estrutura do JSON Enviado

Agora o JSON enviado ao backend está **completo**:

```json
{
  "id_empresa": 1,           // ✅ Campo obrigatório adicionado!
  "nome": "Novo Template",
  "config": {
    "name": "Novo Template",
    "width": 50,
    "height": 30,
    "unit": "mm",
    "backgroundColor": "#FFFFFF",
    "padding": 0,
    "showGrid": true,
    "gridSize": 10,
    "snapToGrid": false,
    "showCenterLine": true,
    "showMargins": true,
    "showBorders": false,
    "marginTop": 5,
    "marginBottom": 5,
    "marginLeft": 5,
    "marginRight": 5
  },
  "elements": [],
  "thumbnail": "data:image/png;base64,...",
  "compartilhado": false
}
```

## Verificação

Para testar se o `id_empresa` está sendo enviado corretamente:

1. **Faça login** e verifique se o localStorage tem os dados:
   ```javascript
   // No console do navegador:
   console.log(localStorage.getItem('user'));
   ```

2. **Crie um template** no editor

3. **Abra o Network tab** do DevTools e verifique o payload do POST:
   - Deve conter `"id_empresa": 1` (ou o ID da sua empresa)

## Próximos Passos

1. ✅ **Campo `id_empresa` adicionado** - RESOLVIDO!
2. ⏳ **Implementar tela de login** - Configure o localStorage corretamente
3. ⏳ **Testar criação de templates** - Com backend rodando
4. ⏳ **Testar permissões** - MASTER, CLIENTE, ADICIONAL

## Notas Importantes

- Por padrão, se não houver dados no localStorage, usa `id_empresa = 1`
- Ajuste o código se você armazenar os dados do usuário em outro lugar (Context API, Redux, etc.)
- O backend deve validar se o `id_empresa` enviado é válido e pertence ao usuário logado

---

**Status**: ✅ Problema do `id_empresa` faltando está RESOLVIDO!
