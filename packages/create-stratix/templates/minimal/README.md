# Stratix Minimal Application

A minimal Stratix application with clean architecture foundation.

## Getting Started

Install dependencies:

```bash
pnpm install
```

Start development server:

```bash
pnpm run dev
```

## Project Structure

```
src/
├── domain/           # Domain layer (entities, value objects, repositories)
├── application/      # Application layer (use cases, commands, queries)
└── infrastructure/   # Infrastructure layer (persistence, http, external services)
```

## Available Scripts

- `pnpm run dev` - Start development server with hot reload
- `pnpm run build` - Build for production
- `pnpm start` - Start production server
- `pnpm test` - Run tests
- `pnpm run typecheck` - Type check without emitting
- `pnpm run lint` - Lint code
- `pnpm run format` - Format code

## Next Steps

1. Create your domain entities in `src/domain/entities/`
2. Define repositories in `src/domain/repositories/`
3. Implement commands and queries in `src/application/`
4. Add infrastructure implementations in `src/infrastructure/`

## Learn More

- [Stratix Documentation](https://stratix.dev/docs)
- [Domain-Driven Design](https://stratix.dev/docs/architecture/ddd)
- [Hexagonal Architecture](https://stratix.dev/docs/architecture/hexagonal)
