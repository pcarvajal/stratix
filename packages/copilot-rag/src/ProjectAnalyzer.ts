import * as vscode from 'vscode';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface ProjectContext {
    structure: 'ddd' | 'modular' | 'unknown';
    boundedContexts: string[];
    entities: string[];
    commands: string[];
    queries: string[];
    stratixPackages: string[];
    hasStratixConfig: boolean;
}

export class ProjectAnalyzer {
    async analyze(): Promise<ProjectContext> {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            return this.emptyContext();
        }

        const rootPath = workspaceFolder.uri.fsPath;

        try {
            const [structure, boundedContexts, entities, commands, queries, stratixPackages, hasStratixConfig] =
                await Promise.all([
                    this.detectStructure(rootPath),
                    this.findBoundedContexts(rootPath),
                    this.findEntities(rootPath),
                    this.findCommands(rootPath),
                    this.findQueries(rootPath),
                    this.findStratixPackages(rootPath),
                    this.hasStratixConfig(rootPath)
                ]);

            return {
                structure,
                boundedContexts,
                entities,
                commands,
                queries,
                stratixPackages,
                hasStratixConfig
            };
        } catch (error) {
            console.error('Error analyzing project:', error);
            return this.emptyContext();
        }
    }

    private emptyContext(): ProjectContext {
        return {
            structure: 'unknown',
            boundedContexts: [],
            entities: [],
            commands: [],
            queries: [],
            stratixPackages: [],
            hasStratixConfig: false
        };
    }

    private async detectStructure(rootPath: string): Promise<'ddd' | 'modular' | 'unknown'> {
        const srcPath = path.join(rootPath, 'src');

        try {
            const entries = await fs.readdir(srcPath);

            if (entries.includes('contexts')) {
                return 'modular';
            }

            if (entries.includes('domain') && entries.includes('application')) {
                return 'ddd';
            }

            return 'unknown';
        } catch {
            return 'unknown';
        }
    }

    private async findBoundedContexts(rootPath: string): Promise<string[]> {
        const contextsPath = path.join(rootPath, 'src', 'contexts');

        try {
            const entries = await fs.readdir(contextsPath, { withFileTypes: true });
            return entries.filter(e => e.isDirectory()).map(e => e.name);
        } catch {
            return [];
        }
    }

    private async findEntities(rootPath: string): Promise<string[]> {
        return this.findFilesByPattern(rootPath, /\.entity\.(ts|js)$/);
    }

    private async findCommands(rootPath: string): Promise<string[]> {
        return this.findFilesByPattern(rootPath, /\.command\.(ts|js)$/);
    }

    private async findQueries(rootPath: string): Promise<string[]> {
        return this.findFilesByPattern(rootPath, /\.query\.(ts|js)$/);
    }

    private async findFilesByPattern(rootPath: string, pattern: RegExp): Promise<string[]> {
        const srcPath = path.join(rootPath, 'src');
        const files: string[] = [];

        try {
            await this.walkDirectory(srcPath, async (filePath) => {
                if (pattern.test(filePath)) {
                    const name = path.basename(filePath, path.extname(filePath));
                    files.push(name);
                }
            });
        } catch {
            // Ignore errors
        }

        return files;
    }

    private async walkDirectory(dir: string, callback: (filePath: string) => Promise<void>): Promise<void> {
        try {
            const entries = await fs.readdir(dir, { withFileTypes: true });

            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);

                if (entry.isDirectory()) {
                    if (entry.name !== 'node_modules' && entry.name !== 'dist') {
                        await this.walkDirectory(fullPath, callback);
                    }
                } else {
                    await callback(fullPath);
                }
            }
        } catch {
            // Ignore errors
        }
    }

    private async findStratixPackages(rootPath: string): Promise<string[]> {
        const pkgPath = path.join(rootPath, 'package.json');

        try {
            const content = await fs.readFile(pkgPath, 'utf-8');
            const pkg = JSON.parse(content);
            const allDeps = {
                ...pkg.dependencies,
                ...pkg.devDependencies
            };

            return Object.keys(allDeps)
                .filter(name => name.startsWith('@stratix/'))
                .sort();
        } catch {
            return [];
        }
    }

    private async hasStratixConfig(rootPath: string): Promise<boolean> {
        const configPath = path.join(rootPath, 'stratix.config.js');

        try {
            await fs.access(configPath);
            return true;
        } catch {
            return false;
        }
    }
}
