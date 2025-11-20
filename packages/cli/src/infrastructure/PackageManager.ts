import { execa } from 'execa';
import { fileSystem } from './FileSystem.js';
import path from 'path';

/**
 * Package manager type
 */
export type PackageManagerType = 'npm' | 'pnpm' | 'yarn';

/**
 * Package manager service
 * 
 * Provides abstraction over different package managers
 */
export class PackageManager {
    /**
     * Detect package manager from lock file
     */
    async detect(projectRoot: string): Promise<PackageManagerType> {
        const hasPnpmLock = await fileSystem.exists(path.join(projectRoot, 'pnpm-lock.yaml'));
        if (hasPnpmLock) return 'pnpm';

        const hasYarnLock = await fileSystem.exists(path.join(projectRoot, 'yarn.lock'));
        if (hasYarnLock) return 'yarn';

        return 'npm';
    }

    /**
     * Install dependencies
     */
    async install(
        pm: PackageManagerType,
        cwd: string,
        options?: { silent?: boolean }
    ): Promise<void> {
        const command = this.getInstallCommand(pm);

        await execa(command.cmd, command.args, {
            cwd,
            stdio: options?.silent ? 'pipe' : 'inherit'
        });
    }

    /**
     * Add package
     */
    async add(
        pm: PackageManagerType,
        packages: string[],
        cwd: string,
        options?: { dev?: boolean; silent?: boolean }
    ): Promise<void> {
        const command = this.getAddCommand(pm, packages, options?.dev);

        await execa(command.cmd, command.args, {
            cwd,
            stdio: options?.silent ? 'pipe' : 'inherit'
        });
    }

    /**
     * Remove package
     */
    async remove(
        pm: PackageManagerType,
        packages: string[],
        cwd: string,
        options?: { silent?: boolean }
    ): Promise<void> {
        const command = this.getRemoveCommand(pm, packages);

        await execa(command.cmd, command.args, {
            cwd,
            stdio: options?.silent ? 'pipe' : 'inherit'
        });
    }

    /**
     * Run script
     */
    async run(
        pm: PackageManagerType,
        script: string,
        cwd: string,
        options?: { silent?: boolean }
    ): Promise<void> {
        const command = this.getRunCommand(pm, script);

        await execa(command.cmd, command.args, {
            cwd,
            stdio: options?.silent ? 'pipe' : 'inherit'
        });
    }

    /**
     * Get install command
     */
    private getInstallCommand(pm: PackageManagerType): { cmd: string; args: string[] } {
        switch (pm) {
            case 'pnpm':
                return { cmd: 'pnpm', args: ['install'] };
            case 'yarn':
                return { cmd: 'yarn', args: ['install'] };
            case 'npm':
            default:
                return { cmd: 'npm', args: ['install'] };
        }
    }

    /**
     * Get add command
     */
    private getAddCommand(
        pm: PackageManagerType,
        packages: string[],
        dev?: boolean
    ): { cmd: string; args: string[] } {
        switch (pm) {
            case 'pnpm':
                return {
                    cmd: 'pnpm',
                    args: ['add', ...(dev ? ['-D'] : []), ...packages]
                };
            case 'yarn':
                return {
                    cmd: 'yarn',
                    args: ['add', ...(dev ? ['--dev'] : []), ...packages]
                };
            case 'npm':
            default:
                return {
                    cmd: 'npm',
                    args: ['install', ...(dev ? ['--save-dev'] : []), ...packages]
                };
        }
    }

    /**
     * Get remove command
     */
    private getRemoveCommand(
        pm: PackageManagerType,
        packages: string[]
    ): { cmd: string; args: string[] } {
        switch (pm) {
            case 'pnpm':
                return { cmd: 'pnpm', args: ['remove', ...packages] };
            case 'yarn':
                return { cmd: 'yarn', args: ['remove', ...packages] };
            case 'npm':
            default:
                return { cmd: 'npm', args: ['uninstall', ...packages] };
        }
    }

    /**
     * Get run command
     */
    private getRunCommand(pm: PackageManagerType, script: string): { cmd: string; args: string[] } {
        switch (pm) {
            case 'pnpm':
                return { cmd: 'pnpm', args: ['run', script] };
            case 'yarn':
                return { cmd: 'yarn', args: ['run', script] };
            case 'npm':
            default:
                return { cmd: 'npm', args: ['run', script] };
        }
    }

    /**
     * Get install command string (for display)
     */
    getInstallCommandString(pm: PackageManagerType): string {
        switch (pm) {
            case 'pnpm':
                return 'pnpm install';
            case 'yarn':
                return 'yarn install';
            case 'npm':
            default:
                return 'npm install';
        }
    }

    /**
     * Get run command string (for display)
     */
    getRunCommandString(pm: PackageManagerType, script: string): string {
        switch (pm) {
            case 'pnpm':
                return `pnpm run ${script}`;
            case 'yarn':
                return `yarn run ${script}`;
            case 'npm':
            default:
                return `npm run ${script}`;
        }
    }
}

/**
 * Singleton instance
 */
export const packageManager = new PackageManager();
