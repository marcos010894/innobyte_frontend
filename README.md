# Innobyte - Sistema de Etiquetas 🏷️

Sistema moderno e escalável para emissão e gerenciamento de etiquetas com integração API.

## 🚀 Tecnologias

-## 📝 Licença

Este projeto está sob a licença MIT.

---

## 🚀 Deploy no Fly.io

Este projeto está configurado para deploy no **Fly.io** com otimizações de produção!

### 📚 Guias de Deploy

- **[DEPLOY-SUMMARY.md](./DEPLOY-SUMMARY.md)** - 📋 Resumo completo de tudo
- **[DEPLOY-QUICKSTART.md](./DEPLOY-QUICKSTART.md)** - ⚡ Guia rápido (5 minutos)
- **[DEPLOY.md](./DEPLOY.md)** - 📖 Documentação detalhada
- **[DEPLOY-CHECKLIST.md](./DEPLOY-CHECKLIST.md)** - ✅ Checklist de deploy
- **[DEPLOY-FILES.md](./DEPLOY-FILES.md)** - 📦 Lista de arquivos

### 🎯 Deploy Rápido

```bash
# 1. Instalar Fly.io CLI
brew install flyctl
flyctl auth login

# 2. Configurar backend URL (.env.production)
VITE_API_URL=https://seu-backend.fly.dev/api

# 3. Verificar configuração
./pre-deploy-check.sh

# 4. Deploy!
./deploy.sh
```

### 📊 Comandos Úteis

```bash
flyctl deploy        # Deploy
flyctl logs          # Ver logs
flyctl open          # Abrir app
flyctl status        # Ver status
```

### ✨ Otimizações Incluídas

- ✅ Build multi-stage otimizado (~25MB)
- ✅ Compressão gzip automática
- ✅ Cache de assets (1 ano)
- ✅ Headers de segurança
- ✅ Health checks
- ✅ Auto sleep/wake (grátis!)
- ✅ SSL automático

**Para mais detalhes, veja [DEPLOY-SUMMARY.md](./DEPLOY-SUMMARY.md)** 🎉

---

**Desenvolvido por Innobyte** 🚀eact 18.3.1** - Biblioteca UI
- **TypeScript 5.6.3** - Tipagem estática
- **Vite 5.4.9** - Build tool moderna e rápida
- **Tailwind CSS 3.4.14** - Framework CSS utility-first
- **React Router DOM 6.27.0** - Roteamento
- **Chart.js 4.4.1** - Gráficos e visualizações
- **Zustand 5.0.1** - Gerenciamento de estado
- **Axios 1.7.7** - Cliente HTTP
- **Date-fns 4.1.0** - Manipulação de datas

## 📁 Estrutura do Projeto

```
frontend/
├── src/
│   ├── components/          # Componentes reutilizáveis
│   │   ├── layout/         # Layout (Sidebar, Header)
│   │   └── dashboard/      # Componentes do Dashboard
│   ├── pages/              # Páginas da aplicação
│   ├── hooks/              # Custom hooks
│   ├── services/           # Serviços e APIs
│   ├── store/              # Gerenciamento de estado
│   ├── types/              # Tipos TypeScript
│   ├── utils/              # Funções utilitárias
│   ├── assets/             # Imagens, fontes, etc
│   ├── App.tsx             # Componente principal
│   ├── main.tsx            # Entry point
│   └── index.css           # Estilos globais
├── public/                 # Arquivos estáticos
├── index.html              # HTML template
├── package.json            # Dependências (versões fixas)
├── tsconfig.json           # Config TypeScript
├── vite.config.ts          # Config Vite
├── tailwind.config.js      # Config Tailwind
└── postcss.config.js       # Config PostCSS
```

## 🎯 Funcionalidades Implementadas

### ✅ Dashboard Completo
- Cards de estatísticas em tempo real
- Gráfico de etiquetas impressas por tipo
- Pré-visualização de modelos
- Lista de modelos de etiquetas
- Atividade recente
- Status de impressoras
- Status de integração com API

### ✅ Layout Responsivo
- Sidebar com navegação completa
- Header com busca e perfil de usuário
- Sistema de rotas implementado
- Animações e transições suaves

### 🔜 Páginas Preparadas para Desenvolvimento
- Editor de Modelos
- Impressão
- Integração API
- Modelos Salvos
- Histórico
- Configurações
- Perfil

## 🛠️ Instalação

### Pré-requisitos
- Node.js 20.x ou superior
- npm ou yarn

### Passo a passo

1. **Clone o repositório** (se aplicável)
```bash
cd /Users/marcospaulomachadoazevedo/Documents/etiquetas-sys/frontend
```

2. **Ative o Node.js 20 com nvm**
```bash
nvm use 20
```

3. **Instale as dependências**
```bash
npm install
```

4. **Inicie o servidor de desenvolvimento**
```bash
npm run dev
```

5. **Acesse no navegador**
```
http://localhost:3000
```

## 📦 Scripts Disponíveis

```bash
npm run dev      # Inicia servidor de desenvolvimento
npm run build    # Build para produção
npm run preview  # Preview do build de produção
npm run lint     # Executa o linter
```

## 🎨 Tema de Cores

```javascript
primary: '#3B82F6'    // Azul
secondary: '#1E293B'  // Cinza escuro
accent: '#F59E0B'     // Laranja
success: '#10B981'    // Verde
```

## 📝 Próximos Passos

### Backend
- [ ] API REST com Node.js/Express ou NestJS
- [ ] Banco de dados (PostgreSQL/MongoDB)
- [ ] Autenticação JWT
- [ ] Integração com ERPs (eGestor, etc)
- [ ] Geração de códigos de barras
- [ ] Sistema de templates ZPL/PPLA

### Frontend
- [ ] Implementar Editor de Modelos drag-and-drop
- [ ] Sistema de impressão com integração de impressoras
- [ ] Gerenciamento de usuários
- [ ] Histórico com filtros e paginação
- [ ] Testes unitários e E2E
- [ ] PWA (Progressive Web App)

### DevOps
- [ ] Docker e Docker Compose
- [ ] CI/CD com GitHub Actions
- [ ] Deploy na nuvem (AWS/Azure/Vercel)

## 🤝 Contribuindo

1. Crie uma branch para sua feature (`git checkout -b feature/nova-feature`)
2. Commit suas mudanças (`git commit -m 'Add nova feature'`)
3. Push para a branch (`git push origin feature/nova-feature`)
4. Abra um Pull Request

## 📄 Licença

Este projeto é proprietário da Innobyte.

## 👨‍💻 Desenvolvedor

Desenvolvido com ❤️ por Marcos Paulo Machado Azevedo

---

**Nota Importante sobre Dependências:**
Este projeto usa versões FIXAS (sem ^ ou ~) no package.json para garantir que todos os desenvolvedores instalem exatamente as mesmas versões das dependências. Isso evita problemas de "funciona na minha máquina mas não na sua".
