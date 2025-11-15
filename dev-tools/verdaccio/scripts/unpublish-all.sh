#!/bin/bash
set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Despublicando todos los paquetes de Stratix de Verdaccio local...${NC}"

# Verificar que Verdaccio este corriendo
if ! curl -s http://localhost:4873/ > /dev/null; then
    echo -e "${RED}Error: Verdaccio no esta corriendo en http://localhost:4873/${NC}"
    echo -e "${BLUE}Ejecuta: cd dev-tools/verdaccio && docker-compose up -d${NC}"
    exit 1
fi

# Ir al directorio raiz del proyecto
cd "$(dirname "$0")/../../.."

# Configurar npm para usar Verdaccio
npm config set registry http://localhost:4873/

# Array de paquetes
packages=(
    "primitives"
    "abstractions"
    "impl-ai-agents"
    "impl-di-awilix"
    "impl-logger-console"
    "runtime"
    "ext-ai-agents-openai"
    "ext-ai-agents-anthropic"
    "ext-ai-agents-google"
    "testing"
    "cli"
    "ext-amqp"
    "ext-postgres"
    "ext-redis"
    "ext-otel"
    "ext-secrets"
    "impl-cqrs-inmemory"
)

echo ""
echo -e "${BLUE}Despublicando paquetes...${NC}"

for pkg in "${packages[@]}"; do
    if [ -f "packages/$pkg/package.json" ]; then
        echo -e "\n${GREEN}Despublicando @stratix/$pkg...${NC}"

        # Obtener la version del package.json
        version=$(node -p "require('./packages/$pkg/package.json').version")

        # Despublicar
        npm unpublish "@stratix/$pkg@$version" --registry http://localhost:4873/ --force 2>&1 | grep -v "npm notice" || true
    fi
done

echo ""
echo -e "${GREEN}Todos los paquetes han sido despublicados!${NC}"
echo -e "${BLUE}Ahora puedes publicar nuevamente con: ./dev-tools/verdaccio/scripts/publish-all.sh${NC}"
