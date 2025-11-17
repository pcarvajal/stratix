import { program } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { execa } from 'execa';
import validateProjectName from 'validate-npm-package-name';
import { createGenerateCommand } from './commands/generate.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

interface ProjectOptions {
  name: string;
  template:
    | 'rest-api'
    | 'rest-api-complete'
    | 'microservice'
    | 'worker'
    | 'minimal'
    | 'ai-agent-starter'
    | 'monolith'
    | 'modular-monolith';
  packageManager: 'npm' | 'pnpm' | 'yarn';
  git: boolean;
}

interface CommandOptions {
  template?:
    | 'rest-api'
    | 'rest-api-complete'
    | 'microservice'
    | 'worker'
    | 'minimal'
    | 'ai-agent-starter'
    | 'monolith'
    | 'modular-monolith';
  pm?: 'npm' | 'pnpm' | 'yarn';
  git?: boolean;
  skipInstall?: boolean;
}

export async function run(): Promise<void> {
  console.log(chalk.blue.bold('\nWelcome to Stratix!\n'));
  console.log(chalk.gray("Let's create your new application\n"));

  program
    .name('create-stratix')
    .description('Create a new Stratix application')
    .version('0.1.2')
    .argument('[project-name]', 'Project name')
    .option(
      '--template <template>',
      'Template to use (rest-api|rest-api-complete|microservice|worker|monolith|modular-monolith|ai-agent-starter|minimal)'
    )
    .option('--pm <manager>', 'Package manager (npm|pnpm|yarn)')
    .option('--no-git', 'Skip git initialization')
    .option('--skip-install', 'Skip dependency installation')
    .action(async (projectName?: string, options?: CommandOptions) => {
      await createProject(projectName, options);
    });

  // Add generate command
  program.addCommand(createGenerateCommand());

  await program.parseAsync(process.argv);
}

async function createProject(projectName?: string, cmdOptions?: CommandOptions): Promise<void> {
  // Ask for project name if not provided
  if (!projectName) {
    const nameAnswer = await inquirer.prompt<{ name: string }>([
      {
        type: 'input',
        name: 'name',
        message: 'What is your project named?',
        default: 'my-stratix-app',
        validate: (input: string) => {
          const validation = validateProjectName(input);
          if (!validation.validForNewPackages) {
            const errors = [...(validation.errors || []), ...(validation.warnings || [])];
            return `Invalid project name: ${errors.join(', ')}`;
          }
          return true;
        },
      },
    ]);
    projectName = nameAnswer.name;
  }

  // Validate project name
  const validation = validateProjectName(projectName);
  if (!validation.validForNewPackages) {
    const errors = [...(validation.errors || []), ...(validation.warnings || [])];
    console.error(chalk.red(`\nInvalid project name: ${errors.join(', ')}\n`));
    process.exit(1);
  }

  // Check if directory exists
  const projectPath = path.join(process.cwd(), projectName);
  if (await fs.pathExists(projectPath)) {
    console.error(chalk.red(`\nDirectory "${projectName}" already exists!\n`));
    process.exit(1);
  }

  // Interactive prompts
  const answers = await inquirer.prompt<Omit<ProjectOptions, 'name'>>([
    {
      type: 'list',
      name: 'template',
      message: 'Which template would you like to use?',
      choices: [
        {
          name: 'REST API Complete - Production-ready REST API with all production extensions',
          value: 'rest-api-complete',
        },
        {
          name: 'REST API - Complete REST API with authentication',
          value: 'rest-api',
        },
        {
          name: 'Microservice - Service with message queue',
          value: 'microservice',
        },
        {
          name: 'Modular Monolith - Bounded Contexts as Plugins (monolith to microservices)',
          value: 'modular-monolith',
        },
        {
          name: 'Monolith - Modular monolith with bounded contexts',
          value: 'monolith',
        },
        {
          name: 'Worker - Background job processor',
          value: 'worker',
        },
        {
          name: 'AI Agent Starter - Learn AI agents step by step',
          value: 'ai-agent-starter',
        },
        {
          name: 'Minimal - Bare minimum setup',
          value: 'minimal',
        },
      ],
      when: !cmdOptions?.template,
    },
    {
      type: 'list',
      name: 'packageManager',
      message: 'Which package manager do you want to use?',
      choices: [
        { name: 'pnpm (recommended)', value: 'pnpm' },
        { name: 'npm', value: 'npm' },
        { name: 'yarn', value: 'yarn' },
      ],
      when: !cmdOptions?.pm,
    },
    {
      type: 'confirm',
      name: 'git',
      message: 'Initialize git repository?',
      default: true,
      when: cmdOptions?.git !== false,
    },
  ]);

  const options: ProjectOptions = {
    name: projectName,
    template: (cmdOptions?.template || answers.template) as
      | 'rest-api'
      | 'microservice'
      | 'worker'
      | 'minimal'
      | 'ai-agent-starter',
    packageManager: (cmdOptions?.pm || answers.packageManager) as 'npm' | 'pnpm' | 'yarn',
    git: cmdOptions?.git !== false && answers.git !== false,
  };

  // Create project
  const spinner = ora('Creating project...').start();

  try {
    await createProjectFromTemplate(projectPath, options);
    spinner.succeed('Project created!');

    // Install dependencies
    if (options.packageManager && !cmdOptions?.skipInstall) {
      spinner.start('Installing dependencies...');
      await installDependencies(projectPath, options.packageManager);
      spinner.succeed('Dependencies installed!');
    }

    // Initialize git
    if (options.git) {
      spinner.start('Initializing git repository...');
      await initGit(projectPath);
      spinner.succeed('Git initialized!');
    }

    // Success message
    console.log(chalk.green.bold('\nYour Stratix app is ready!\n'));
    console.log(chalk.cyan('Next steps:\n'));
    console.log(chalk.white(`  cd ${projectName}`));

    if (options.template === 'ai-agent-starter') {
      console.log(chalk.white(`  ${options.packageManager} start\n`));
      console.log(chalk.gray('This will show an interactive menu to run each AI agent example.'));
      console.log(chalk.gray('Start with Level 1 (Echo Agent) - no API key needed!\n'));
    } else {
      console.log(chalk.white(`  ${options.packageManager} run dev\n`));
    }

    console.log(chalk.gray('Happy coding!\n'));
  } catch (error) {
    spinner.fail('Failed to create project');
    console.error(chalk.red('\n'), error);
    process.exit(1);
  }
}

