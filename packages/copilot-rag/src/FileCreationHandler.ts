import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs/promises';

interface ChatContext {
    prompt: string;
    response: string;
    command?: string;
}

export class FileCreationHandler {
    /**
     * Extract code blocks from markdown response
     */
    private extractCodeBlocks(markdown: string): { language: string; code: string }[] {
        const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
        const blocks: { language: string; code: string }[] = [];

        let match;
        while ((match = codeBlockRegex.exec(markdown)) !== null) {
            blocks.push({
                language: match[1] || 'typescript',
                code: match[2].trim()
            });
        }

        return blocks;
    }

    /**
     * Extract entity name from prompt or code
     */
    private extractEntityName(prompt: string, code: string): string | undefined {
        // Try to extract from prompt first
        const promptMatch = prompt.match(/entity\s+(\w+)/i) || prompt.match(/create\s+(\w+)\s+entity/i);
        if (promptMatch) {
            return promptMatch[1];
        }

        // Try to extract from code
        const codeMatch = code.match(/class\s+(\w+)\s+extends\s+Entity/);
        if (codeMatch) {
            return codeMatch[1];
        }

        return undefined;
    }

    /**
     * Extract class name from code
     */
    private extractClassName(code: string): string | undefined {
        const match = code.match(/(?:export\s+)?class\s+(\w+)/);
        return match ? match[1] : undefined;
    }

