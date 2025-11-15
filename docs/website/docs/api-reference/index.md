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

### @stratix/ext-rabbitmq

RabbitMQ integration for distributed messaging.

### @stratix/ext-opentelemetry

OpenTelemetry integration for observability.

### @stratix/ext-secrets

Secrets management integration.

## Development Tools

### [create-stratix](./tools/create-stratix.md)

Project scaffolding tool.

### @stratix/testing

Testing utilities and helpers.
