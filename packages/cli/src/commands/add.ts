import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { execSync } from 'child_process';
import { existsSync } from 'fs';

interface ExtensionInfo {
  package: string;
  description: string;
  dependencies?: string[];
}

const EXTENSIONS: Record<string, ExtensionInfo> = {
  postgres: {
    package: '@stratix/db-postgres',
    description: 'PostgreSQL database integration',
    dependencies: ['pg', '@types/pg'],
  },
  mongodb: {
    package: '@stratix/db-mongodb',
    description: 'MongoDB database integration',
    dependencies: ['mongodb'],
  },
  redis: {
    package: '@stratix/db-redis',
    description: 'Redis caching and session store',
    dependencies: ['redis'],
  },
  rabbitmq: {
    package: '@stratix/msg-rabbitmq',
    description: 'RabbitMQ message broker',
    dependencies: ['amqplib', '@types/amqplib'],
  },
  http: {
    package: '@stratix/http-fastify',
    description: 'Fastify HTTP server',
    dependencies: ['fastify'],
  },
  validation: {
    package: '@stratix/validation-zod',
    description: 'Zod-based validation',
    dependencies: ['zod'],
  },
  auth: {
    package: '@stratix/auth',
    description: 'JWT authentication and RBAC',
    dependencies: ['jsonwebtoken', 'bcrypt', '@types/jsonwebtoken', '@types/bcrypt'],
  },
  mappers: {
    package: '@stratix/mappers',
    description: 'Entity to DTO mapping utilities',
  },
  errors: {
    package: '@stratix/errors',
    description: 'Structured error handling',
  },
  opentelemetry: {
    package: '@stratix/obs-opentelemetry',
    description: 'OpenTelemetry observability',
    dependencies: ['@opentelemetry/api', '@opentelemetry/sdk-node'],
  },
  secrets: {
    package: '@stratix/secrets',
    description: 'Secrets management',
  },
  'ai-openai': {
    package: '@stratix/ai-openai',
    description: 'OpenAI LLM provider',
    dependencies: ['openai'],
  },
  'ai-anthropic': {
    package: '@stratix/ai-anthropic',
    description: 'Anthropic Claude provider',
    dependencies: ['@anthropic-ai/sdk'],
  },
};

function detectPackageManager(): string {
  if (existsSync('pnpm-lock.yaml')) return 'pnpm';
  if (existsSync('yarn.lock')) return 'yarn';
  if (existsSync('package-lock.json')) return 'npm';
  return 'npm';
}

function getInstallCommand(pm: string, packages: string[]): string {
  const pkgList = packages.join(' ');
  switch (pm) {
    case 'pnpm':
      return `pnpm add ${pkgList}`;
    case 'yarn':
      return `yarn add ${pkgList}`;
    default:
      return `npm install ${pkgList}`;
  }
}

export function createAddCommand(): Command {
  const command = new Command('add');

  command
    .description('Add Stratix extensions to your project')
    .argument('<extension>', 'Extension name (e.g., postgres, redis, http)')
    .option('--dev', 'Install as dev dependency')
    .action((extensionName: string, options: { dev?: boolean }) => {
      const extension = EXTENSIONS[extensionName];

      if (!extension) {
        console.error(chalk.red(`\nUnknown extension: ${extensionName}\n`));
        console.log(chalk.gray('Available extensions:\n'));
        Object.entries(EXTENSIONS).forEach(([name, info]) => {
          console.log(chalk.white(`  ${name.padEnd(15)} - ${info.description}`));
        });
        console.log();
        process.exit(1);
      }

      const spinner = ora(
        `Installing ${chalk.cyan(extension.package)}...`
      ).start();

      try {
        const pm = detectPackageManager();
        const packages = [extension.package];

        if (extension.dependencies) {
          packages.push(...extension.dependencies);
        }

        const installCmd = getInstallCommand(pm, packages);
        const devFlag = options.dev ? ' --save-dev' : '';

        execSync(`${installCmd}${devFlag}`, {
          stdio: 'inherit',
          cwd: process.cwd(),
        });

        spinner.succeed(
          chalk.green(`Installed ${chalk.cyan(extension.package)}`)
        );

        console.log(chalk.gray('\nNext steps:\n'));
        console.log(
          chalk.white(`  1. Import the plugin in your main file`)
        );
        console.log(
          chalk.white(`  2. Add to ApplicationBuilder with .usePlugin()`)
        );
        console.log(
          chalk.white(
            `  3. Configure plugin options (see documentation)\n`
          )
        );
      } catch (error) {
        spinner.fail(chalk.red('Installation failed'));
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  command
    .command('list')
    .alias('ls')
    .description('List all available Stratix extensions')
    .action(() => {
      console.log(chalk.blue.bold('\nAvailable Stratix Extensions\n'));

      console.log(chalk.yellow.bold('Production Extensions:'));
      ['http', 'validation', 'mappers', 'auth', 'migrations', 'errors'].forEach(
        (name) => {
          const ext = EXTENSIONS[name];
          console.log(
            chalk.white(`  ${name.padEnd(15)} - ${ext.description}`)
          );
        }
      );

      console.log(chalk.yellow.bold('\nData & Infrastructure:'));
      ['postgres', 'mongodb', 'redis', 'rabbitmq', 'opentelemetry', 'secrets'].forEach(
        (name) => {
          const ext = EXTENSIONS[name];
          console.log(
            chalk.white(`  ${name.padEnd(15)} - ${ext.description}`)
          );
        }
      );

      console.log(chalk.yellow.bold('\nAI Providers:'));
      ['ai-openai', 'ai-anthropic'].forEach((name) => {
        const ext = EXTENSIONS[name];
        console.log(
          chalk.white(`  ${name.padEnd(15)} - ${ext.description}`)
        );
      });

      console.log(
        chalk.gray('\nUsage: stratix add <extension>\n')
      );
    });

  return command;
}