async function removeTsNocheck(projectPath: string): Promise<void> {
  const walk = async (dir: string): Promise<string[]> => {
    const files = await fs.readdir(dir);
    const results: string[] = [];

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);

      if (stat.isDirectory()) {
        if (file !== 'node_modules' && file !== 'dist') {
          results.push(...(await walk(filePath)));
        }
      } else if (file.endsWith('.ts')) {
        results.push(filePath);
      }
    }

    return results;
  };

  const tsFiles = await walk(projectPath);

  for (const filePath of tsFiles) {
    let content = await fs.readFile(filePath, 'utf-8');
    // Remove @ts-nocheck comment (with or without newline)
    content = content.replace(/^\/\/ @ts-nocheck\n?/m, '');
    await fs.writeFile(filePath, content, 'utf-8');
  }
}

async function createProjectFromTemplate(
  projectPath: string,
  options: ProjectOptions
): Promise<void> {
  // Create project directory
  await fs.mkdirp(projectPath);

  // Copy template
  const templatePath = path.join(__dirname, '../templates', options.template);

  // Check if template exists
  if (!(await fs.pathExists(templatePath))) {
    // Fallback to minimal template if specific template doesn't exist
    const minimalPath = path.join(__dirname, '../templates', 'minimal');
    if (await fs.pathExists(minimalPath)) {
      await fs.copy(minimalPath, projectPath);
    } else {
      // Generate minimal template if no templates exist
      await generateMinimalTemplate(projectPath, options);
    }
  } else {
    await fs.copy(templatePath, projectPath);
  }

  // Remove @ts-nocheck from all TypeScript files
  await removeTsNocheck(projectPath);

  // Update package.json with project name
  const packageJsonPath = path.join(projectPath, 'package.json');
  if (await fs.pathExists(packageJsonPath)) {
    const packageJson = (await fs.readJson(packageJsonPath)) as Record<string, unknown>;
    packageJson.name = options.name;
    await fs.writeJson(packageJsonPath, packageJson, { spaces: 2 });
  }

  // Create .gitignore
  const gitignore = `node_modules/
dist/
.env
.env.local
*.log
.DS_Store
coverage/
`;
  await fs.writeFile(path.join(projectPath, '.gitignore'), gitignore);
}

