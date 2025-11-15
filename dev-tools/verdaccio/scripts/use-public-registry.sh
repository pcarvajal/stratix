#!/bin/bash

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Restaurando npm al registry público...${NC}"

# Guardar el registry actual
CURRENT_REGISTRY=$(npm config get registry)
echo -e "${YELLOW}Registry actual: ${CURRENT_REGISTRY}${NC}"

# Configurar registry público
npm config set registry https://registry.npmjs.org/

echo -e "${GREEN}Registry configurado a: https://registry.npmjs.org/${NC}"
echo ""
echo -e "${BLUE}Ahora todos los comandos npm usarán el registry público de npm.${NC}"
echo ""
echo -e "${BLUE}Para volver a usar Verdaccio local:${NC}"
echo "  ./scripts/use-local-registry.sh"
