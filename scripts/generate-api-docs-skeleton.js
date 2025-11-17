#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from 'fs';
import { resolve, join, basename } from 'path';

/**
 * Script to generate skeleton API documentation files
 *
 * This script creates markdown files with basic structure for all packages
 * that need API documentation. The files follow the .template.md structure
 * and include placeholders that need to be filled in manually.
 */

const ROOT_DIR = resolve(process.cwd());
const DOCS_API_DIR = join(ROOT_DIR, 'docs', 'api');
const PACKAGES_DIR = join(ROOT_DIR, 'packages');

// Configuration for each layer and its packages
const DOCUMENTATION_PLAN = {
  'layer-1-primitives': {
    package: '@stratix/primitives',
    layer: 'Layer 1 - Primitives',
    files: [
      { name: 'aggregate-root.md', title: 'AggregateRoot', source: 'src/core/AggregateRoot.ts' },
      { name: 'value-object.md', title: 'ValueObject', source: 'src/core/ValueObject.ts' },
      { name: 'entity-id.md', title: 'EntityId', source: 'src/core/EntityId.ts' },
      { name: 'result.md', title: 'Result', source: 'src/core/Result.ts' },
      { name: 'domain-event.md', title: 'DomainEvent', source: 'src/core/DomainEvent.ts' },
      { name: 'money.md', title: 'Money', source: 'src/value-objects/Money.ts' },
      { name: 'currency.md', title: 'Currency', source: 'src/value-objects/Currency.ts' },
    ]
  },
  'layer-1-primitives/ai-agents': {
    package: '@stratix/primitives',
    layer: 'Layer 1 - Primitives',
    files: [
      { name: 'README.md', title: 'AI Agent Primitives Overview' },
      { name: 'ai-agent.md', title: 'AIAgent', source: 'src/ai-agents/AIAgent.ts' },
      { name: 'stratix-tool.md', title: 'StratixTool', source: 'src/ai-agents/StratixTool.ts' },
      { name: 'agent-context.md', title: 'AgentContext', source: 'src/ai-agents/types.ts' },
      { name: 'types.md', title: 'AI Agent Types', source: 'src/ai-agents/types.ts' },
    ]
  },
  'layer-2-abstractions': {
    package: '@stratix/abstractions',
    layer: 'Layer 2 - Abstractions',
    files: [
      { name: 'README.md', title: 'Abstractions Overview' },
      { name: 'container.md', title: 'Container', source: 'src/Container.ts' },
      { name: 'logger.md', title: 'Logger', source: 'src/Logger.ts' },
      { name: 'repository.md', title: 'Repository', source: 'src/Repository.ts' },
      { name: 'event-bus.md', title: 'EventBus', source: 'src/EventBus.ts' },
      { name: 'plugin.md', title: 'Plugin', source: 'src/plugin/Plugin.ts' },
      { name: 'context-plugin.md', title: 'ContextPlugin', source: 'src/plugin/ContextPlugin.ts' },
    ]
  },
  'layer-2-abstractions/cqrs': {
    package: '@stratix/abstractions',
    layer: 'Layer 2 - Abstractions',
    files: [
      { name: 'README.md', title: 'CQRS Abstractions Overview' },
      { name: 'command.md', title: 'Command', source: 'src/cqrs/Command.ts' },
      { name: 'query.md', title: 'Query', source: 'src/cqrs/Query.ts' },
      { name: 'command-bus.md', title: 'CommandBus', source: 'src/cqrs/CommandBus.ts' },
      { name: 'query-bus.md', title: 'QueryBus', source: 'src/cqrs/QueryBus.ts' },
    ]
  },
  'layer-2-abstractions/ai-agents': {
    package: '@stratix/abstractions',
    layer: 'Layer 2 - Abstractions',
    files: [
      { name: 'README.md', title: 'AI Agent Abstractions Overview' },
      { name: 'llm-provider.md', title: 'LLMProvider' },
      { name: 'agent-repository.md', title: 'AgentRepository' },
      { name: 'memory-store.md', title: 'MemoryStore' },
    ]
  },
  'layer-3-runtime': {
    package: '@stratix/runtime',
    layer: 'Layer 3 - Runtime',
    files: [
      { name: 'README.md', title: 'Runtime Overview' },
      { name: 'application-builder.md', title: 'ApplicationBuilder', source: 'src/ApplicationBuilder.ts' },
      { name: 'application.md', title: 'Application', source: 'src/Application.ts' },
      { name: 'lifecycle-manager.md', title: 'LifecycleManager', source: 'src/core/LifecycleManager.ts' },
      { name: 'dependency-graph.md', title: 'DependencyGraph', source: 'src/core/DependencyGraph.ts' },
      { name: 'plugin-context.md', title: 'PluginContext', source: 'src/plugin/PluginContext.ts' },
      { name: 'base-context-plugin.md', title: 'BaseContextPlugin', source: 'src/plugin/BaseContextPlugin.ts' },
    ]
  },
  'layer-4-implementations/di-awilix': {
    package: '@stratix/impl-di-awilix',
    layer: 'Layer 4 - Implementations',
    files: [
      { name: 'README.md', title: 'Awilix DI Container' },
      { name: 'awilix-container.md', title: 'AwilixContainer', source: 'src/AwilixContainer.ts' },
    ]
  },
  'layer-4-implementations/logger-console': {
    package: '@stratix/impl-logger-console',
    layer: 'Layer 4 - Implementations',
    files: [
      { name: 'README.md', title: 'Console Logger' },
      { name: 'console-logger.md', title: 'ConsoleLogger', source: 'src/ConsoleLogger.ts' },
    ]
  },
  'layer-4-implementations/cqrs-inmemory': {
    package: '@stratix/impl-cqrs-inmemory',
    layer: 'Layer 4 - Implementations',
    files: [
      { name: 'README.md', title: 'In-Memory CQRS Buses' },
      { name: 'inmemory-command-bus.md', title: 'InMemoryCommandBus', source: 'src/InMemoryCommandBus.ts' },
      { name: 'inmemory-query-bus.md', title: 'InMemoryQueryBus', source: 'src/InMemoryQueryBus.ts' },
    ]
  },
  'layer-4-implementations/ai-agents': {
    package: '@stratix/impl-ai-agents',
    layer: 'Layer 4 - Implementations',
    files: [
      { name: 'README.md', title: 'AI Agent Orchestrator' },
      { name: 'stratix-agent-orchestrator.md', title: 'StratixAgentOrchestrator', source: 'src/StratixAgentOrchestrator.ts' },
      { name: 'inmemory-agent-repository.md', title: 'InMemoryAgentRepository' },
      { name: 'inmemory-audit-log.md', title: 'InMemoryAuditLog' },
    ]
  },
  'layer-5-extensions/production/http-fastify': {
    package: '@stratix/ext-http-fastify',
    layer: 'Layer 5 - Extensions',
    files: [
      { name: 'README.md', title: 'Fastify HTTP Plugin' },
      { name: 'fastify-http-plugin.md', title: 'FastifyHTTPPlugin', source: 'src/FastifyHTTPPlugin.ts' },
      { name: 'route-handlers.md', title: 'Route Handlers' },
      { name: 'errors.md', title: 'HTTP Errors', source: 'src/errors.ts' },
    ]
  },
  'layer-5-extensions/production/validation-zod': {
    package: '@stratix/ext-validation-zod',
    layer: 'Layer 5 - Extensions',
    files: [
      { name: 'README.md', title: 'Zod Validation' },
      { name: 'zod-validator.md', title: 'ZodValidator', source: 'src/ZodValidator.ts' },
      { name: 'helpers.md', title: 'Validation Helpers', source: 'src/helpers.ts' },
    ]
  },
  'layer-5-extensions/production/mappers': {
    package: '@stratix/ext-mappers',
    layer: 'Layer 5 - Extensions',
    files: [
      { name: 'README.md', title: 'DTO Mappers' },
      { name: 'mapper.md', title: 'Mapper', source: 'src/Mapper.ts' },
    ]
  },
  'layer-5-extensions/production/auth': {
    package: '@stratix/ext-auth',
    layer: 'Layer 5 - Extensions',
    files: [
      { name: 'README.md', title: 'Authentication & Authorization' },
      { name: 'auth-plugin.md', title: 'AuthPlugin', source: 'src/AuthPlugin.ts' },
      { name: 'jwt-service.md', title: 'JWTService', source: 'src/jwt/JWTService.ts' },
      { name: 'rbac-service.md', title: 'RBACService', source: 'src/rbac/RBACService.ts' },
    ]
  },
  'layer-5-extensions/production/migrations': {
    package: '@stratix/ext-migrations',
    layer: 'Layer 5 - Extensions',
    files: [
      { name: 'README.md', title: 'Database Migrations' },
      { name: 'migration-plugin.md', title: 'MigrationPlugin', source: 'src/MigrationPlugin.ts' },
      { name: 'migration-base.md', title: 'Migration', source: 'src/Migration.ts' },
    ]
  },
  'layer-5-extensions/production/errors': {
    package: '@stratix/ext-errors',
    layer: 'Layer 5 - Extensions',
    files: [
      { name: 'README.md', title: 'Structured Errors' },
      { name: 'app-error.md', title: 'AppError', source: 'src/AppError.ts' },
      { name: 'error-taxonomy.md', title: 'Error Taxonomy' },
    ]
  },
  'layer-5-extensions/data/postgres': {
    package: '@stratix/ext-postgres',
    layer: 'Layer 5 - Extensions',
    files: [
      { name: 'README.md', title: 'PostgreSQL Plugin' },
      { name: 'postgres-plugin.md', title: 'PostgresPlugin', source: 'src/PostgresPlugin.ts' },
    ]
  },
  'layer-5-extensions/data/mongodb': {
    package: '@stratix/ext-mongodb',
    layer: 'Layer 5 - Extensions',
    files: [
      { name: 'README.md', title: 'MongoDB Plugin' },
      { name: 'mongodb-plugin.md', title: 'MongoDBPlugin', source: 'src/MongoDBPlugin.ts' },
    ]
  },
  'layer-5-extensions/data/redis': {
    package: '@stratix/ext-redis',
    layer: 'Layer 5 - Extensions',
    files: [
      { name: 'README.md', title: 'Redis Plugin' },
      { name: 'redis-plugin.md', title: 'RedisPlugin', source: 'src/RedisPlugin.ts' },
    ]
  },
  'layer-5-extensions/data/rabbitmq': {
    package: '@stratix/ext-rabbitmq',
    layer: 'Layer 5 - Extensions',
    files: [
      { name: 'README.md', title: 'RabbitMQ Plugin' },
      { name: 'rabbitmq-plugin.md', title: 'RabbitMQPlugin', source: 'src/RabbitMQPlugin.ts' },
    ]
  },
  'layer-5-extensions/observability/opentelemetry': {
    package: '@stratix/ext-opentelemetry',
    layer: 'Layer 5 - Extensions',
    files: [
      { name: 'README.md', title: 'OpenTelemetry Plugin' },
      { name: 'opentelemetry-plugin.md', title: 'OpenTelemetryPlugin', source: 'src/OpenTelemetryPlugin.ts' },
    ]
  },
  'layer-5-extensions/observability/secrets': {
    package: '@stratix/ext-secrets',
    layer: 'Layer 5 - Extensions',
    files: [
      { name: 'README.md', title: 'Secrets Plugin' },
      { name: 'secrets-plugin.md', title: 'SecretsPlugin', source: 'src/SecretsPlugin.ts' },
    ]
  },
  'layer-5-extensions/ai-providers/openai': {
    package: '@stratix/ext-ai-agents-openai',
    layer: 'Layer 5 - Extensions',
    files: [
      { name: 'README.md', title: 'OpenAI Provider' },
      { name: 'openai-provider.md', title: 'OpenAIProvider', source: 'src/OpenAIProvider.ts' },
      { name: 'streaming.md', title: 'Streaming API' },
    ]
  },
  'layer-5-extensions/ai-providers/anthropic': {
    package: '@stratix/ext-ai-agents-anthropic',
    layer: 'Layer 5 - Extensions',
    files: [
      { name: 'README.md', title: 'Anthropic Provider' },
      { name: 'anthropic-provider.md', title: 'AnthropicProvider', source: 'src/AnthropicProvider.ts' },
      { name: 'tool-use.md', title: 'Tool Use API' },
    ]
  },
  'testing': {
    package: '@stratix/testing',
    layer: 'Testing Utilities',
    files: [
      { name: 'README.md', title: 'Testing Utilities Overview' },
      { name: 'mock-llm-provider.md', title: 'MockLLMProvider', source: 'src/MockLLMProvider.ts' },
      { name: 'inmemory-event-bus.md', title: 'InMemoryEventBus' },
      { name: 'test-container.md', title: 'TestContainer' },
      { name: 'test-helpers.md', title: 'Test Helpers' },
    ]
  }
};

