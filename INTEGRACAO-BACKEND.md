# 🔌 Guia de Integração com Backend

## ✅ Implementações Concluídas

### 1. Service Layer (`src/services/templateService.ts`)
- ✅ Classe `TemplateService` com todos os métodos da API
- ✅ Conversão entre formato frontend e backend
- ✅ Tratamento de erros
- ✅ TypeScript com tipagem completa

### 2. Hook Customizado (`src/hooks/useTemplates.ts`)
- ✅ `useTemplates()` - Gerencia estado dos templates
- ✅ Loading, error e refresh automático
- ✅ CRUD completo (create, update, delete)
- ✅ Compartilhar template (apenas MASTER)

### 3. Páginas Atualizadas
- ✅ **TemplatesPage** - Lista templates da API
- ✅ **Editor** - Salva/carrega templates da API
- ✅ Loading states e tratamento de erros

---

## 🚀 Como Configurar

### 1. Criar arquivo `.env`
```bash
cd /Users/marcospaulomachadoazevedo/Documents/etiquetas-sys/frontend
cp .env.example .env
```

### 2. Configurar URL da API
Edite o arquivo `.env`:
```env
VITE_API_URL=http://localhost:8000
```

### 3. Instalar dependências (se necessário)
```bash
npm install axios
```

### 4. Reiniciar servidor de desenvolvimento
```bash
npm run dev
```

---

## 📡 Endpoints Consumidos

| Método | Endpoint | Usado em | Status |
|--------|----------|----------|---------|
| GET | `/api/templates` | TemplatesPage (lista) | ✅ Implementado |
| GET | `/api/templates/:id` | Editor (carregar) | ✅ Implementado |
| POST | `/api/templates` | Editor (criar) | ✅ Implementado |
| PUT | `/api/templates/:id` | Editor (atualizar) | ✅ Implementado |
| DELETE | `/api/templates/:id` | TemplatesPage (deletar) | ✅ Implementado |
| PATCH | `/api/templates/:id/compartilhar` | TemplatesPage (MASTER) | ✅ Implementado |

---

## 🔐 Autenticação

O sistema usa **Bearer Token** armazenado no `localStorage`.

### Como funciona:
1. Usuário faz login → Backend retorna token JWT
2. Token é salvo no `localStorage` com chave `token`
3. Todo request inclui header: `Authorization: Bearer {token}`
4. Se token inválido (401), usuário é redirecionado para login

### Interceptor (já configurado):
```typescript
// src/services/api.ts
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 💡 Como Usar nos Componentes

### Exemplo 1: Listar Templates
```typescript
import useTemplates from '@/hooks/useTemplates';

function MeuComponente() {
  const { templates, loading, error } = useTemplates();
  
  if (loading) return <div>Carregando...</div>;
  if (error) return <div>Erro: {error}</div>;
  
  return (
    <ul>
      {templates.map(t => (
        <li key={t.id}>{t.config.name}</li>
      ))}
    </ul>
  );
}
```

### Exemplo 2: Criar Template
```typescript
import useTemplates from '@/hooks/useTemplates';

function Editor() {
  const { createTemplate } = useTemplates();
  
  const handleSave = async () => {
    try {
      await createTemplate(meuTemplate);
      alert('Salvo!');
    } catch (err) {
      alert('Erro!');
    }
  };
}
```

### Exemplo 3: Deletar Template
```typescript
import useTemplates from '@/hooks/useTemplates';

function TemplateCard({ id }: { id: string }) {
  const { deleteTemplate } = useTemplates();
  
  const handleDelete = async () => {
    if (confirm('Deletar?')) {
      await deleteTemplate(id);
    }
  };
  
  return <button onClick={handleDelete}>Deletar</button>;
}
```

### Exemplo 4: Compartilhar (MASTER Only)
```typescript
import useTemplates from '@/hooks/useTemplates';

