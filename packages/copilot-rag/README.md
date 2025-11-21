# Stratix Copilot

**AI-powered coding assistant for Stratix framework** - Generate DDD/CQRS code with intelligent, context-aware suggestions.

[![VS Code](https://img.shields.io/badge/VS%20Code-1.85%2B-blue)](https://code.visualstudio.com/)
[![GitHub Copilot](https://img.shields.io/badge/GitHub%20Copilot-Required-green)](https://github.com/features/copilot)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)

## What is Stratix Copilot?

Stratix Copilot is a VS Code extension that enhances GitHub Copilot with deep knowledge of the Stratix framework. It uses **Retrieval Augmented Generation (RAG)** to provide accurate, framework-specific code generation.

### Key Features

- **Context-Aware AI** - Understands your project structure (DDD/Modular)
- **Framework Knowledge** - Trained on 36+ Stratix documentation sources
- **Smart Code Generation** - Entities, commands, queries, value objects
- **Auto-Updates** - Knowledge base stays synchronized with framework
- **One-Click File Creation** - Generate and save files directly from chat
- **Privacy-First** - All processing happens locally
- **No API Keys** - Uses your existing GitHub Copilot subscription

## Quick Start

### Installation

**From VS Code Marketplace** (Coming Soon):
1. Open Extensions (`Cmd+Shift+X`)
2. Search "Stratix Copilot"
3. Click Install

**From Source**:
```bash
cd stratix/packages/copilot-rag
pnpm install
pnpm run compile
```

### Usage

Open Copilot Chat and use `@stratix`:

```
@stratix /entity Product with name, price, stock
@stratix /command CreateProduct with productId, name, price
@stratix /query GetProductById with productId
@stratix /vo Email with validation
@stratix how do I implement a repository?
```

## Slash Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/entity` | Generate domain entity | `@stratix /entity User with email, name` |
| `/command` | Generate CQRS command | `@stratix /command CreateUser` |
| `/query` | Generate CQRS query | `@stratix /query GetUserById` |
| `/vo` | Generate value object | `@stratix /vo Email with validation` |
| `/repository` | Generate repository | `@stratix /repository UserRepository` |
| `/context` | Generate bounded context | `@stratix /context Orders` |
| `/refactor` | Get refactoring suggestions | `@stratix /refactor [code]` |
| `/explain` | Explain concepts | `@stratix /explain aggregate roots` |

## How It Works

```mermaid
graph LR
    A[You ask @stratix] --> B[Analyze Project]
    B --> C[Search Knowledge Base]
    C --> D[36+ Docs]
    D --> E[Build Context]
    E --> F[GitHub Copilot]
    F --> G[Generate Code]
    G --> H[Show in Chat]
    H --> I[Click Button]
    I --> J[File Created]
```

1. **Analyze** - Understands your project structure
2. **Search** - Finds relevant documentation using semantic search
3. **Enrich** - Adds Stratix patterns and examples to prompt
4. **Generate** - GitHub Copilot creates accurate code
5. **Create** - One-click file creation in correct location

## Knowledge Base

The extension includes a pre-built, versioned knowledge base:

- **36+ Documents** - Complete Stratix documentation
- **Auto-Updates** - CI/CD keeps it synchronized
- **Version Tracking** - Matches framework version
- **Local Storage** - Fast, privacy-first

### Version Information

Check your KB version:
```
Cmd+Shift+P → "Stratix: Show Knowledge Base Info"
```

Update manually:
```
Cmd+Shift+P → "Stratix: Rebuild Knowledge Base"
```

## Requirements

- **VS Code** 1.85.0 or higher
- **GitHub Copilot** subscription
- **Node.js** 18.0.0+ (for development)

## VS Code Commands

- `Stratix: Open AI Assistant` - Open Copilot Chat
- `Stratix: Rebuild Knowledge Base` - Rebuild KB from docs
- `Stratix: Show Knowledge Base Info` - Display version & stats

## Documentation

Full documentation available at [stratix.dev/docs/stratix-copilot](https://stratix.dev/docs/stratix-copilot/overview)

- [Overview](https://stratix.dev/docs/stratix-copilot/overview)
- [Installation Guide](https://stratix.dev/docs/stratix-copilot/installation)
- [Usage Guide](https://stratix.dev/docs/stratix-copilot/usage)
- [Commands Reference](https://stratix.dev/docs/stratix-copilot/commands)

## Development

### Building

```bash
pnpm install
pnpm run compile
```

### Building Knowledge Base

```bash
pnpm run build:knowledge
```

### Packaging

```bash
pnpm run package
```

### Testing

```bash
# Manual testing
1. Press F5 in VS Code
2. Extension Development Host opens
3. Test @stratix in Copilot Chat
```

## Architecture

- **RAG System** - `src/rag/StratixKnowledgeBase.ts`
- **Chat Participant** - `src/StratixChatParticipant.ts`
- **Prompt Builder** - `src/rag/RAGPromptBuilder.ts`
- **File Creation** - `src/FileCreationHandler.ts`
- **Knowledge Builder** - `knowledge-base/build-knowledge.ts`

## Contributing

Contributions welcome! Please read our [Contributing Guide](../../CONTRIBUTING.md).

## License

MIT © [P. Andrés Carvajal](https://github.com/pcarvajal)

## Support

- [Documentation](https://stratix.dev/docs)
- [GitHub Discussions](https://github.com/pcarvajal/stratix/discussions)
- [Issue Tracker](https://github.com/pcarvajal/stratix/issues)
