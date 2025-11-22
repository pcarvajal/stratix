# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.4.1] - 2025-11-22

### Added

#### VS Code Extension
- **Stratix Copilot**: Published to VS Code Marketplace
  - Extension ID: `stratix.stratix-copilot-rag`
  - Marketplace URL: https://marketplace.visualstudio.com/items?itemName=stratix.stratix-copilot-rag
  - AI-powered coding assistant with GitHub Copilot integration
  - RAG-enhanced responses with framework knowledge
  - Slash commands for quick code generation
  - Knowledge base with 40+ indexed documents

### Changed

#### Documentation
- **Marketplace Links**: Added VS Code Marketplace links throughout documentation
  - Updated `README.md` with npm package links and VS Code extension link
  - Added marketplace links to Docusaurus documentation:
    - `docs/website/docs/intro.md`
    - `docs/website/docs/stratix-copilot/overview.md`
    - `docs/website/docs/stratix-copilot/installation.md`
    - `docs/website/docs/getting-started/introduction.md`
    - `docs/website/docs/getting-started/quick-start.md`
    - `docs/website/docs/cli/cli-overview.md`

#### CI/CD
- **Knowledge Base Workflow**: Fixed `tsx` dependency installation
  - Added step to install copilot-rag dependencies before building knowledge base
  - Resolves `tsx: not found` error in GitHub Actions

#### VS Code Extension
- **Package Metadata**: Updated extension configuration
  - Added icon (Stratix logo, 128x128px)
  - Updated repository URLs to `stratix-dev` organization
  - Version bumped to 0.1.2

## [0.4.0] - 2025-11-21

### Changed

#### Documentation
- **Repository Migration**: Moved repository from `github.com/pcarvajal/stratix` to `github.com/stratix-dev/stratix`
- **Documentation Site**: Updated GitHub Pages URL from `pcarvajal.github.io/stratix` to `stratix-dev.github.io/stratix`
- **Package URLs**: Updated all package.json repository URLs to new organization
- **Docusaurus Config**: Updated organization name to `stratix-dev`
- **Issue Templates**: Updated all GitHub links to new repository location

#### Docusaurus Theme
- **Light Theme**: Updated color palette to match official Stratix logo
  - Primary: #2958FC (Stratix Blue)
  - Secondary: #2895FD (Sky Blue)
  - Accent: #14E4E8 (Neon Ice)
  - Warning: #E035B6 (Magenta)
  - Background: #FDFDFD (Almost White)
- **Dark Theme**: Enhanced dark mode with improved contrast
  - Primary: #14E4E8 (Neon Ice) for better visibility
  - Updated code blocks, tables, admonitions, and interactive elements
  - Improved Mermaid diagram colors
- **Footer**: Fixed footer styling in both light and dark themes
- **Default Mode**: Changed to light mode with system preference respect

#### Stratix Copilot Documentation
- **Removed**: References to "Action Buttons" feature (eliminated from extension)
- **Removed**: "One-Click File Creation" mentions
- **Updated**: Workflow documentation to reflect manual copy/paste process
- **Updated**: Mermaid diagrams to show "Copy & Use" instead of "Click Button"
- **Added**: "RAG-Enhanced" as key feature replacing one-click functionality
- **Files Updated**:
  - `docs/website/docs/stratix-copilot/overview.md`
  - `docs/website/docs/stratix-copilot/usage.md`
  - `docs/website/docs/stratix-copilot/commands.md`
  - `packages/copilot-rag/README.md`

#### Content Cleanup
- **Removed Emojis**: Cleaned all emojis from documentation and README files
- **Files Cleaned**:
  - All Docusaurus documentation files
  - `packages/copilot-rag/README.md`
  - Core documentation files

### Added

#### npm Package Management Scripts
- **`scripts/unpublish-old-packages.sh`**: Deprecate old packages on npm
- **`scripts/delete-old-packages.sh`**: Permanently delete deprecated packages with safety features
  - Dry-run mode by default
  - Requires `--execute` flag for actual deletions
  - Double confirmation prompts
  - Handles npm 72-hour restriction
  - Individual version deletion fallback
- **`scripts/README-npm-cleanup.md`**: Complete documentation for package cleanup process

#### GitHub Actions
- **Enhanced Publish Workflow**: Updated to handle new nested plugin structure
  - Dependency-ordered publishing (Core → Runtime → Plugins → Tools)
  - Verification step for all package types
  - Organized summary output by category
  - Skip already-published versions

#### Development Tools
- **Version Bump Script**: Now accepts version as command-line argument
  - Usage: `node scripts/bump-versions.mjs 0.4.0`
  - Previously hardcoded version

### Fixed
- **CHANGELOG.md**: Updated version comparison links to use new repository URL
- **GitHub Issue Templates**: Updated discussion and documentation URLs

## [0.3.0] - 2025-11-21

