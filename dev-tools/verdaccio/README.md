# Verdaccio - Private NPM Registry & Proxy

Verdaccio configurado como registry privado para paquetes `@stratix/*` y proxy del registry público de npm.

## Características

- **Registry privado** para paquetes `@stratix/*`
- **Proxy automático** del registry público de npm
- **Caché local** de paquetes públicos para instalaciones más rápidas
- **Sin autenticación** requerida para desarrollo local
- **Interfaz web** en http://localhost:4873/

## Prerequisites

- Docker and Docker Compose installed
- Port 4873 available

## Quick Start

### 1. Start Verdaccio

```bash
cd dev-tools/verdaccio
docker-compose up -d
```

Verdaccio will be available at: http://localhost:4873

### 2. Build the Packages

From the project root:

```bash
pnpm build
```

### 3. Publish All Packages

```bash
./dev-tools/verdaccio/scripts/publish-all.sh
```

This script:
- Verifies that Verdaccio is running
- Configures npm to use the local registry
- Publishes all packages in dependency order
- Does not require changing versions in package.json

### 4. Use the Packages

In your test project:

```bash
# Configure local registry
npm config set registry http://localhost:4873/

# Install packages
npm install @stratix/primitives
npm install @stratix/runtime
# etc...
```

Or create an `.npmrc` in your project:

```
registry=http://localhost:4873/
```

## Cómo Funciona el Proxy

La configuración en `config.yaml` define:

```yaml
uplinks:
  npmjs:
    url: https://registry.npmjs.org/
    timeout: 30s
    max_fails: 5
    fail_timeout: 10m

packages:
  '@stratix/*':
    access: $all
    publish: $all
    # NO tiene proxy - se sirven desde Verdaccio local

  '@*/*':
    access: $all
    proxy: npmjs  # ← Proxy a npm público

  '**':
    access: $all
    proxy: npmjs  # ← Proxy a npm público
```

### Flujo de instalación:

1. **Paquetes `@stratix/*`**:
   - Se buscan primero en Verdaccio local
   - Si no existen, retorna error (no se buscan en npm público)

2. **Paquetes scoped `@*/*` (ej: @types/node, @rollup/plugin-node-resolve)**:
   - Se buscan primero en el caché local de Verdaccio
   - Si no están cacheados, se descargan de npm público
   - Se cachean localmente para futuras instalaciones

3. **Todos los demás paquetes (ej: express, lodash)**:
   - Se buscan primero en el caché local de Verdaccio
   - Si no están cacheados, se descargan de npm público
   - Se cachean localmente para futuras instalaciones
   - Siguientes instalaciones son mucho más rápidas

### Ventajas del Proxy:

- **Instalaciones más rápidas**: Paquetes cacheados localmente
- **Desarrollo offline**: Paquetes previamente instalados disponibles sin internet
- **Pruebas de publicación**: Publica y prueba sin afectar npm público
- **Control de versiones**: Puedes probar diferentes versiones localmente

## Recommended Workflow

### Configurar npm para usar Verdaccio

```bash
# Opción 1: Usar script
./dev-tools/verdaccio/scripts/use-local-registry.sh

# Opción 2: Manual
npm config set registry http://localhost:4873/
```

### Publishing a New Version

When you make changes to the packages:

```bash
# 1. Build the changes
pnpm build

# 2. Limpiar paquetes @stratix del storage
rm -rf dev-tools/verdaccio/storage/@stratix

# 3. Publish again
./dev-tools/verdaccio/scripts/publish-all.sh
```

This way you don't need to constantly change versions in package.json during development.

### Volver al registry público

```bash
# Opción 1: Usar script
./dev-tools/verdaccio/scripts/use-public-registry.sh

# Opción 2: Manual
npm config set registry https://registry.npmjs.org/
```

### Complete Reset

If you need to start from scratch:

```bash
docker-compose down
rm -rf storage
docker-compose up -d
./dev-tools/verdaccio/scripts/publish-all.sh
```

This completely removes the storage and restarts Verdaccio clean.

## Available Scripts

### `scripts/publish-all.sh`

Publishes all Stratix packages to Verdaccio in the correct dependency order.

**Usage:**
```bash
./dev-tools/verdaccio/scripts/publish-all.sh
```

**What it does:**
- Verifies that Verdaccio is running
- Builds packages if they are not built
- Configures npm to use the local registry
- Publishes each package in dependency order

### `scripts/unpublish-all.sh`

Unpublishes all Stratix packages from Verdaccio.

**Usage:**
```bash
./dev-tools/verdaccio/scripts/unpublish-all.sh
```

**What it does:**
- Reads the version of each package from package.json
- Unpublishes each version from the local registry
- Allows republishing without version conflicts

### `scripts/reset.sh`

Completely resets Verdaccio by removing all storage.

**Usage:**
```bash
./dev-tools/verdaccio/scripts/reset.sh
```

**What it does:**
- Stops the Docker container
- Removes the storage/ folder
- Restarts Verdaccio clean

## Useful Docker Compose Commands

```bash
# Start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down

# Restart
docker-compose restart

# View status
docker-compose ps
```

## Web Interface

Verdaccio includes a web interface to view published packages:

http://localhost:4873

## Return to Public Registry

When you finish testing:

```bash
npm config set registry https://registry.npmjs.org/
```

Or delete the local configuration:

```bash
npm config delete registry
```

## Configuration

Verdaccio configuration is in `config.yaml`. By default:

- Allows publishing/unpublishing without authentication (local development)
- Allows overwriting versions
- Proxies to npmjs.org for external dependencies
- Local storage in `./storage`

## Troubleshooting

### Port 4873 is already in use

```bash
# Check which process is using the port
lsof -i :4873

# Stop Verdaccio if it's running
docker-compose down
```

### Cannot publish

Verify that:
1. Verdaccio is running: `curl http://localhost:4873/`
2. Packages are built: `ls packages/*/dist`
3. npm is configured to use Verdaccio: `npm config get registry`

### Dependency errors when publishing

Packages must be published in dependency order. The `publish-all.sh` script already publishes them in the correct order.

## Advantages of Using Verdaccio

1. **No need to change versions**: You can unpublish and republish the same version
2. **Fast testing**: Test changes without waiting for npm publication
3. **No public registry pollution**: Don't publish test versions
4. **Offline**: Works without internet connection (except for external dependencies)
5. **Identical to real flow**: Test the real npm installation process

## CI/CD Integration

You can use Verdaccio in CI pipelines to test package installation before publishing:

```yaml
# Example GitHub Actions
- name: Start Verdaccio
  run: |
    cd dev-tools/verdaccio
    docker-compose up -d

- name: Publish to Verdaccio
  run: ./dev-tools/verdaccio/scripts/publish-all.sh

- name: Test Installation
  run: |
    mkdir test-install && cd test-install
    npm init -y
    npm config set registry http://localhost:4873/
    npm install @stratix/runtime
```

## License

MIT - See LICENSE in the project root.
