---
sidebar_position: 2
title: new Command
description: Create new Stratix projects
---

# new Command

Create a new Stratix project with the `new` command.

## Usage

```bash
stratix new <project-name> [options]
```

## Interactive Mode

```bash
stratix new
```

You'll be prompted for:
- Project name
- Project template (DDD, Modular, Minimal)
- Package manager (npm, pnpm, yarn)
- Install dependencies (yes/no)

## Non-Interactive Mode

```bash
stratix new my-app --template ddd --pm pnpm --skip-install
```

## Options

| Option | Alias | Description | Default |
|--------|-------|-------------|---------|
| `--template` | `-t` | Project template | `ddd` |
| `--package-manager` | `--pm` | Package manager | `npm` |
| `--skip-install` | | Skip dependency installation | `false` |
| `--skip-git` | | Skip git initialization | `false` |
| `--directory` | `-d` | Target directory | `<project-name>` |

## Templates

### DDD Template (Default)

Domain-Driven Design structure:

```bash
stratix new my-app --template ddd
```

**Structure:**
```
my-app/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   ├── value-objects/
│   │   └── services/
│   ├── application/
│   │   ├── commands/
│   │   └── queries/
│   ├── infrastructure/
│   │   ├── persistence/
│   │   └── http/
│   └── main.ts
├── tests/
├── package.json
└── tsconfig.json
```

### Modular Template

Bounded contexts for microservices:

```bash
stratix new my-app --template modular
```

**Structure:**
```
my-app/
├── src/
│   ├── contexts/
│   │   ├── products/
│   │   │   ├── domain/
│   │   │   ├── application/
│   │   │   └── infrastructure/
│   │   └── orders/
│   │       ├── domain/
│   │       ├── application/
│   │       └── infrastructure/
│   └── main.ts
├── tests/
├── package.json
└── tsconfig.json
```

### Minimal Template

Bare-bones setup:

```bash
stratix new my-app --template minimal
```

**Structure:**
```
my-app/
├── src/
│   └── main.ts
├── package.json
└── tsconfig.json
```

## Examples

### Create with pnpm

```bash
stratix new my-app --pm pnpm
```

### Create without installing

```bash
stratix new my-app --skip-install
cd my-app
pnpm install
```

### Create in specific directory

```bash
stratix new my-app --directory ./projects/my-app
```

### Create modular project

```bash
stratix new my-microservices --template modular
```

## What Gets Created

### Files

- `package.json` - Project metadata and dependencies
- `tsconfig.json` - TypeScript configuration
- `.eslintrc.js` - ESLint configuration
- `.prettierrc` - Prettier configuration
- `.gitignore` - Git ignore rules
- `README.md` - Project documentation
- `src/main.ts` - Application entry point

### Dependencies

**Core:**
- `@stratix/core` - Core framework
- `@stratix/runtime` - Application runtime

**Dev Dependencies:**
- `typescript` - TypeScript compiler
- `@types/node` - Node.js type definitions
- `eslint` - Linting
- `prettier` - Code formatting
- `jest` - Testing framework

## Post-Creation Steps

After creating a project:

```bash
cd my-app

# Install dependencies (if skipped)
npm install

# Add extensions
stratix add @stratix/http-fastify
stratix add @stratix/postgres

# Generate code
stratix generate entity Product

# Build
npm run build

# Run
npm start
```

## Best Practices

### 1. Use DDD Template for Most Projects

```bash
stratix new my-app --template ddd
```

### 2. Use Modular for Microservices

```bash
stratix new my-services --template modular
```

### 3. Choose Package Manager Wisely

```bash
# pnpm - Fast, efficient
stratix new my-app --pm pnpm

# npm - Standard
stratix new my-app --pm npm

# yarn - Alternative
stratix new my-app --pm yarn
```

### 4. Skip Install in CI/CD

```bash
stratix new my-app --skip-install
```

## Next Steps

- **[generate Commands](./generate-commands)** - Generate code
- **[add Command](./add-command)** - Add extensions
- **[Project Structure](../getting-started/project-structure)** - Understand structure
