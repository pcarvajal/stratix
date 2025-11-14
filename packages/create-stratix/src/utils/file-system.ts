import fs from 'fs-extra';
import path from 'path';

export interface WriteFileOptions {
  force?: boolean;
  dryRun?: boolean;
}

export class FileSystemUtils {
  static async ensureDir(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
  }

  static async writeFile(
    filePath: string,
    content: string,
    options: WriteFileOptions = {}
  ): Promise<'created' | 'skipped' | 'dry-run'> {
    const { force = false, dryRun = false } = options;

    if (dryRun) {
      return 'dry-run';
    }

    const exists = await fs.pathExists(filePath);

    if (exists && !force) {
      return 'skipped';
    }

    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');

    return 'created';
  }

  static async readFile(filePath: string): Promise<string> {
    return await fs.readFile(filePath, 'utf-8');
  }

  static async pathExists(filePath: string): Promise<boolean> {
    return await fs.pathExists(filePath);
  }

  static async findProjectRoot(): Promise<string> {
    let currentDir = process.cwd();

    while (currentDir !== path.parse(currentDir).root) {
      const packageJsonPath = path.join(currentDir, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        return currentDir;
      }
      currentDir = path.dirname(currentDir);
    }

    throw new Error('Could not find project root (package.json not found)');
  }

  static async findDirectory(startPath: string, targetDir: string): Promise<string | null> {
    const dirs = await fs.readdir(startPath, { withFileTypes: true });

    for (const dir of dirs) {
      if (dir.isDirectory()) {
        const fullPath = path.join(startPath, dir.name);
        if (dir.name === targetDir) {
          return fullPath;
        }

        if (dir.name !== 'node_modules' && dir.name !== 'dist') {
          const found = await this.findDirectory(fullPath, targetDir);
          if (found) return found;
        }
      }
    }

    return null;
  }
}