function TemplateActions({ id, isMaster }: Props) {
  const { compartilharTemplate } = useTemplates();
  
  if (!isMaster) return null; // Só MASTER vê esse botão
  
  const handleShare = async () => {
    await compartilharTemplate(id, true);
    alert('Template compartilhado!');
  };
  
  return <button onClick={handleShare}>Compartilhar</button>;
}
```

---

## 🧪 Testando a Integração

### 1. Teste de Criação
1. Abra o Editor: `http://localhost:3002/editor`
2. Crie uma etiqueta
3. Clique em "Salvar"
4. Verifique se aparece mensagem de sucesso
5. Vá para Templates: `http://localhost:3002/templates`
6. Confirme se o template aparece na lista

### 2. Teste de Edição
1. Na lista de templates, clique em "Editar"
2. Faça alterações
3. Clique em "Salvar"
4. Recarregue a página
5. Confirme se as alterações foram salvas

### 3. Teste de Deleção
1. Na lista de templates, clique em "Deletar"
2. Confirme a ação
3. Template deve sumir da lista

### 4. Teste de Permissões (requer backend configurado)
- **Como CLIENTE:** Não deve conseguir marcar como compartilhado
- **Como COLABORADOR:** Só deve ver templates que criou
- **Como MASTER:** Deve ver todos e poder compartilhar

---

## 🐛 Troubleshooting

### Erro: "Network Error"
- ✅ Verifique se o backend está rodando
- ✅ Confira URL no `.env` (VITE_API_URL)
- ✅ Verifique CORS no backend

### Erro: 401 Unauthorized
- ✅ Faça login novamente
- ✅ Verifique se token está no localStorage: `localStorage.getItem('token')`
- ✅ Verifique validade do token no backend

### Erro: 403 Forbidden
- ✅ Usuário não tem permissão
- ✅ COLABORADOR tentando editar template de outro
- ✅ Usuário comum tentando compartilhar

### Templates não aparecem
- ✅ Verifique console do browser (F12)
- ✅ Veja resposta da API no Network tab
- ✅ Confirme que usuário tem acesso (empresa correta)

### Thumbnail não aparece
- ✅ Backend suporta campo `thumbnail` (TEXT/LONGTEXT)?
- ✅ Tamanho do base64 pode ser grande (>1MB)

---

## 🔄 Fallback para LocalStorage

O sistema mantém fallback para localStorage:
- Se API falhar ao carregar, tenta localStorage
- Duplicação ainda usa localStorage (pode implementar endpoint depois)
- Útil para desenvolvimento offline

---

## 📋 Checklist de Integração

- [x] Criar `src/services/templateService.ts`
- [x] Criar `src/hooks/useTemplates.ts`
- [x] Atualizar `TemplatesPage.tsx` para usar API
- [x] Atualizar `Editor.tsx` para salvar na API
- [x] Criar `.env.example`
- [x] Configurar interceptor de autenticação
- [x] Implementar loading states
- [x] Implementar error handling
- [ ] Testar com backend rodando
- [ ] Testar permissões (MASTER, CLIENTE, COLABORADOR)
- [ ] Testar compartilhamento
- [ ] Remover localStorage (opcional - manter como fallback)

---

## 🎯 Próximos Passos

1. **Testar com Backend Real**
   - Executar migração no backend
   - Criar usuários de teste (MASTER, CLIENTE, COLABORADOR)
   - Testar todos os fluxos

2. **Melhorias de UX**
   - [ ] Toast notifications ao invés de alerts
   - [ ] Confirmação visual de salvamento
   - [ ] Progress bar ao salvar
   - [ ] Preview de thumbnail maior

3. **Funcionalidades Adicionais**
   - [ ] Filtro por categoria
   - [ ] Filtro por compartilhados
   - [ ] Ordenação (nome, data, etc)
   - [ ] Paginação (se muitos templates)
   - [ ] Endpoint de duplicar template
   - [ ] Versionamento de templates

4. **Otimizações**
   - [ ] Cache de templates (React Query?)
   - [ ] Debounce na busca
   - [ ] Lazy loading de thumbnails
   - [ ] Compressão de thumbnails

---

**Implementado por:** GitHub Copilot  
**Data:** 20/11/2025  
**Status:** ✅ Pronto para testes com backend
