# Development Tools for Stratix

This folder contains tools to facilitate Stratix development and testing.

## Available Tools

### Verdaccio - Local NPM Registry

Private npm registry for testing packages locally without publishing to the public registry.

**Location:** `verdaccio/`

**Quick usage:**
```bash
# Start Verdaccio
cd dev-tools/verdaccio
docker-compose up -d

# Publish all packages
./scripts/publish-all.sh

# View web interface
open http://localhost:4873
```

See [verdaccio/README.md](./verdaccio/README.md) for complete documentation.

## Contributing

If you create new development tools:

1. Create a folder with a descriptive name in `dev-tools/`
2. Include a README.md with clear instructions
3. Document necessary scripts and configurations
4. Update this README with the new tool

## Philosophy

Tools in this folder should:

- Be easy to use
- Be well documented
- Not require complex configuration
- Facilitate the development workflow
- Be optional (not required to use Stratix)
