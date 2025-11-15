#!/bin/bash
set -e

# Colores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}Estas a punto de resetear completamente Verdaccio.${NC}"
echo -e "${YELLOW}Esto eliminara todos los paquetes publicados y la base de datos.${NC}"
echo ""
read -p "Continuar? (y/N): " -n 1 -r
echo

if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${BLUE}Operacion cancelada.${NC}"
    exit 0
fi

# Ir al directorio de verdaccio
cd "$(dirname "$0")/.."

echo -e "${BLUE}Deteniendo Verdaccio...${NC}"
docker-compose down

echo -e "${BLUE}Eliminando storage...${NC}"
rm -rf storage

echo -e "${BLUE}Iniciando Verdaccio limpio...${NC}"
docker-compose up -d

echo ""
echo -e "${GREEN}Verdaccio ha sido reseteado exitosamente!${NC}"
echo -e "${BLUE}Puedes publicar paquetes con: ./scripts/publish-all.sh${NC}"
