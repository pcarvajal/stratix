import { execa } from 'execa';
import { fileSystem } from './FileSystem.js';
import path from 'path';

/**
 * Git service
 * 
 * Provides abstraction over git operations
 */
export class Git {
    /**
     * Check if git is available
     */
    async isAvailable(): Promise<boolean> {
        try {
            await execa('git', ['--version']);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Initialize git repository
     */
    async init(cwd: string): Promise<void> {
        await execa('git', ['init'], { cwd });
    }

    /**
     * Check if directory is a git repository
     */
    async isRepository(cwd: string): Promise<boolean> {
        const gitDir = path.join(cwd, '.git');
        return await fileSystem.exists(gitDir);
    }

    /**
     * Add files to staging
     */
    async add(files: string[], cwd: string): Promise<void> {
        await execa('git', ['add', ...files], { cwd });
    }

    /**
     * Add all files
     */
    async addAll(cwd: string): Promise<void> {
        await execa('git', ['add', '.'], { cwd });
    }

    /**
     * Commit changes
     */
    async commit(message: string, cwd: string): Promise<void> {
        await execa('git', ['commit', '-m', message], { cwd });
    }

    /**
     * Get current branch
     */
    async getCurrentBranch(cwd: string): Promise<string> {
        const { stdout } = await execa('git', ['branch', '--show-current'], { cwd });
        return stdout.trim();
    }

    /**
     * Get git status
     */
    async status(cwd: string): Promise<string> {
        const { stdout } = await execa('git', ['status', '--short'], { cwd });
        return stdout;
    }

    /**
     * Check if working directory is clean
     */
    async isClean(cwd: string): Promise<boolean> {
        const status = await this.status(cwd);
        return status.trim() === '';
    }
}

/**
 * Singleton instance
 */
export const git = new Git();
