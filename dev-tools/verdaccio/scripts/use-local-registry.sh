#!/bin/bash

# Colores
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}Configurando npm para usar Verdaccio local...${NC}"

# Guardar el registry actual
CURRENT_REGISTRY=$(npm config get registry)
echo -e "${YELLOW}Registry actual: ${CURRENT_REGISTRY}${NC}"

# Configurar Verdaccio como registry
npm config set registry http://localhost:4873/

echo -e "${GREEN}Registry configurado a: http://localhost:4873/${NC}"
echo ""
echo -e "${BLUE}Ahora todos los comandos npm usarán Verdaccio como registry.${NC}"
echo ""
echo -e "${YELLOW}Características:${NC}"
echo "  - Paquetes @stratix/* se sirven desde Verdaccio local"
echo "  - Todos los demás paquetes se obtienen de npm y se cachean localmente"
echo "  - Instalaciones más rápidas para paquetes ya cacheados"
echo ""
echo -e "${BLUE}Para volver al registry público:${NC}"
echo "  npm config set registry https://registry.npmjs.org/"
echo ""
echo -e "${BLUE}O ejecuta:${NC}"
echo "  ./scripts/use-public-registry.sh"
