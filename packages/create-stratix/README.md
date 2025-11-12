# create-stratix

Scaffold a new Stratix AI Agent Framework project with zero configuration.

## Usage

```bash
# With npm
npm create stratix@latest

# With pnpm
pnpm create stratix

# With yarn
yarn create stratix
```

## What You Get

- TypeScript configured
- Stratix packages pre-installed
- Example AI agents
- Testing setup with vitest
- Build configuration
- Git initialized

## Project Templates

- **minimal** - Basic setup with core packages
- **ai-agents** - AI agent examples with OpenAI/Anthropic
- **full-stack** - Complete setup with all extensions

## Interactive Prompts

The CLI will guide you through:

1. Project name
2. Template selection
3. Package manager (npm/pnpm/yarn)
4. LLM provider (OpenAI/Anthropic/both)
5. Additional features (Redis, MongoDB, etc.)

## Example

```bash
$ npm create stratix@latest

✔ Project name: my-ai-agent
✔ Template: ai-agents
✔ Package manager: pnpm
✔ LLM provider: OpenAI
✔ Additional features: Redis, Testing

Creating project in ./my-ai-agent...
Installing dependencies...
Done!

cd my-ai-agent
pnpm dev
```

## License

MIT