### Breaking Changes
- Consolidated package structure: merged `@stratix/primitives` and `@stratix/abstractions` into `@stratix/core`
- Moved default implementations (InMemoryCommandBus, InMemoryQueryBus, InMemoryEventBus, ConsoleLogger) into `@stratix/core`
- Reorganized packages into domain-based folders: `plugins/` with subfolders (ai, database, di, http, messaging, observability, utilities)
- Renamed packages with consistent prefixes:
  - `@stratix/impl-ai-agents` → `@stratix/ai-agents` (deprecated, functionality in core)
  - `@stratix/ext-ai-agents-openai` → `@stratix/ai-openai`
  - `@stratix/ext-ai-agents-anthropic` → `@stratix/ai-anthropic`
  - `@stratix/impl-di-awilix` → `@stratix/di-awilix`
  - `@stratix/ext-postgres` → `@stratix/db-postgres`
  - `@stratix/ext-mongodb` → `@stratix/db-mongodb`
  - `@stratix/ext-redis` → `@stratix/db-redis`
  - `@stratix/ext-rabbitmq` → `@stratix/msg-rabbitmq`
  - `@stratix/ext-opentelemetry` → `@stratix/obs-opentelemetry`
  - `@stratix/ext-http-fastify` → `@stratix/http-fastify`
  - `@stratix/ext-validation-zod` → `@stratix/validation-zod`
- Removed version comments in classes for simplicity

### Added
- **@stratix/core**: Now includes domain primitives, abstractions, and default implementations in a single zero-dependency package
- **@stratix/db-mongodb**:
  - Pagination support with cursor and offset-based methods
  - Index management (create, list, drop)
  - Aggregation pipeline support
  - Soft deletes with `deletedAt` field
- **@stratix/db-redis**:
  - Rate limiting with sliding window algorithm
  - Distributed locks with TTL
  - Session management with automatic expiration
  - Pub/Sub messaging
  - Sorted sets operations
  - Queue operations (FIFO)
- **@stratix/msg-rabbitmq**:
  - RPC (Remote Procedure Call) pattern
  - Priority queues
  - Delayed/scheduled messages
  - Advanced routing (topic, headers)
- **@stratix/di-awilix**:
  - Comprehensive test suite
  - Simplified registration API with `register.scoped()`, `register.singleton()`, `register.transient()`
  - Injection modes (PROXY, CLASSIC)
  - Performance benchmarks
  - Complete documentation with examples
- **AI Agents**:
  - Error hierarchy for better error handling
  - Retry logic with exponential backoff
  - Timeout support for agent execution
  - Enhanced AgentResult with error details and metadata
- **CLI**:
  - Handlebars-based template system (Phase 2)
  - New architecture with modular generators (Phase 3)
  - Improved code generation consistency
- **Tooling**:
  - Format checking with Prettier (`pnpm format:check`)
  - Code formatting (`pnpm format`)
  - Lint support across all packages

### Changed
- Simplified dependency graph: `Plugins → Runtime → Core`
- All packages now depend only on `@stratix/core` (except runtime which core depends on)
- Updated documentation to reflect new package names and structure
- CLI generators migrated to new architecture with consistent templates
- Improved DI plugin migration to simplified API
- Enhanced project scaffolding to support both DDD and modular architectures

### Fixed
- Build process for all packages
- Lint and test errors after package reorganization
- CLI generator templates for new package structure
- Documentation synchronization across packages
- Type checking issues

### Removed
- Redundant package name prefixes in old structure
- `@stratix/primitives` (merged into core)
- `@stratix/abstractions` (merged into core)
- Separate implementation packages for default buses (now in core)

### Documentation
- Updated API reference documentation
- Added comprehensive DI documentation with benchmarks
- Updated MongoDB README with new features
- Improved getting started guides

## [0.1.3] - 2025-11-18

### Added
- **@stratix/cli**: Complete code generation CLI tool with 8 generators
  - `stratix new` - Project scaffolding with DDD/Modular structures
  - `stratix generate context` - Generate complete bounded contexts (16 files: entity, repository, commands, queries, handlers, plugin)
  - `stratix g entity` - Generate entities/aggregate roots
  - `stratix g value-object` - Generate value objects
  - `stratix g command` - Generate commands with handlers
  - `stratix g query` - Generate queries with handlers
  - `stratix g repository` - Generate repository interface and implementation
  - `stratix g event-handler` - Generate domain event handlers
  - `stratix g plugin` - Generate custom plugins
  - `stratix add <extension>` - Install Stratix extensions (postgres, redis, http, auth, etc.)
  - `stratix add list` - List all available extensions
  - `stratix info` - Display project information
  - Beautiful CLI output with chalk and ora
  - Interactive prompts with inquirer
  - Dry-run and force modes
  - Props parsing from string format
  - Automatic naming conversions (PascalCase, camelCase, kebab-case)
  - Package manager detection (npm, pnpm, yarn)

### Changed
- Replaced `create-stratix` with `@stratix/cli` for better developer experience
- Updated documentation to reflect new CLI tool and commands

### Removed
- `create-stratix` package (replaced by `@stratix/cli`)

## [0.1.2] - 2025-11-15

### Added
- Versioning policy documentation
- Pre-release status badges and notices

## [0.1.1] - 2025-11-11

### Fixed
- Documentation updates and synchronization

## [0.1.0] - 2025-11-11

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

[Unreleased]: https://github.com/stratix-dev/stratix/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/stratix-dev/stratix/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/stratix-dev/stratix/compare/v0.1.3...v0.3.0
[0.1.3]: https://github.com/stratix-dev/stratix/compare/v0.1.2...v0.1.3
[0.1.2]: https://github.com/stratix-dev/stratix/compare/v0.1.1...v0.1.2
[0.1.1]: https://github.com/stratix-dev/stratix/compare/v0.1.0...v0.1.1
[0.1.0]: https://github.com/stratix-dev/stratix/releases/tag/v0.1.0