function createSkeletonFile(targetPath, title, packageName, layer, version = '0.1.0') {
  const content = `# ${title}

> **Package:** \`${packageName}\`
> **Layer:** ${layer}
> **Since:** v${version}

## Overview

[TODO: Add 1-2 paragraph description]

**Key Features:**
- [TODO: Feature 1]
- [TODO: Feature 2]
- [TODO: Feature 3]

## Import

\`\`\`typescript
import { ${title} } from '${packageName}';
\`\`\`

## Type Signature

\`\`\`typescript
// TODO: Add type signature
\`\`\`

## Usage Examples

### Basic Usage

\`\`\`typescript
// TODO: Add basic example
\`\`\`

### Advanced Usage

\`\`\`typescript
// TODO: Add advanced example
\`\`\`

## Best Practices

- **Do:** [TODO: Best practice 1]
- **Do:** [TODO: Best practice 2]
- **Don't:** [TODO: Anti-pattern to avoid]

## Related Components

- [TODO: Add related components]

## See Also

- [Package README](../../../packages/[package-name]/README.md)
- [Core Concepts](../../website/docs/core-concepts/)
`;

  return content;
}

function generateSkeletons() {
  let totalCreated = 0;
  let totalSkipped = 0;

  console.log('Generating API documentation skeletons...\n');

  for (const [dir, config] of Object.entries(DOCUMENTATION_PLAN)) {
    const targetDir = join(DOCS_API_DIR, dir);

    for (const file of config.files) {
      const targetPath = join(targetDir, file.name);

      // Skip if file already exists
      if (existsSync(targetPath)) {
        console.log(`⊘ Skipped (exists): ${dir}/${file.name}`);
        totalSkipped++;
        continue;
      }

      const content = createSkeletonFile(
        targetPath,
        file.title,
        config.package,
        config.layer
      );

      writeFileSync(targetPath, content, 'utf8');
      console.log(`✓ Created: ${dir}/${file.name}`);
      totalCreated++;
    }
  }

  console.log(`\n================================`);
  console.log(`Summary:`);
  console.log(`  Created: ${totalCreated} files`);
  console.log(`  Skipped: ${totalSkipped} files`);
  console.log(`  Total: ${totalCreated + totalSkipped} files`);
  console.log(`================================\n`);

  console.log('Next steps:');
  console.log('1. Review the generated skeleton files in docs/api/');
  console.log('2. Fill in the TODO sections with actual content');
  console.log('3. Add code examples from the source code');
  console.log('4. Add cross-references between related documents');
  console.log('5. Update the main docs/api/README.md with the new structure');
}

// Run the generator
generateSkeletons();
