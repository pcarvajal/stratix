import path from 'path';
import chalk from 'chalk';
import ora from 'ora';
import { FileSystemUtils } from '../utils/file-system.js';
import { NamingUtils } from '../utils/naming.js';
import type { GeneratedFile, ProjectStructure } from '../types/index.js';

export abstract class BaseGenerator {
  protected naming = NamingUtils;

  constructor(protected projectRoot: string = process.cwd()) {}

  abstract generate(): Promise<GeneratedFile[]>;

  protected async detectProjectStructure(): Promise<ProjectStructure> {
    const sourceRoot = path.join(this.projectRoot, 'src');
    
    const hasDomainFolder = await FileSystemUtils.pathExists(path.join(sourceRoot, 'domain'));
    const hasContextsFolder = await FileSystemUtils.pathExists(path.join(sourceRoot, 'contexts'));

    if (hasContextsFolder) {
      return {
        type: 'modular',
        basePath: this.projectRoot,
        sourceRoot,
        contextsPath: path.join(sourceRoot, 'contexts'),
      };
    }

    if (hasDomainFolder) {
      return {
        type: 'ddd',
        basePath: this.projectRoot,
        sourceRoot,
        domainPath: path.join(sourceRoot, 'domain'),
        applicationPath: path.join(sourceRoot, 'application'),
        infrastructurePath: path.join(sourceRoot, 'infrastructure'),
      };
    }

    return {
      type: 'unknown',
      basePath: this.projectRoot,
      sourceRoot,
    };
  }

  protected async writeFiles(files: GeneratedFile[], dryRun = false): Promise<void> {
    const spinner = ora('Generating files...').start();

    try {
      for (const file of files) {
        if (dryRun || file.action === 'dry-run') {
          spinner.info(chalk.gray(`Would create: ${file.path}`));
          continue;
        }

        if (file.action === 'skip') {
          spinner.info(chalk.yellow(`Skipped: ${file.path} (already exists)`));
          continue;
        }

        await FileSystemUtils.writeFile(file.path, file.content);
        spinner.succeed(chalk.green(`Created: ${file.path}`));
        spinner.start();
      }

      spinner.stop();
      console.log(chalk.green.bold(`\n✓ Generated ${files.length} file(s)\n`));
    } catch (error) {
      spinner.fail('Failed to generate files');
      throw error;
    }
  }

  protected async fileExists(filePath: string): Promise<boolean> {
    return FileSystemUtils.pathExists(filePath);
  }

  protected getRelativePath(absolutePath: string): string {
    return path.relative(this.projectRoot, absolutePath);
  }
}
