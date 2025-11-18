# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.3] - 2025-01-18

### Added
- **@stratix/cli**: Complete code generation CLI tool
  - `stratix new` - Project scaffolding with DDD/Modular structures
  - `stratix generate context` - Generate complete bounded contexts (16 files: entity, repository, commands, queries, handlers, plugin)
  - `stratix g entity` - Generate entities/aggregate roots
  - `stratix g value-object` - Generate value objects
  - `stratix g command` - Generate commands with handlers
  - `stratix g query` - Generate queries with handlers
  - Beautiful CLI output with chalk and ora
  - Interactive prompts with inquirer
  - Dry-run and force modes
  - Props parsing from string format
  - Automatic naming conversions (PascalCase, camelCase, kebab-case)

### Changed
- Replaced `create-stratix` with `@stratix/cli` for better developer experience
- Updated documentation to reflect new CLI tool

### Removed
- `create-stratix` package (replaced by `@stratix/cli`)

## [0.1.2] - 2025-01-15

### Added
- Versioning policy documentation
- Pre-release status badges and notices

## [0.1.1] - 2025-01-11

### Fixed
- Documentation updates and synchronization

## [0.1.0] - 2025-01-11

### Added
- Initial public release
- Core primitives: Entity, AggregateRoot, ValueObject, Result pattern
- AI Agent base classes and orchestrator
- LLM providers: OpenAI, Anthropic
- Plugin system with lifecycle management
- DI container implementation (Awilix)
- CQRS implementation (in-memory)
- Extensions: PostgreSQL, MongoDB, Redis, RabbitMQ, OpenTelemetry, Secrets
- Testing utilities and mock providers
- CLI tool: create-stratix
- Example applications: REST API, Microservices, Worker, AI Agents
- Complete Docusaurus documentation site
- 11 built-in value objects: Money, Email, UUID, and more

### Notes
- This is a pre-release version (0.x)
- API is subject to change without prior notice
- Recommended for early adopters and testing only
- See [Versioning Policy](./docs/website/docs/getting-started/versioning.md) for details

[Unreleased]: https://github.com/pcarvajal/stratix/compare/v0.1.1...HEAD
[0.1.1]: https://github.com/pcarvajal/stratix/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/pcarvajal/stratix/releases/tag/v0.1.0
