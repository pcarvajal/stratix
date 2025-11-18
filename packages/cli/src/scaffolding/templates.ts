export interface ProjectTemplateData {
  projectName: string;
  packageManager: string;
}

export const packageJsonTemplate = (data: ProjectTemplateData): string => `{
  "name": "${data.projectName}",
  "version": "0.1.0",
  "type": "module",
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "test": "vitest",
    "typecheck": "tsc --noEmit",
    "lint": "eslint src",
    "format": "prettier --write \\"src/**/*.ts\\""
  },
  "dependencies": {
    "@stratix/primitives": "^0.1.5",
    "@stratix/abstractions": "^0.1.5",
    "@stratix/runtime": "^0.1.5",
    "@stratix/impl-di-awilix": "^0.1.5",
    "@stratix/impl-logger-console": "^0.1.5",
    "@stratix/impl-cqrs-inmemory": "^0.1.5"
  },
  "devDependencies": {
    "@stratix/cli": "^0.1.5",
    "@types/node": "^20.0.0",
    "typescript": "^5.7.2",
    "tsx": "^4.19.2",
    "vitest": "^1.6.1",
    "eslint": "^9.18.0",
    "prettier": "^3.4.2"
  }
}
`;

export const tsconfigTemplate = (): string => `{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "isolatedModules": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "allowSyntheticDefaultImports": true
  },
  "include": ["src"],
  "exclude": ["node_modules", "dist"]
}
`;

export const indexTemplate = (data: ProjectTemplateData): string => `import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';

async function bootstrap() {
  const container = new AwilixContainer();
  const logger = new ConsoleLogger();

  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)
    .build();

  await app.start();
  logger.info('${data.projectName} is running');

  process.on('SIGINT', async () => {
    logger.info('Shutting down...');
    await app.stop();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
`;

export const stratixConfigTemplate = (): string => `import { defineConfig } from '@stratix/cli';

export default defineConfig({
  structure: {
    type: 'ddd',
    sourceRoot: 'src',
    domainPath: 'src/domain',
    applicationPath: 'src/application',
    infrastructurePath: 'src/infrastructure',
  },
  generators: {
    context: {
      path: 'src/contexts',
      withTests: false,
    },
    entity: {
      path: 'src/domain/entities',
      aggregate: true,
      withTests: false,
    },
    valueObject: {
      path: 'src/domain/value-objects',
      withValidation: false,
      withTests: false,
    },
    command: {
      path: 'src/application/commands',
      withHandler: true,
      withTests: false,
    },
    query: {
      path: 'src/application/queries',
      withHandler: true,
      withTests: false,
    },
  },
});
`;

export const gitignoreTemplate = (): string => `# Dependencies
node_modules/
pnpm-lock.yaml
yarn.lock
package-lock.json

# Build outputs
dist/
build/
*.tsbuildinfo

# Environment
.env
.env.local
.env.*.local

# IDE
.vscode/
.idea/
*.swp
*.swo
*~

# OS
.DS_Store
Thumbs.db

# Logs
*.log
logs/

# Testing
coverage/
.nyc_output/

# Temp
tmp/
temp/
`;

export const readmeTemplate = (data: ProjectTemplateData): string => `# ${data.projectName}

A Stratix application built with Domain-Driven Design, CQRS, and Hexagonal Architecture.

## Getting Started

\`\`\`bash
# Install dependencies
${data.packageManager} install

# Run in development mode
${data.packageManager} run dev

# Build for production
${data.packageManager} run build

# Start production server
${data.packageManager} start
\`\`\`

## Generate Code

Use Stratix CLI to generate code:

\`\`\`bash
# Generate a complete bounded context
stratix generate context Products --props "name:string,price:number,stock:number"

# Generate individual components
stratix generate entity Product --props "name:string,price:number"
stratix generate value-object Email --props "value:string"
stratix generate command CreateProduct --input "name:string,price:number"
stratix generate query GetProductById --input "id:string" --output "product:Product"
\`\`\`

## Project Structure

\`\`\`
src/
├── domain/              # Domain layer
│   ├── entities/       # Entities and Aggregates
│   ├── value-objects/  # Value Objects
│   └── repositories/   # Repository interfaces
├── application/         # Application layer
│   ├── commands/       # CQRS Commands
│   └── queries/        # CQRS Queries
└── infrastructure/      # Infrastructure layer
    └── persistence/    # Repository implementations
\`\`\`

## Learn More

- [Stratix Documentation](https://stratix.dev/docs)
- [Domain-Driven Design](https://martinfowler.com/bliki/DomainDrivenDesign.html)
- [CQRS Pattern](https://martinfowler.com/bliki/CQRS.html)

## License

MIT
`;
