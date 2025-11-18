import { Command } from 'commander';
import chalk from 'chalk';
import { EntityGenerator } from '../generators/EntityGenerator.js';
import { ValueObjectGenerator } from '../generators/ValueObjectGenerator.js';
import { CommandGenerator } from '../generators/CommandGenerator.js';
import { QueryGenerator } from '../generators/QueryGenerator.js';
import { ContextGenerator } from '../generators/ContextGenerator.js';
import type { GenerateCommandOptions } from '../types/index.js';

export function createGenerateCommand(): Command {
  const command = new Command('generate');

  command
    .alias('g')
    .description('Generate code artifacts');

  command
    .command('context <name>')
    .description('Generate a complete bounded context')
    .option('--props <props>', 'Entity properties (e.g., "name:string,price:number")')
    .option('--dry-run', 'Preview generated files without writing')
    .option('--force', 'Overwrite existing files')
    .action(async (name: string, options: GenerateCommandOptions) => {
      try {
        console.log(chalk.blue.bold('\n📦 Generate Bounded Context\n'));
        
        const generator = new ContextGenerator(name, options);
        await generator.generate();
        
        console.log(chalk.green.bold('\n✓ Bounded Context created!\n'));
        console.log(chalk.gray('The context includes:\n'));
        console.log(chalk.white('  • Domain Entity (AggregateRoot)'));
        console.log(chalk.white('  • Repository interface'));
        console.log(chalk.white('  • Domain Events'));
        console.log(chalk.white('  • CRUD Commands + Handlers'));
        console.log(chalk.white('  • Queries (GetById, List) + Handlers'));
        console.log(chalk.white('  • InMemory Repository implementation'));
        console.log(chalk.white('  • Context Plugin (auto-wiring)\n'));
        console.log(chalk.gray(`Next: Register ${name}ContextPlugin in your ApplicationBuilder\n`));
      } catch (error) {
        console.error(chalk.red('\n✖ Failed to generate context\n'));
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  command
    .command('entity <name>')
    .description('Generate a domain entity or aggregate root')
    .option('--props <props>', 'Properties (e.g., "name:string,age:number")')
    .option('--no-aggregate', 'Generate as Entity instead of AggregateRoot')
    .option('--dry-run', 'Preview generated files without writing')
    .option('--force', 'Overwrite existing files')
    .action(async (name: string, options: GenerateCommandOptions) => {
      try {
        console.log(chalk.blue.bold('\n📦 Generate Entity\n'));
        
        const generator = new EntityGenerator(name, options);
        await generator.generate();
        
        console.log(chalk.gray(`\nNext: Import and use ${name} in your application\n`));
      } catch (error) {
        console.error(chalk.red('\n✖ Failed to generate entity\n'));
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  command
    .command('value-object <name>')
    .alias('vo')
    .description('Generate a domain value object')
    .option('--props <props>', 'Properties (e.g., "street:string,city:string")')
    .option('--dry-run', 'Preview generated files without writing')
    .option('--force', 'Overwrite existing files')
    .action(async (name: string, options: GenerateCommandOptions) => {
      try {
        console.log(chalk.blue.bold('\n📦 Generate Value Object\n'));
        
        const generator = new ValueObjectGenerator(name, options);
        await generator.generate();
        
        console.log(chalk.gray(`\nNext: Use ${name} in your entities\n`));
      } catch (error) {
        console.error(chalk.red('\n✖ Failed to generate value object\n'));
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  command
    .command('command <name>')
    .description('Generate a CQRS command with handler')
    .option('--input <props>', 'Input properties (e.g., "userId:string,amount:number")')
    .option('--props <props>', 'Alias for --input')
    .option('--dry-run', 'Preview generated files without writing')
    .option('--force', 'Overwrite existing files')
    .action(async (name: string, options: GenerateCommandOptions) => {
      try {
        console.log(chalk.blue.bold('\n📦 Generate Command\n'));
        
        const generator = new CommandGenerator(name, options);
        await generator.generate();
        
        console.log(chalk.gray(`\nNext: Register ${name}Handler with your command bus\n`));
      } catch (error) {
        console.error(chalk.red('\n✖ Failed to generate command\n'));
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  command
    .command('query <name>')
    .description('Generate a CQRS query with handler')
    .option('--input <props>', 'Input properties (e.g., "id:string")')
    .option('--output <type>', 'Output type (e.g., "Product" or "Product[]")', 'any')
    .option('--props <props>', 'Alias for --input')
    .option('--dry-run', 'Preview generated files without writing')
    .option('--force', 'Overwrite existing files')
    .action(async (name: string, options: GenerateCommandOptions) => {
      try {
        console.log(chalk.blue.bold('\n📦 Generate Query\n'));
        
        const generator = new QueryGenerator(name, options);
        await generator.generate();
        
        console.log(chalk.gray(`\nNext: Register ${name}Handler with your query bus\n`));
      } catch (error) {
        console.error(chalk.red('\n✖ Failed to generate query\n'));
        console.error(error instanceof Error ? error.message : error);
        process.exit(1);
      }
    });

  return command;
}
