#!/bin/bash

# 🔍 Script de Verificação Pré-Deploy
# Uso: ./pre-deploy-check.sh

set -e

echo "🔍 Verificando configuração antes do deploy..."
echo ""

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

errors=0
warnings=0

# Função de verificação
check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅${NC} $2"
    else
        echo -e "${RED}❌${NC} $2"
        ((errors++))
    fi
}

warn() {
    echo -e "${YELLOW}⚠️${NC}  $1"
    ((warnings++))
}

# 1. Verificar Node.js
echo "📦 Verificando dependências..."
if command -v node &> /dev/null; then
    check 0 "Node.js instalado ($(node -v))"
else
    check 1 "Node.js não encontrado"
fi

# 2. Verificar npm
if command -v npm &> /dev/null; then
    check 0 "npm instalado ($(npm -v))"
else
    check 1 "npm não encontrado"
fi

# 3. Verificar Fly.io CLI
if command -v flyctl &> /dev/null; then
    check 0 "Fly.io CLI instalado ($(flyctl version))"
else
    check 1 "Fly.io CLI não instalado - Execute: brew install flyctl"
fi

# 4. Verificar login Fly.io
if flyctl auth whoami &> /dev/null; then
    check 0 "Logado no Fly.io ($(flyctl auth whoami 2>&1))"
else
    check 1 "Não está logado no Fly.io - Execute: flyctl auth login"
fi

echo ""
echo "📁 Verificando arquivos de configuração..."

# 5. Verificar arquivos essenciais
[ -f "fly.toml" ] && check 0 "fly.toml existe" || check 1 "fly.toml não encontrado"
[ -f "Dockerfile" ] && check 0 "Dockerfile existe" || check 1 "Dockerfile não encontrado"
[ -f "nginx.conf" ] && check 0 "nginx.conf existe" || check 1 "nginx.conf não encontrado"
[ -f ".dockerignore" ] && check 0 ".dockerignore existe" || check 1 ".dockerignore não encontrado"
[ -f ".env.production" ] && check 0 ".env.production existe" || check 1 ".env.production não encontrado"
[ -f "package.json" ] && check 0 "package.json existe" || check 1 "package.json não encontrado"

echo ""
echo "⚙️  Verificando configurações..."

# 6. Verificar .env.production
if [ -f ".env.production" ]; then
    if grep -q "VITE_API_URL" .env.production; then
        api_url=$(grep "VITE_API_URL" .env.production | cut -d'=' -f2)
        if [[ "$api_url" == *"localhost"* ]]; then
            warn ".env.production contém localhost - Altere para URL de produção!"
        else
            check 0 "VITE_API_URL configurado: $api_url"
        fi
    else
        check 1 "VITE_API_URL não encontrado em .env.production"
    fi
fi

# 7. Verificar package.json scripts
if [ -f "package.json" ]; then
    if grep -q '"build"' package.json; then
        check 0 "Script de build existe em package.json"
    else
        check 1 "Script de build não encontrado em package.json"
    fi
fi

# 8. Verificar fly.toml
if [ -f "fly.toml" ]; then
    if grep -q "app = " fly.toml; then
        app_name=$(grep "app = " fly.toml | cut -d'"' -f2)
        check 0 "Nome da app configurado: $app_name"
    else
        check 1 "Nome da app não configurado em fly.toml"
    fi
fi

echo ""
echo "🧪 Testes opcionais..."

# 9. Testar build local
read -p "🔨 Deseja testar o build local? (s/N): " test_build
if [[ $test_build =~ ^[Ss]$ ]]; then
    echo "🔨 Testando build..."
    if npm run build; then
        check 0 "Build local executou com sucesso"
    else
        check 1 "Build local falhou"
    fi
fi

# 10. Verificar node_modules
if [ -d "node_modules" ]; then
    warn "node_modules existe (normal, mas aumenta tempo de build)"
else
    echo -e "${GREEN}✅${NC} node_modules não existe (build será mais rápido)"
fi

# Resumo final
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 RESUMO"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [ $errors -eq 0 ] && [ $warnings -eq 0 ]; then
    echo -e "${GREEN}✅ Tudo pronto para deploy!${NC}"
    echo ""
    echo "Execute: ./deploy.sh ou flyctl deploy"
elif [ $errors -eq 0 ]; then
    echo -e "${YELLOW}⚠️  $warnings avisos encontrados${NC}"
    echo "Você pode prosseguir, mas revise os avisos acima."
else
    echo -e "${RED}❌ $errors erros encontrados${NC}"
    [ $warnings -gt 0 ] && echo -e "${YELLOW}⚠️  $warnings avisos encontrados${NC}"
    echo ""
    echo "Corrija os erros antes de fazer deploy!"
    exit 1
fi

echo ""
