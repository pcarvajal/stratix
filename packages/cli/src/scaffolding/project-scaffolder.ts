import path from 'path';
import { FileSystemUtils } from '../utils/file-system.js';
import type { PackageManager } from '../utils/package-manager.js';
import {
  packageJsonTemplate,
  tsconfigTemplate,
  indexTemplate,
  stratixConfigTemplate,
  stratixCliTypesTemplate,
  gitignoreTemplate,
  readmeTemplate,
  type ProjectTemplateData,
} from './templates.js';
import { execa } from 'execa';

export interface ProjectScaffolderOptions {
  projectName: string;
  packageManager: PackageManager;
  structure: 'ddd' | 'modular';
  git: boolean;
}

export class ProjectScaffolder {
  constructor(private options: ProjectScaffolderOptions) {}

  async generate(): Promise<void> {
    const { projectName, packageManager } = this.options;
    const projectPath = path.join(process.cwd(), projectName);

    const templateData: ProjectTemplateData = {
      projectName,
      packageManager,
    };

    await FileSystemUtils.createDirectory(projectPath);

    await this.createProjectFiles(projectPath, templateData);

    await this.createDirectoryStructure(projectPath);

    if (this.options.git) {
      await this.initGit(projectPath);
    }
  }

  private async createProjectFiles(projectPath: string, data: ProjectTemplateData): Promise<void> {
    await FileSystemUtils.writeFile(
      path.join(projectPath, 'package.json'),
      packageJsonTemplate(data)
    );

    await FileSystemUtils.writeFile(
      path.join(projectPath, 'tsconfig.json'),
      tsconfigTemplate()
    );

    await FileSystemUtils.writeFile(
      path.join(projectPath, 'src', 'index.ts'),
      indexTemplate(data)
    );

    await FileSystemUtils.writeFile(
      path.join(projectPath, 'stratix.config.ts'),
      stratixConfigTemplate()
    );

    await FileSystemUtils.writeFile(
      path.join(projectPath, '.gitignore'),
      gitignoreTemplate()
    );

    await FileSystemUtils.writeFile(
      path.join(projectPath, 'README.md'),
      readmeTemplate(data)
    );

    await FileSystemUtils.writeFile(
      path.join(projectPath, 'src', 'types', 'stratix-cli.d.ts'),
      stratixCliTypesTemplate()
    );
  }

  private async createDirectoryStructure(projectPath: string): Promise<void> {
    if (this.options.structure === 'ddd') {
      await FileSystemUtils.createDirectory(path.join(projectPath, 'src', 'domain', 'entities'));
      await FileSystemUtils.createDirectory(path.join(projectPath, 'src', 'domain', 'value-objects'));
      await FileSystemUtils.createDirectory(path.join(projectPath, 'src', 'domain', 'repositories'));
      await FileSystemUtils.createDirectory(path.join(projectPath, 'src', 'application', 'commands'));
      await FileSystemUtils.createDirectory(path.join(projectPath, 'src', 'application', 'queries'));
      await FileSystemUtils.createDirectory(path.join(projectPath, 'src', 'infrastructure', 'persistence'));
      
      await FileSystemUtils.writeFile(path.join(projectPath, 'src', 'domain', 'entities', '.gitkeep'), '');
      await FileSystemUtils.writeFile(path.join(projectPath, 'src', 'domain', 'value-objects', '.gitkeep'), '');
      await FileSystemUtils.writeFile(path.join(projectPath, 'src', 'domain', 'repositories', '.gitkeep'), '');
      await FileSystemUtils.writeFile(path.join(projectPath, 'src', 'application', 'commands', '.gitkeep'), '');
      await FileSystemUtils.writeFile(path.join(projectPath, 'src', 'application', 'queries', '.gitkeep'), '');
      await FileSystemUtils.writeFile(path.join(projectPath, 'src', 'infrastructure', 'persistence', '.gitkeep'), '');
    } else {
      await FileSystemUtils.createDirectory(path.join(projectPath, 'src', 'contexts'));
      await FileSystemUtils.writeFile(path.join(projectPath, 'src', 'contexts', '.gitkeep'), '');
    }

    await FileSystemUtils.createDirectory(path.join(projectPath, 'test'));
    await FileSystemUtils.writeFile(path.join(projectPath, 'test', '.gitkeep'), '');
  }

  private async initGit(projectPath: string): Promise<void> {
    try {
      await execa('git', ['init'], { cwd: projectPath });
      await execa('git', ['add', '-A'], { cwd: projectPath });
      await execa('git', ['commit', '-m', 'Initial commit'], { cwd: projectPath });
    } catch (error) {
      console.warn('Warning: Could not initialize git repository');
    }
  }
}
