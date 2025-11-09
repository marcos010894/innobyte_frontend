#!/bin/bash

# 🚀 Script de Deploy para Fly.io
# Uso: ./deploy.sh

set -e

echo "🔍 Verificando pré-requisitos..."

# Verificar se flyctl está instalado
if ! command -v flyctl &> /dev/null; then
    echo "❌ Fly.io CLI não está instalado!"
    echo "📦 Instale com: brew install flyctl"
    echo "Ou visite: https://fly.io/docs/hands-on/install-flyctl/"
    exit 1
fi

# Verificar se está logado
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ Você não está logado no Fly.io!"
    echo "🔑 Execute: flyctl auth login"
    exit 1
fi

echo "✅ Pré-requisitos OK!"
echo ""
echo "🏗️  Iniciando deploy do frontend..."
echo ""

# Perguntar se quer fazer build local primeiro
read -p "🔨 Deseja testar o build localmente antes? (s/N): " test_build

if [[ $test_build =~ ^[Ss]$ ]]; then
    echo "🔨 Fazendo build local..."
    npm run build
    echo "✅ Build local concluído!"
    echo ""
fi

# Fazer deploy
echo "🚀 Fazendo deploy no Fly.io..."
flyctl deploy --verbose

echo ""
echo "✅ Deploy concluído com sucesso!"
echo ""
echo "🌐 Sua aplicação está disponível em:"
flyctl status --json | grep -o '"hostname":"[^"]*"' | cut -d'"' -f4
echo ""
echo "📊 Ver logs: flyctl logs"
echo "🔍 Ver status: flyctl status"
echo "🌍 Abrir no browser: flyctl open"
