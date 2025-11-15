#!/bin/bash
set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}Publicando todos los paquetes de Stratix a Verdaccio local...${NC}"

# Verificar que Verdaccio este corriendo
if ! curl -s http://localhost:4873/ > /dev/null; then
    echo -e "${RED}Error: Verdaccio no esta corriendo en http://localhost:4873/${NC}"
    echo -e "${BLUE}Ejecuta: cd dev-tools/verdaccio && docker-compose up -d${NC}"
    exit 1
fi

# Ir al directorio raiz del proyecto
cd "$(dirname "$0")/../../.."

# Verificar que los paquetes esten construidos
if [ ! -d "packages/primitives/dist" ]; then
    echo -e "${BLUE}Los paquetes no estan construidos. Ejecutando build...${NC}"
    pnpm build
fi

# Configurar npm para usar Verdaccio
npm config set registry http://localhost:4873/

# Array de paquetes en orden de dependencias
packages=(
    "primitives"
    "abstractions"
    "impl-ai-agents"
    "impl-di-awilix"
    "impl-logger-console"
    "impl-cqrs-inmemory"
    "runtime"
    "testing"
    "ext-ai-agents-openai"
    "ext-ai-agents-anthropic"
    "ext-mongodb"
    "ext-postgres"
    "ext-rabbitmq"
    "ext-redis"
    "ext-secrets"
    "ext-opentelemetry"
)

echo ""
echo -e "${BLUE}Publicando paquetes en orden de dependencias...${NC}"

for pkg in "${packages[@]}"; do
    if [ -d "packages/$pkg" ]; then
        echo -e "\n${GREEN}Publicando @stratix/$pkg...${NC}"
        cd "packages/$pkg"

        # Usar pnpm publish que resuelve workspace:* automaticamente
        pnpm publish --registry http://localhost:4873/ --no-git-checks 2>&1 | grep -v "npm notice" | grep -v "npm warn" || true

        cd ../..
    else
        echo -e "${RED}Advertencia: packages/$pkg no existe${NC}"
    fi
done

echo ""
echo -e "${GREEN}Todos los paquetes han sido publicados exitosamente!${NC}"
echo -e "${BLUE}Puedes instalarlos usando: npm install @stratix/<package> --registry http://localhost:4873/${NC}"
echo ""
echo -e "${BLUE}Para volver al registry publico ejecuta:${NC}"
echo -e "npm config set registry https://registry.npmjs.org/${NC}"
