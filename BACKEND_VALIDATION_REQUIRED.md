# ⚠️ VALIDAÇÃO CRÍTICA NECESSÁRIA NO BACKEND

## 🔴 PROBLEMA IDENTIFICADO

Cliente conseguiu criar template como "compartilhado" quando deveria ser bloqueado.

## 🛡️ VALIDAÇÕES QUE O BACKEND DEVE TER

### 1. **Criação de Template** (`POST /api/templates/`)

```python
# Pseudo-código Python/FastAPI
@router.post("/")
async def create_template(template: TemplateCreate, current_user: User):
    # VALIDAÇÃO CRÍTICA
    if template.compartilhado and current_user.tipo != "master":
        raise HTTPException(
            status_code=403,
            detail="Apenas administradores master podem criar templates compartilhados"
        )
    
    # Se não for master, forçar compartilhado = False
    if current_user.tipo != "master":
        template.compartilhado = False
    
    # Continuar com a criação...
```

### 2. **Atualização de Template** (`PUT /api/templates/{id}`)

```python
@router.put("/{template_id}")
async def update_template(
    template_id: str, 
    updates: TemplateUpdate, 
    current_user: User
):
    # Buscar template existente
    existing_template = await get_template(template_id)
    
    # Verificar se usuário é dono
    if existing_template.usuario_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Você não tem permissão para editar este template"
        )
    
    # VALIDAÇÃO CRÍTICA - Compartilhamento
    if updates.compartilhado and current_user.tipo != "master":
        raise HTTPException(
            status_code=403,
            detail="Apenas administradores master podem compartilhar templates"
        )
    
    # Se não for master, manter ou forçar compartilhado = False
    if current_user.tipo != "master":
        updates.compartilhado = False
    
    # Continuar com a atualização...
```

### 3. **Listagem de Templates** (`GET /api/templates/`)

```python
@router.get("/")
async def list_templates(current_user: User):
    if current_user.tipo == "master":
        # Master vê TODOS os templates
        templates = await get_all_templates()
    else:
        # Cliente/Colaborador vê:
        # 1. Seus próprios templates
        # 2. Templates compartilhados (compartilhado=True)
        templates = await get_templates_where(
            or_(
                Template.usuario_id == current_user.id,
                Template.compartilhado == True
            )
        )
    
    return templates
```

## 🔍 CHECKLIST DE VALIDAÇÃO

- [ ] **Criar template**: Bloquear `compartilhado=True` se não for master
- [ ] **Atualizar template**: Bloquear mudança para `compartilhado=True` se não for master
- [ ] **Listagem**: Cliente só vê seus próprios + compartilhados
- [ ] **Edição**: Cliente só pode editar templates que criou
- [ ] **Deleção**: Cliente só pode deletar templates que criou
- [ ] **Compartilhar**: Master pode compartilhar templates de qualquer usuário
- [ ] **Descompartilhar**: Master pode descompartilhar qualquer template

## 🎯 REGRAS DE NEGÓCIO

| Ação | Master | Cliente | Colaborador |
|------|--------|---------|-------------|
| Criar template privado | ✅ | ✅ | ✅ |
| Criar template compartilhado | ✅ | ❌ | ❌ |
| Ver templates próprios | ✅ | ✅ | ✅ |
| Ver templates compartilhados | ✅ | ✅ | ✅ |
| Ver templates de outros | ✅ | ❌ | ❌ |
| Editar template próprio | ✅ | ✅ | ✅ |
| Editar template de outros | ✅ | ❌ | ❌ |
| Compartilhar template próprio | ✅ | ❌ | ❌ |
| Compartilhar template de outros | ✅ | ❌ | ❌ |
| Deletar template próprio | ✅ | ✅ | ✅ |
| Deletar template de outros | ✅ | ❌ | ❌ |

## 🧪 TESTES PARA FAZER

### Teste 1: Cliente tenta criar template compartilhado
```bash
# Request
POST /api/templates/
Authorization: Bearer <token_cliente>
{
  "nome": "Template Teste",
  "compartilhado": true  # ← DEVE SER BLOQUEADO
}

# Response Esperado
HTTP 403 Forbidden
{
  "detail": "Apenas administradores master podem criar templates compartilhados"
}
```

### Teste 2: Cliente tenta editar template de outro cliente
```bash
# Request
PUT /api/templates/abc123
Authorization: Bearer <token_cliente_A>
# Template pertence ao cliente_B

# Response Esperado
HTTP 403 Forbidden
{
  "detail": "Você não tem permissão para editar este template"
}
```

### Teste 3: Cliente lista templates
```bash
# Request
GET /api/templates/
Authorization: Bearer <token_cliente>

# Response Esperado
# Deve retornar:
# - Templates criados por este cliente
# - Templates com compartilhado=True (de qualquer usuário)
# NÃO deve retornar:
# - Templates privados de outros clientes
```

## 📝 MODELO DE DADOS ESPERADO

```python
class Template(Base):
    id: UUID
    nome: str
    descricao: Optional[str]
    usuario_id: UUID  # Quem criou o template
    compartilhado: bool = False  # Apenas master pode True
    config: JSON
    elements: JSON
    thumbnail: Optional[str]
    created_at: datetime
    updated_at: datetime
    
    # Relacionamento
    usuario: User = relationship("User", back_populates="templates")
```

## 🚨 AÇÕES IMEDIATAS

1. **Verificar banco de dados**: Identificar templates de clientes com `compartilhado=True`
2. **Corrigir dados**: Atualizar para `compartilhado=False` onde necessário
3. **Implementar validações**: Adicionar as validações acima no backend
4. **Testar**: Executar os testes sugeridos
5. **Deploy**: Aplicar as correções em produção

## 📧 CONTATO

Se precisar de ajuda para implementar as validações no backend, avise!
