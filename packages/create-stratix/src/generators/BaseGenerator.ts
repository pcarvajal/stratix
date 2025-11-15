import ejs from 'ejs';
import path from 'path';
import chalk from 'chalk';
import ora, { Ora } from 'ora';
import { GeneratorOptions, GeneratedFile, ProjectStructure } from '../types/generator.js';
import { FileSystemUtils } from '../utils/file-system.js';
import { NamingUtils } from '../utils/naming.js';

export abstract class BaseGenerator {
  protected options: GeneratorOptions;
  protected naming = NamingUtils;
  protected fs = FileSystemUtils;
  protected spinner?: Ora;

  constructor(options: GeneratorOptions) {
    this.options = options;
  }

  async generate(): Promise<GeneratedFile[]> {
    this.spinner = ora('Generating...').start();

    try {
      this.validate();

      const structure = await this.detectProjectStructure();

      const files = await this.generateFiles(structure);

      if (!this.options.dryRun) {
        await this.writeFiles(files);
      }

      this.spinner.succeed('Generation complete!');

      this.showSummary(files);

      return files;
    } catch (error) {
      this.spinner.fail('Generation failed');
      throw error;
    }
  }

  protected abstract validate(): void;

  protected abstract generateFiles(structure: ProjectStructure): Promise<GeneratedFile[]>;

  protected async detectProjectStructure(): Promise<ProjectStructure> {
    const projectRoot = await this.fs.findProjectRoot();

    const hasDomainFolder = await this.fs.pathExists(path.join(projectRoot, 'src/domain'));
    const hasApplicationFolder = await this.fs.pathExists(
      path.join(projectRoot, 'src/application')
    );
    const hasContextsFolder = await this.fs.pathExists(path.join(projectRoot, 'src/contexts'));

    if (hasContextsFolder) {
      return {
        type: 'modular-monolith',
        basePath: projectRoot,
        contextsPath: path.join(projectRoot, 'src/contexts'),
      };
    }

    if (hasDomainFolder && hasApplicationFolder) {
      return {
        type: 'ddd',
        basePath: projectRoot,
        domainPath: path.join(projectRoot, 'src/domain'),
        applicationPath: path.join(projectRoot, 'src/application'),
        infrastructurePath: path.join(projectRoot, 'src/infrastructure'),
      };
    }

    return {
      type: 'unknown',
      basePath: projectRoot,
    };
  }

  protected async renderTemplate(templateName: string, data: Record<string, any>): Promise<string> {
    const templatePath = this.getTemplatePath(templateName);
    const template = await this.fs.readFile(templatePath);
    return ejs.render(template, data);
  }

  protected abstract getTemplatePath(templateName: string): string;

  protected async writeFiles(files: GeneratedFile[]): Promise<void> {
    for (const file of files) {
      if (file.action === 'skip') continue;

      const action = await this.fs.writeFile(file.path, file.content, {
        force: this.options.force,
        dryRun: this.options.dryRun,
      });

      file.action = action === 'created' ? 'create' : action === 'dry-run' ? 'dry-run' : 'skip';
    }
  }

  protected showSummary(files: GeneratedFile[]): void {
    console.log(chalk.bold('\nGenerated files:'));

    for (const file of files) {
      const icon =
        file.action === 'create'
          ? chalk.green('✓')
          : file.action === 'update'
            ? chalk.yellow('↻')
            : file.action === 'dry-run'
              ? chalk.blue('○')
              : chalk.gray('○');

      const relativePath = path.relative(process.cwd(), file.path);
      console.log(`  ${icon} ${relativePath}`);
    }

    const created = files.filter((f) => f.action === 'create').length;
    const skipped = files.filter((f) => f.action === 'skip').length;
    const dryRun = files.filter((f) => f.action === 'dry-run').length;

    if (this.options.dryRun) {
      console.log(chalk.dim(`\n${dryRun} files would be created (dry-run mode)\n`));
    } else {
      console.log(chalk.dim(`\n${created} created, ${skipped} skipped\n`));
    }
  }

  protected getDestinationPath(...segments: string[]): string {
    if (this.options.destination) {
      return path.join(this.options.destination, ...segments);
    }
    return path.join(process.cwd(), ...segments);
  }
}
