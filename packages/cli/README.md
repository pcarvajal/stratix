# @stratix/cli

Global CLI for Stratix framework - Create projects and generate code with powerful generators.

## Installation

```bash
npm install -g @stratix/cli
```

## Quick Start

```bash
# Create a new project
stratix new my-app

# Generate a bounded context
cd my-app
stratix generate context Products --props "name:string,price:number,stock:number"
```

## Commands

### `stratix new <project-name>`

Create a new Stratix project with minimal setup.

### `stratix generate <type> <name>`

Generate code artifacts using built-in generators.

Available generators:
- `context` - Complete bounded context
- `entity` - Domain entity or aggregate root  
- `value-object` - Domain value object
- `command` - CQRS command with handler
- `query` - CQRS query with handler

## Learn More

- [Stratix Documentation](https://stratix.dev/docs)
- [CLI Reference](https://stratix.dev/docs/cli/overview)

## License

MIT
