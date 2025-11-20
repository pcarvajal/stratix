import { promises as fs } from 'fs';
import path from 'path';

/**
 * File system service
 * 
 * Provides a clean abstraction over Node.js file system operations
 */
export class FileSystem {
    /**
     * Read file content
     */
    async readFile(filePath: string): Promise<string> {
        return await fs.readFile(filePath, 'utf-8');
    }

    /**
     * Write file content
     */
    async writeFile(filePath: string, content: string): Promise<void> {
        // Ensure directory exists
        const dir = path.dirname(filePath);
        await this.ensureDir(dir);

        await fs.writeFile(filePath, content, 'utf-8');
    }

    /**
     * Check if path exists
     */
    async exists(filePath: string): Promise<boolean> {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Create directory (recursive by default)
     */
    async mkdir(dirPath: string, recursive = true): Promise<void> {
        await fs.mkdir(dirPath, { recursive });
    }

    /**
     * Ensure directory exists
     */
    async ensureDir(dirPath: string): Promise<void> {
        if (!(await this.exists(dirPath))) {
            await this.mkdir(dirPath, true);
        }
    }

    /**
     * Copy file or directory
     */
    async copy(src: string, dest: string): Promise<void> {
        const stats = await fs.stat(src);

        if (stats.isDirectory()) {
            await this.copyDir(src, dest);
        } else {
            await this.copyFile(src, dest);
        }
    }

    /**
     * Copy file
     */
    private async copyFile(src: string, dest: string): Promise<void> {
        await this.ensureDir(path.dirname(dest));
        await fs.copyFile(src, dest);
    }

    /**
     * Copy directory recursively
     */
    private async copyDir(src: string, dest: string): Promise<void> {
        await this.ensureDir(dest);
        const entries = await fs.readdir(src, { withFileTypes: true });

        for (const entry of entries) {
            const srcPath = path.join(src, entry.name);
            const destPath = path.join(dest, entry.name);

            if (entry.isDirectory()) {
                await this.copyDir(srcPath, destPath);
            } else {
                await this.copyFile(srcPath, destPath);
            }
        }
    }

    /**
     * Remove file or directory
     */
    async remove(filePath: string): Promise<void> {
        const exists = await this.exists(filePath);
        if (!exists) return;

        const stats = await fs.stat(filePath);

        if (stats.isDirectory()) {
            await fs.rm(filePath, { recursive: true, force: true });
        } else {
            await fs.unlink(filePath);
        }
    }

    /**
     * Read directory
     */
    async readDir(dirPath: string): Promise<string[]> {
        return await fs.readdir(dirPath);
    }

    /**
     * Get file stats
     */
    async stat(filePath: string): Promise<{
        isFile: boolean;
        isDirectory: boolean;
        size: number;
        mtime: Date;
    }> {
        const stats = await fs.stat(filePath);
        return {
            isFile: stats.isFile(),
            isDirectory: stats.isDirectory(),
            size: stats.size,
            mtime: stats.mtime
        };
    }
}

/**
 * Singleton instance
 */
export const fileSystem = new FileSystem();
