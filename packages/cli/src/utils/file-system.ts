import fs from 'fs-extra';
import path from 'path';

export class FileSystemUtils {
  static async writeFile(filePath: string, content: string): Promise<void> {
    await fs.ensureDir(path.dirname(filePath));
    await fs.writeFile(filePath, content, 'utf-8');
  }

  static async readFile(filePath: string): Promise<string> {
    return fs.readFile(filePath, 'utf-8');
  }

  static async pathExists(filePath: string): Promise<boolean> {
    return fs.pathExists(filePath);
  }

  static async createDirectory(dirPath: string): Promise<void> {
    await fs.ensureDir(dirPath);
  }

  static async findProjectRoot(): Promise<string> {
    let dir = process.cwd();
    while (dir !== path.parse(dir).root) {
      const packageJsonPath = path.join(dir, 'package.json');
      if (await fs.pathExists(packageJsonPath)) {
        return dir;
      }
      dir = path.dirname(dir);
    }
    return process.cwd();
  }

  static async isStratixProject(): Promise<boolean> {
    const configPaths = [
      'stratix.config.ts',
      'stratix.config.js',
      '.stratixrc',
    ];

    for (const configPath of configPaths) {
      if (await fs.pathExists(path.join(process.cwd(), configPath))) {
        return true;
      }
    }

    return false;
  }
}
