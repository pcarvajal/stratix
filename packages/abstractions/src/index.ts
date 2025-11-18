// Container
export type { Token } from './container/Token.js';
export type { Factory } from './container/Factory.js';
export type { ResolutionContext } from './container/ResolutionContext.js';
export type { RegisterOptions } from './container/RegisterOptions.js';
export type { Container } from './container/Container.js';
export { ServiceLifetime } from './container/ServiceLifetime.js';

// Messaging
export type { Command } from './messaging/Command.js';
export type { Query } from './messaging/Query.js';
export type { Event } from './messaging/Event.js';
export type { CommandHandler } from './messaging/CommandHandler.js';
export type { QueryHandler } from './messaging/QueryHandler.js';
export type { EventHandler } from './messaging/EventHandler.js';
export type { CommandBus } from './messaging/CommandBus.js';
export type { QueryBus } from './messaging/QueryBus.js';
export type { EventBus } from './messaging/EventBus.js';

// Infrastructure
export { LogLevel } from './infrastructure/LogLevel.js';
export type { Logger } from './infrastructure/Logger.js';
export type { Repository } from './infrastructure/Repository.js';
export type { UnitOfWork } from './infrastructure/UnitOfWork.js';
export { HealthStatus } from './infrastructure/HealthCheck.js';
export type { HealthCheckResult, HealthCheck } from './infrastructure/HealthCheck.js';

// Plugin
export type { PluginMetadata } from './plugin/PluginMetadata.js';
export type { PluginContext } from './plugin/PluginContext.js';
export type { Plugin } from './plugin/Plugin.js';

// Module (Bounded Contexts)
export type { ModuleMetadata } from './module/ModuleMetadata.js';
export type { ModuleContext } from './module/ModuleContext.js';
export type { ContextModule } from './module/ContextModule.js';
export type {
  CommandDefinition,
  QueryDefinition,
  EventHandlerDefinition,
  RepositoryDefinition,
} from './module/definitions.js';

// AI Agents
export * from './ai-agents/index.js';
