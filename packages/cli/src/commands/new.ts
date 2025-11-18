import { Command } from 'commander';
import inquirer from 'inquirer';
import chalk from 'chalk';
import ora from 'ora';
import path from 'path';
import fs from 'fs-extra';
import { ValidationUtils } from '../utils/validation.js';
import { PackageManagerUtils } from '../utils/package-manager.js';
import { ProjectScaffolder } from '../scaffolding/project-scaffolder.js';
import type { NewCommandOptions } from '../types/index.js';

export function createNewCommand(): Command {
  const command = new Command('new');

  command
    .description('Create a new Stratix project')
    .argument('[project-name]', 'Project name')
    .option('--pm <manager>', 'Package manager (npm, pnpm, yarn)')
    .option('--structure <type>', 'Project structure (ddd, modular)', 'ddd')
    .option('--no-git', 'Skip git initialization')
    .option('--skip-install', 'Skip dependency installation')
    .action(async (projectName?: string, options?: NewCommandOptions & { skipInstall?: boolean }) => {
      try {
        console.log(chalk.blue.bold('\n🚀 Create Stratix Project\n'));

        if (!projectName) {
          const answer = await inquirer.prompt<{ name: string }>([
            {
              type: 'input',
              name: 'name',
              message: 'Project name:',
              default: 'my-stratix-app',
              validate: (input: string) => {
                const result = ValidationUtils.validateProjectName(input);
                return result.valid || result.error!;
              },
            },
          ]);
          projectName = answer.name;
        }

        const validation = ValidationUtils.validateProjectName(projectName);
        if (!validation.valid) {
          console.error(chalk.red(`\n✖ ${validation.error}\n`));
          process.exit(1);
        }

        const projectPath = path.join(process.cwd(), projectName);
        if (await fs.pathExists(projectPath)) {
          console.error(chalk.red(`\n✖ Directory "${projectName}" already exists!\n`));
          process.exit(1);
        }

        const answers = await inquirer.prompt([
          {
            type: 'list',
            name: 'packageManager',
            message: 'Package manager:',
            choices: [
              { name: 'pnpm (recommended)', value: 'pnpm' },
              { name: 'npm', value: 'npm' },
              { name: 'yarn', value: 'yarn' },
            ],
            when: !options?.pm,
          },
          {
            type: 'list',
            name: 'structure',
            message: 'Project structure:',
            choices: [
              { name: 'DDD (Domain-Driven Design)', value: 'ddd' },
              { name: 'Modular Monolith', value: 'modular' },
            ],
            default: 'ddd',
            when: !options?.structure,
          },
          {
            type: 'confirm',
            name: 'git',
            message: 'Initialize git repository?',
            default: true,
            when: options?.git !== false,
          },
        ]);

        const packageManager = (options?.pm || answers.packageManager) as 'npm' | 'pnpm' | 'yarn';
        const structure = (options?.structure || answers.structure) as 'ddd' | 'modular';
        const git = options?.git !== false && answers.git !== false;

        const spinner = ora('Creating project...').start();

        const scaffolder = new ProjectScaffolder({
          projectName,
          packageManager,
          structure,
          git,
        });

        await scaffolder.generate();
        spinner.succeed('Project created!');

        if (!options?.skipInstall) {
          spinner.start('Installing dependencies...');
          await PackageManagerUtils.install(packageManager, projectPath);
          spinner.succeed('Dependencies installed!');
        }

        console.log(chalk.green.bold('\n✓ Your Stratix project is ready!\n'));
        console.log(chalk.cyan('Next steps:\n'));
        console.log(chalk.white(`  cd ${projectName}`));
        
        if (options?.skipInstall) {
          console.log(chalk.white(`  ${PackageManagerUtils.getInstallCommand(packageManager)}`));
        }
        
        console.log(chalk.white(`  ${PackageManagerUtils.getRunCommand(packageManager, 'dev')}\n`));
        console.log(chalk.gray('Generate your first bounded context:\n'));
        console.log(chalk.white('  stratix generate context Products --props "name:string,price:number"\n'));
        console.log(chalk.gray('Happy coding! 🎉\n'));

      } catch (error) {
        console.error(chalk.red('\n✖ Failed to create project\n'));
        console.error(error);
        process.exit(1);
      }
    });

  return command;
}