    /**
     * Determine file path based on project structure
     */
    private async determineFilePath(
        fileName: string,
        type: 'entity' | 'command' | 'query' | 'vo' | 'repository' | 'context'
    ): Promise<string> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder open');
        }

        const basePath = workspaceFolder.uri.fsPath;

        // Check if DDD or modular structure
        const srcPath = path.join(basePath, 'src');
        const domainPath = path.join(srcPath, 'domain');

        try {
            await fs.access(domainPath);
            // DDD structure
            const typeMap: Record<string, string> = {
                'entity': path.join(domainPath, 'entities'),
                'command': path.join(domainPath, 'commands'),
                'query': path.join(domainPath, 'queries'),
                'vo': path.join(domainPath, 'value-objects'),
                'repository': path.join(domainPath, 'repositories'),
                'context': srcPath
            };

            return path.join(typeMap[type], fileName);
        } catch {
            // Modular structure or fallback to src
            return path.join(srcPath, fileName);
        }
    }

    /**
     * Create entity file from chat
     */
    async createEntityFromChat(context: ChatContext): Promise<void> {
        const codeBlocks = this.extractCodeBlocks(context.response);

        if (codeBlocks.length === 0) {
            vscode.window.showErrorMessage('No code blocks found in response');
            return;
        }

        const code = codeBlocks[0].code;
        const entityName = this.extractEntityName(context.prompt, code);

        if (!entityName) {
            vscode.window.showErrorMessage('Could not determine entity name');
            return;
        }

        const fileName = `${entityName}.ts`;
        const filePath = await this.determineFilePath(fileName, 'entity');

        await this.createFile(filePath, code);
    }

    /**
     * Create command file from chat
     */
    async createCommandFromChat(context: ChatContext): Promise<void> {
        const codeBlocks = this.extractCodeBlocks(context.response);

        if (codeBlocks.length === 0) {
            vscode.window.showErrorMessage('No code blocks found in response');
            return;
        }

        const code = codeBlocks[0].code;
        const className = this.extractClassName(code);

        if (!className) {
            vscode.window.showErrorMessage('Could not determine command name');
            return;
        }

        const fileName = `${className}.ts`;
        const filePath = await this.determineFilePath(fileName, 'command');

        await this.createFile(filePath, code);
    }

    /**
     * Create query file from chat
     */
    async createQueryFromChat(context: ChatContext): Promise<void> {
        const codeBlocks = this.extractCodeBlocks(context.response);

        if (codeBlocks.length === 0) {
            vscode.window.showErrorMessage('No code blocks found in response');
            return;
        }

        const code = codeBlocks[0].code;
        const className = this.extractClassName(code);

        if (!className) {
            vscode.window.showErrorMessage('Could not determine query name');
            return;
        }

        const fileName = `${className}.ts`;
        const filePath = await this.determineFilePath(fileName, 'query');

        await this.createFile(filePath, code);
    }

    /**
     * Create value object file from chat
     */
    async createVOFromChat(context: ChatContext): Promise<void> {
        const codeBlocks = this.extractCodeBlocks(context.response);

        if (codeBlocks.length === 0) {
            vscode.window.showErrorMessage('No code blocks found in response');
            return;
        }

        const code = codeBlocks[0].code;
        const className = this.extractClassName(code);

        if (!className) {
            vscode.window.showErrorMessage('Could not determine value object name');
            return;
        }

        const fileName = `${className}.ts`;
        const filePath = await this.determineFilePath(fileName, 'vo');

        await this.createFile(filePath, code);
    }

    /**
     * Create repository file from chat
     */
    async createRepositoryFromChat(context: ChatContext): Promise<void> {
        const codeBlocks = this.extractCodeBlocks(context.response);

        if (codeBlocks.length === 0) {
            vscode.window.showErrorMessage('No code blocks found in response');
            return;
        }

        const code = codeBlocks[0].code;
        const className = this.extractClassName(code);

        if (!className) {
            vscode.window.showErrorMessage('Could not determine repository name');
            return;
        }

        const fileName = `${className}.ts`;
        const filePath = await this.determineFilePath(fileName, 'repository');

        await this.createFile(filePath, code);
    }

    /**
     * Save code from chat (generic)
     */
    async saveCodeFromChat(context: ChatContext): Promise<void> {
        const codeBlocks = this.extractCodeBlocks(context.response);

        if (codeBlocks.length === 0) {
            vscode.window.showErrorMessage('No code blocks found in response');
            return;
        }

        // Let user choose file name and location
        const fileName = await vscode.window.showInputBox({
            prompt: 'Enter file name',
            placeHolder: 'MyClass.ts',
            validateInput: (value) => {
                if (!value) {
                    return 'File name is required';
                }
                if (!value.endsWith('.ts') && !value.endsWith('.js')) {
                    return 'File must end with .ts or .js';
                }
                return null;
            }
        });

        if (!fileName) {
            return;
        }

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            vscode.window.showErrorMessage('No workspace folder open');
            return;
        }

        const defaultUri = vscode.Uri.joinPath(workspaceFolder.uri, 'src', fileName);
        const fileUri = await vscode.window.showSaveDialog({
            defaultUri,
            filters: {
                'TypeScript': ['ts'],
                'JavaScript': ['js']
            }
        });

        if (!fileUri) {
            return;
        }

        const code = codeBlocks[0].code;
        await this.createFile(fileUri.fsPath, code);
    }

    /**
     * Create file with content
     */
    private async createFile(filePath: string, content: string): Promise<void> {
        try {
            // Ensure directory exists
            const dir = path.dirname(filePath);
            await fs.mkdir(dir, { recursive: true });

            // Check if file already exists
            try {
                await fs.access(filePath);
                const overwrite = await vscode.window.showWarningMessage(
                    `File ${path.basename(filePath)} already exists. Overwrite?`,
                    'Yes',
                    'No'
                );

                if (overwrite !== 'Yes') {
                    return;
                }
            } catch {
                // File doesn't exist, continue
            }

            // Write file
            await fs.writeFile(filePath, content, 'utf-8');

            // Open file in editor
            const document = await vscode.workspace.openTextDocument(filePath);
            await vscode.window.showTextDocument(document);

            vscode.window.showInformationMessage(`✅ Created ${path.basename(filePath)}`);
        } catch (error) {
            vscode.window.showErrorMessage(
                `Failed to create file: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }
}
