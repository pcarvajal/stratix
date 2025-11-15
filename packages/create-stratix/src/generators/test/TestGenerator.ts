import path from 'path';
import { BaseGenerator } from '../BaseGenerator.js';
import { TestGeneratorOptions, GeneratedFile, ProjectStructure } from '../../types/generator.js';
import { FileSystemUtils } from '../../utils/file-system.js';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class TestGenerator extends BaseGenerator {
  private testOptions: TestGeneratorOptions;

  constructor(options: TestGeneratorOptions) {
    super(options);
    this.testOptions = options;
  }

  protected validate(): void {
    if (!this.testOptions.target) {
      throw new Error('Target file path is required for test generation');
    }

    if (!this.testOptions.type) {
      this.testOptions.type = 'unit';
    }

    const validTypes = ['unit', 'integration', 'e2e'];
    if (!validTypes.includes(this.testOptions.type)) {
      throw new Error(`Invalid test type. Must be one of: ${validTypes.join(', ')}`);
    }
  }

  protected async generateFiles(_structure: ProjectStructure): Promise<GeneratedFile[]> {
    const files: GeneratedFile[] = [];

    // Detect what kind of file we're testing
    const targetInfo = await this.analyzeTarget();

    const templateData = {
      targetName: targetInfo.name,
      targetNameCamel: this.naming.toCamelCase(targetInfo.name),
      targetType: targetInfo.type,
      testType: this.testOptions.type,
      targetPath: this.getRelativeImportPath(targetInfo),
      imports: this.generateImports(targetInfo),
      naming: this.naming,
    };

    files.push({
      path: this.getTestPath(targetInfo),
      content: await this.renderTemplate(`test-${this.testOptions.type}.ts.ejs`, templateData),
      action: 'create',
    });

    return files;
  }

  protected getTemplatePath(templateName: string): string {
    return path.join(__dirname, 'templates', templateName);
  }

  private async analyzeTarget(): Promise<TargetInfo> {
    const target = this.testOptions.target;
    const projectRoot = await FileSystemUtils.findProjectRoot();
    const fullPath = path.isAbsolute(target) ? target : path.join(projectRoot, target);

    // Check if file exists
    if (!(await FileSystemUtils.pathExists(fullPath))) {
      throw new Error(`Target file not found: ${target}`);
    }

    // Extract name and type from path
    const fileName = path.basename(fullPath, path.extname(fullPath));
    const dirName = path.dirname(fullPath);

    let type: TargetType = 'class';

    // Detect type based on directory and file name
    if (dirName.includes('entities')) {
      type = 'entity';
    } else if (dirName.includes('value-objects')) {
      type = 'value-object';
    } else if (dirName.includes('commands') || fileName.includes('Handler')) {
      type = 'handler';
    } else if (dirName.includes('queries') || fileName.includes('Handler')) {
      type = 'handler';
    } else if (dirName.includes('repositories')) {
      type = 'repository';
    } else if (dirName.includes('services')) {
      type = 'service';
    }

    return {
      name: fileName,
      type,
      path: fullPath,
      relativePath: path.relative(projectRoot, fullPath),
    };
  }

  private getRelativeImportPath(targetInfo: TargetInfo): string {
    const testPath = this.getTestPath(targetInfo);
    const targetPath = targetInfo.path;

    const relative = path.relative(path.dirname(testPath), path.dirname(targetPath));
    const importPath = path.join(relative, path.basename(targetInfo.path, '.ts'));

    return importPath.startsWith('.') ? importPath : `./${importPath}`;
  }

  private generateImports(targetInfo: TargetInfo): string[] {
    const imports: string[] = [];

    switch (targetInfo.type) {
      case 'entity':
      case 'value-object':
        imports.push(
          `import { ${targetInfo.name} } from '${this.getRelativeImportPath(targetInfo)}.js';`
        );
        break;
      case 'handler':
        imports.push(
          `import { ${targetInfo.name} } from '${this.getRelativeImportPath(targetInfo)}.js';`
        );
        break;
      case 'repository':
        imports.push(
          `import { ${targetInfo.name} } from '${this.getRelativeImportPath(targetInfo)}.js';`
        );
        break;
      case 'service':
        imports.push(
          `import { ${targetInfo.name} } from '${this.getRelativeImportPath(targetInfo)}.js';`
        );
        break;
      default:
        imports.push(
          `import { ${targetInfo.name} } from '${this.getRelativeImportPath(targetInfo)}.js';`
        );
    }

    return imports;
  }

  private getTestPath(targetInfo: TargetInfo): string {
    const targetDir = path.dirname(targetInfo.path);
    const fileName = `${targetInfo.name}.test.ts`;

    // Place test in __tests__ directory next to target
    return path.join(targetDir, '__tests__', fileName);
  }
}

type TargetType = 'entity' | 'value-object' | 'handler' | 'repository' | 'service' | 'class';

interface TargetInfo {
  name: string;
  type: TargetType;
  path: string;
  relativePath: string;
}