async function generateMinimalTemplate(
  projectPath: string,
  options: ProjectOptions
): Promise<void> {
  // Create directory structure
  const dirs = [
    'src/domain/entities',
    'src/domain/repositories',
    'src/application/commands',
    'src/application/queries',
    'src/infrastructure/persistence',
    'tests',
  ];

  for (const dir of dirs) {
    await fs.mkdirp(path.join(projectPath, dir));
  }

  // Create package.json
  const packageJson = {
    name: options.name,
    version: '0.1.0',
    type: 'module',
    scripts: {
      dev: 'tsx watch src/index.ts',
      build: 'tsc',
      start: 'node dist/index.js',
      test: 'vitest',
      lint: 'eslint src',
      format: 'prettier --write "src/**/*.ts"',
    },
    dependencies: {
      '@stratix/primitives': '^0.1.0',
      '@stratix/abstractions': '^0.1.0',
      '@stratix/runtime': '^0.1.0',
      '@stratix/impl-di-awilix': '^0.1.0',
      '@stratix/impl-logger-console': '^0.1.0',
      '@stratix/impl-cqrs-inmemory': '^0.1.0',
    },
    devDependencies: {
      '@types/node': '^20.0.0',
      typescript: '^5.3.0',
      tsx: '^4.7.0',
      vitest: '^1.0.0',
      eslint: '^8.0.0',
      prettier: '^3.0.0',
    },
  };

  await fs.writeJson(path.join(projectPath, 'package.json'), packageJson, { spaces: 2 });

  // Create tsconfig.json
  const tsConfig = {
    compilerOptions: {
      target: 'ES2022',
      module: 'ES2022',
      lib: ['ES2022'],
      moduleResolution: 'node',
      esModuleInterop: true,
      strict: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      outDir: './dist',
      rootDir: './src',
      declaration: true,
      sourceMap: true,
    },
    include: ['src'],
    exclude: ['node_modules', 'dist'],
  };

  await fs.writeJson(path.join(projectPath, 'tsconfig.json'), tsConfig, { spaces: 2 });

  // Create src/index.ts
  const indexContent = `import { ApplicationBuilder } from '@stratix/runtime';
import { AwilixContainer } from '@stratix/impl-di-awilix';
import { ConsoleLogger } from '@stratix/impl-logger-console';

async function bootstrap() {
  const container = new AwilixContainer();
  const logger = new ConsoleLogger();

  const app = await ApplicationBuilder.create()
    .useContainer(container)
    .useLogger(logger)
    .build();

  await app.start();

  console.log('${options.name} is running!');

  // Graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\\nShutting down...');
    await app.stop();
    process.exit(0);
  });
}

bootstrap().catch((error) => {
  console.error('Failed to start application:', error);
  process.exit(1);
});
`;

  await fs.writeFile(path.join(projectPath, 'src/index.ts'), indexContent);

  // Create README.md
  const readme = `# ${options.name}

A Stratix application

## Getting Started

\`\`\`bash
${options.packageManager} install
${options.packageManager} run dev
\`\`\`

## Project Structure

\`\`\`
src/
├── domain/           # Domain layer (entities, value objects, repositories)
├── application/      # Application layer (use cases, commands, queries)
└── infrastructure/   # Infrastructure layer (persistence, http, external services)
\`\`\`

## Available Scripts

- \`${options.packageManager} run dev\` - Start development server
- \`${options.packageManager} run build\` - Build for production
- \`${options.packageManager} start\` - Start production server
- \`${options.packageManager} test\` - Run tests
- \`${options.packageManager} run lint\` - Lint code
- \`${options.packageManager} run format\` - Format code

## Learn More

- [Stratix Documentation](https://stratix.dev/docs)
- [Examples](https://github.com/stratix/examples)
`;

  await fs.writeFile(path.join(projectPath, 'README.md'), readme);
}

async function checkPackageManagerInstalled(packageManager: string): Promise<boolean> {
  try {
    await execa(packageManager, ['--version'], { stdio: 'pipe' });
    return true;
  } catch {
    return false;
  }
}

async function installDependencies(projectPath: string, packageManager: string): Promise<void> {
  const isInstalled = await checkPackageManagerInstalled(packageManager);

  if (!isInstalled) {
    const installCommands: Record<string, string> = {
      npm: 'npm is bundled with Node.js',
      pnpm: 'npm install -g pnpm',
      yarn: 'npm install -g yarn',
    };

    throw new Error(
      `${packageManager} is not installed.\n` +
        `To install it, run: ${installCommands[packageManager] || `npm install -g ${packageManager}`}`
    );
  }

  await execa(packageManager, ['install'], {
    cwd: projectPath,
    stdio: 'pipe',
  });
}

async function initGit(projectPath: string): Promise<void> {
  await execa('git', ['init'], { cwd: projectPath });
  await execa('git', ['add', '-A'], { cwd: projectPath });
  await execa('git', ['commit', '-m', 'Initial commit from create-stratix'], { cwd: projectPath });
}
