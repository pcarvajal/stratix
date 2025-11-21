import { StratixKnowledgeBase, SearchResult } from './StratixKnowledgeBase';
import { ProjectContext } from '../ProjectAnalyzer';

export class RAGPromptBuilder {
    constructor(private knowledgeBase: StratixKnowledgeBase) { }

    async build(
        userQuery: string,
        command: string | undefined,
        projectContext: ProjectContext
    ): Promise<string> {
        // 1. Search for relevant knowledge
        const searchQuery = this.buildSearchQuery(command, userQuery);
        const relevantDocs = await this.knowledgeBase.search(searchQuery, 5);

        // 2. Build enriched prompt
        const systemPrompt = this.getSystemPrompt();
        const ragContext = this.buildRAGContext(relevantDocs);
        const projectInfo = this.buildProjectContext(projectContext);
        const commandGuidance = this.getCommandGuidance(command);

        return `${systemPrompt}

${ragContext}

${projectInfo}

${commandGuidance}

## User Request

${userQuery}

**IMPORTANT**: Generate code following EXACTLY the patterns shown in the Stratix documentation above. Use the exact imports, structure, and naming conventions from the examples.`;
    }

    private buildSearchQuery(command: string | undefined, userQuery: string): string {
        if (command) {
            return `${command} ${userQuery}`;
        }
        return userQuery;
    }

    private getSystemPrompt(): string {
        return `You are a Stratix framework expert with access to the complete Stratix documentation.

**CRITICAL RULES**:
1. ALWAYS follow the patterns shown in the retrieved documentation
2. Use EXACT imports from the examples (e.g., import { Entity, EntityId } from '@stratix/core')
3. Follow the EXACT structure shown in examples
4. DO NOT invent patterns - use only what's in the documentation
5. If unsure, refer to the retrieved documentation
6. Generate TypeScript code with proper type annotations
7. Follow DDD and CQRS principles as shown in Stratix patterns`;
    }

    private buildRAGContext(results: SearchResult): string {
        if (!results.documents || results.documents.length === 0) {
            return '## Stratix Documentation\n\nNo specific documentation found. Use general Stratix patterns.';
        }

        const context = results.documents
            .map((doc, i) => {
                const metadata = results.metadatas[i];
                const distance = results.distances[i];
                const relevance = ((1 - distance) * 100).toFixed(1);

                return `### Reference ${i + 1}: ${metadata.title || metadata.category} (${relevance}% relevant)

Source: ${metadata.source}
Type: ${metadata.type}

${doc}

---`;
            })
            .join('\n\n');

        return `## Stratix Documentation (Retrieved from Knowledge Base)

${context}`;
    }

    private buildProjectContext(context: ProjectContext): string {
        return `## Current Project Context

- **Structure**: ${context.structure}
- **Bounded Contexts**: ${context.boundedContexts.length > 0 ? context.boundedContexts.join(', ') : 'none'}
- **Existing Entities**: ${context.entities.length} (${context.entities.slice(0, 5).join(', ')}${context.entities.length > 5 ? '...' : ''})
- **Existing Commands**: ${context.commands.length}
- **Existing Queries**: ${context.queries.length}
- **Stratix Packages**: ${context.stratixPackages.join(', ') || 'none'}
- **Has stratix.config.js**: ${context.hasStratixConfig ? 'yes' : 'no'}`;
    }

    private getCommandGuidance(command: string | undefined): string {
        switch (command) {
            case 'entity':
                return this.getEntityGuidance();
            case 'command':
                return this.getCommandGuidance_();
            case 'query':
                return this.getQueryGuidance();
            case 'vo':
                return this.getValueObjectGuidance();
            case 'repository':
                return this.getRepositoryGuidance();
            case 'context':
                return this.getContextGuidance();
            case 'refactor':
                return this.getRefactorGuidance();
            case 'explain':
                return this.getExplainGuidance();
            default:
                return '';
        }
    }

    private getEntityGuidance(): string {
        return `## Entity Generation Guidance

Generate a domain entity following the pattern shown in the documentation above.

**File placement**:
- DDD structure: \`src/domain/entities/{name}.entity.ts\`
- Modular structure: \`src/contexts/{context}/domain/entities/{name}.entity.ts\`

**Required elements**:
1. Props interface
2. Private constructor
3. Static create method
4. Getters for all properties
5. Proper imports from @stratix/core`;
    }

    private getCommandGuidance_(): string {
        return `## Command Generation Guidance

Generate a CQRS command with handler following the pattern shown in the documentation.

**Files to generate**:
1. \`{name}.command.ts\` - Command DTO
2. \`{name}.handler.ts\` - Command handler

**File placement**:
- DDD structure: \`src/application/commands/\`
- Modular structure: \`src/contexts/{context}/application/commands/\``;
    }

    private getQueryGuidance(): string {
        return `## Query Generation Guidance

Generate a CQRS query with handler following the pattern shown in the documentation.

**Files to generate**:
1. \`{name}.query.ts\` - Query DTO
2. \`{name}.handler.ts\` - Query handler

**File placement**:
- DDD structure: \`src/application/queries/\`
- Modular structure: \`src/contexts/{context}/application/queries/\``;
    }

    private getValueObjectGuidance(): string {
        return `## Value Object Generation Guidance

Generate a value object following the pattern shown in the documentation.

**File placement**:
- DDD structure: \`src/domain/value-objects/{name}.vo.ts\`
- Modular structure: \`src/contexts/{context}/domain/value-objects/{name}.vo.ts\`

**Required elements**:
1. Props interface
2. Private constructor
3. Static create method with validation
4. Return Result<T> for validation
5. Getters for properties`;
    }

    private getRepositoryGuidance(): string {
        return `## Repository Generation Guidance

Generate a repository interface and optionally an in-memory implementation.

**File placement**:
- Interface: \`src/domain/repositories/{name}.repository.ts\`
- Implementation: \`src/infrastructure/persistence/in-memory-{name}.repository.ts\``;
    }

    private getContextGuidance(): string {
        return `## Bounded Context Generation Guidance

Generate a complete bounded context with entity, repository, commands, and queries.

**Structure to create**:
\`\`\`
src/contexts/{context-name}/
├── domain/
│   ├── entities/
│   └── repositories/
├── application/
│   ├── commands/
│   └── queries/
├── infrastructure/
│   └── repositories/
└── index.ts
\`\`\``;
    }

    private getRefactorGuidance(): string {
        return `## Refactoring Guidance

Analyze the code and suggest refactorings to follow DDD and CQRS patterns as shown in Stratix documentation.

Focus on:
1. Extracting business logic to entities
2. Creating value objects for domain concepts
3. Separating commands and queries
4. Improving domain model expressiveness`;
    }

    private getExplainGuidance(): string {
        return `## Explanation Guidance

Explain the Stratix concept using the documentation retrieved above.

Provide:
1. Clear definition
2. Code examples from Stratix
3. When to use it
4. Best practices`;
    }
}
