import * as vscode from 'vscode';
import { StratixKnowledgeBase } from './rag/StratixKnowledgeBase';
import { RAGPromptBuilder } from './rag/RAGPromptBuilder';
import { ProjectAnalyzer } from './ProjectAnalyzer';

export class StratixChatParticipant {
    private knowledgeBase: StratixKnowledgeBase;
    private promptBuilder: RAGPromptBuilder;
    private projectAnalyzer: ProjectAnalyzer;

    constructor(private context: vscode.ExtensionContext) {
        this.knowledgeBase = new StratixKnowledgeBase(context);
        this.promptBuilder = new RAGPromptBuilder(this.knowledgeBase);
        this.projectAnalyzer = new ProjectAnalyzer();
    }

    async initialize(): Promise<void> {
        await this.knowledgeBase.initialize();
    }

    async getKnowledgeBaseStats(): Promise<{
        documentCount: number;
        loadedFrom?: string;
        metadata?: import('./rag/StratixKnowledgeBase').KnowledgeBaseMetadata;
    }> {
        return this.knowledgeBase.getStats();
    }


    async handleRequest(
        request: vscode.ChatRequest,
        context: vscode.ChatContext,
        stream: vscode.ChatResponseStream,
        token: vscode.CancellationToken
    ): Promise<vscode.ChatResult> {
        try {
            // Show progress
            stream.progress('Analyzing your Stratix project...');

            // Analyze project
            const projectContext = await this.projectAnalyzer.analyze();

            stream.progress('Searching Stratix knowledge base...');

            // Search knowledge base for relevant documentation
            const searchResults = await this.knowledgeBase.search(request.prompt, 5);

            // Show references to user
            if (searchResults.documents.length > 0) {
                for (let i = 0; i < searchResults.documents.length; i++) {
                    const metadata = searchResults.metadatas[i];
                    stream.reference(new vscode.Location(
                        vscode.Uri.parse(`stratix://docs/${metadata.source}`),
                        new vscode.Range(0, 0, 0, 0)
                    ));
                }
            }

            stream.progress('Generating response with Copilot...');

            // Build enriched prompt with RAG context
            const enrichedPrompt = await this.promptBuilder.build(
                request.prompt,
                request.command,
                projectContext
            );

            // Use Copilot's language model to generate response
            const models = await vscode.lm.selectChatModels({
                vendor: 'copilot',
                family: 'gpt-4'
            });

            if (models.length === 0) {
                stream.markdown('❌ No Copilot model available. Please ensure GitHub Copilot is installed and activated.');
                return { metadata: { error: 'No model available' } };
            }

            const model = models[0];
            const messages = [
                vscode.LanguageModelChatMessage.User(enrichedPrompt)
            ];

            const chatResponse = await model.sendRequest(messages, {}, token);

            // Stream the response
            let fullResponse = '';
            for await (const fragment of chatResponse.text) {
                stream.markdown(fragment);
                fullResponse += fragment;
            }

            // Add follow-up buttons based on command
            this.addFollowUpActions(stream, request.command, request.prompt, fullResponse);

            return {
                metadata: {
                    command: request.command,
                    ragEnabled: true,
                    projectStructure: projectContext.structure,
                    documentsRetrieved: searchResults.documents.length
                }
            };
        } catch (error) {
            stream.markdown(`❌ Error: ${error instanceof Error ? error.message : 'Unknown error'}`);

            return {
                metadata: {
                    error: error instanceof Error ? error.message : 'Unknown error'
                }
            };
        }
    }

    private addFollowUpActions(
        stream: vscode.ChatResponseStream,
        command: string | undefined,
        prompt: string,
        response: string
    ): void {
        // Determine what type of code was generated based on command
        const commandMap: Record<string, { title: string; command: string; icon: string }> = {
            'entity': {
                title: 'Create Entity File',
                command: 'stratix.createEntityFromChat',
                icon: '$(file-code)'
            },
            'command': {
                title: 'Create Command File',
                command: 'stratix.createCommandFromChat',
                icon: '$(file-code)'
            },
            'query': {
                title: 'Create Query File',
                command: 'stratix.createQueryFromChat',
                icon: '$(file-code)'
            },
            'vo': {
                title: 'Create Value Object File',
                command: 'stratix.createVOFromChat',
                icon: '$(file-code)'
            },
            'repository': {
                title: 'Create Repository File',
                command: 'stratix.createRepositoryFromChat',
                icon: '$(file-code)'
            },
            'context': {
                title: 'Create Bounded Context',
                command: 'stratix.createContextFromChat',
                icon: '$(folder)'
            }
        };

        const action = commandMap[command || ''];

        if (action) {
            stream.button({
                command: action.command,
                title: `${action.icon} ${action.title}`,
                arguments: [{ prompt, response, command }]
            });
        }
    }

    async rebuildKnowledgeBase(): Promise<void> {
        await this.knowledgeBase.clear();
        await this.knowledgeBase.initialize();
    }
}
