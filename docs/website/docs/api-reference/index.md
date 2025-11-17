# API Reference

Complete API documentation for all Stratix packages.

## Core Packages

### [@stratix/primitives](./primitives/overview.md)

Foundation types and base classes for building domain models.

- **Entity & Aggregate Root**: Base classes for domain entities
- **Value Objects**: Immutable value types with validation
- **Result Pattern**: Explicit error handling
- **Domain Events**: Event-driven architecture primitives
- **Built-in Value Objects**: Money, Email, EntityId, and more

### [@stratix/abstractions](./abstractions/overview.md)

Core abstractions and interfaces for the framework.

- **Repository**: Data access abstraction
- **CQRS**: Command and Query interfaces
- **Event Bus**: Event publishing and subscription
- **Logger**: Logging abstraction
- **Service Lifetime**: Dependency injection scopes

### [@stratix/runtime](./runtime/overview.md)

Application runtime and plugin system.

- **ApplicationBuilder**: Application configuration and startup
- **Plugin System**: Extensible plugin architecture
- **Lifecycle Management**: Startup and shutdown hooks

## Implementation Packages

### Dependency Injection

- **@stratix/impl-di-awilix**: Awilix-based DI container

### Logging

- **@stratix/impl-logger-console**: Console logging implementation

### CQRS

- **@stratix/impl-cqrs-inmemory**: In-memory command, query, and event buses

## Extension Packages

### Phase 1 Production Extensions

Production-ready extensions for building enterprise applications.

#### @stratix/ext-http-fastify

Fastify HTTP server integration with Stratix plugin lifecycle.

- HTTP server management
- Route registration
- CORS support
- Request/response handling
- Health checks

#### @stratix/ext-validation-zod

Zod-based schema validation for commands, queries, and DTOs.

- Type-safe validation
- Result pattern integration
- Detailed error messages
- Zero runtime overhead for valid data

#### @stratix/ext-mappers

Entity-to-DTO mapping utilities with type safety.

- Type-safe field mapping
- Nested object support
- Circular reference handling
- Batch mapping

#### @stratix/ext-auth

JWT authentication and RBAC authorization.

- JWT token generation and validation
- Role-based access control
- Permission checking
- Password hashing

#### @stratix/ext-migrations

Database schema versioning and migration management.

- Version-controlled migrations
- Rollback support
- Migration history tracking
- Seed data support

#### @stratix/ext-errors

Structured error handling with error taxonomy.

- Error codes and severity levels
- HTTP status code mapping
- API response serialization
- Result pattern integration

### Data & Infrastructure Extensions

#### @stratix/ext-postgres

PostgreSQL database integration.

#### @stratix/ext-mongodb

MongoDB database integration.

#### @stratix/ext-redis

Redis caching and session storage.

#### @stratix/ext-rabbitmq

RabbitMQ integration for distributed messaging.

### Observability Extensions

#### @stratix/ext-opentelemetry

OpenTelemetry integration for observability (traces, metrics, logs).

#### @stratix/ext-secrets

Secrets management integration (AWS Secrets Manager, etc.).

### AI Provider Extensions

#### @stratix/ext-ai-agents-openai

OpenAI LLM provider with streaming and function calling.

#### @stratix/ext-ai-agents-anthropic

Anthropic Claude provider with tool use.

## Development Tools

### [create-stratix](./tools/create-stratix.md)

Project scaffolding tool.

### @stratix/testing

Testing utilities and helpers.
