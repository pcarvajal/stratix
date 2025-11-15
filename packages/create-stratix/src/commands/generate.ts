import { Command } from 'commander';
import chalk from 'chalk';
import { EntityGenerator } from '../generators/entity/EntityGenerator.js';
import { ValueObjectGenerator } from '../generators/value-object/ValueObjectGenerator.js';
import { UseCaseGenerator } from '../generators/use-case/UseCaseGenerator.js';
import { RepositoryGenerator } from '../generators/repository/RepositoryGenerator.js';
import { TestGenerator } from '../generators/test/TestGenerator.js';
import { ContextGenerator } from '../generators/context/ContextGenerator.js';

export function createGenerateCommand(): Command {
  const generate = new Command('generate').alias('g').description('Generate code artifacts');

  // Subcommand: entity
  generate
    .command('entity <name>')
    .description('Generate a domain entity or aggregate root')
    .option('--props <props>', 'Entity properties (e.g., "name:string,price:number")')
    .option('--aggregate', 'Generate as AggregateRoot (default: true)', true)
    .option('--no-aggregate', 'Generate as Entity instead of AggregateRoot')
    .option('--with-event <eventName>', 'Generate domain event (e.g., "ProductCreated")')
    .option('--with-tests', 'Generate test file', false)
    .option('--skip-validation', 'Skip validation in business methods', false)
    .option('--dry-run', 'Show what would be generated without writing files', false)
    .option('--force', 'Overwrite existing files', false)
    .option('--destination <path>', 'Destination directory (default: auto-detect)')
    .action(async (name: string, options: any) => {
      try {
        console.log(chalk.blue.bold('\nGenerating entity...\n'));

        const generator = new EntityGenerator({
          name,
          aggregate: options.aggregate,
          props: options.props,
          withEvent: options.withEvent,
          withTests: options.withTests,
          skipValidation: options.skipValidation,
          dryRun: options.dryRun,
          force: options.force,
          destination: options.destination,
        });

        await generator.generate();

        if (!options.dryRun) {
          console.log(chalk.green.bold('Entity generated successfully!\n'));

          if (options.withTests) {
            console.log(chalk.dim('Next steps:'));
            console.log(chalk.dim('  1. Review the generated files'));
            console.log(chalk.dim('  2. Run tests: pnpm test'));
            console.log(chalk.dim('  3. Implement custom business logic\n'));
          }
        }
      } catch (error) {
        console.error(chalk.red('\nError:'), (error as Error).message);
        console.error(chalk.dim('\nStack trace:'), (error as Error).stack);
        process.exit(1);
      }
    });

  // Subcommand: value-object
  generate
    .command('value-object <name>')
    .description('Generate a domain value object')
    .option(
      '--props <props>',
      'Value object properties (e.g., "value:string" or "amount:number,currency:string")'
    )
    .option('--with-validation', 'Add validation logic in create method', false)
    .option('--with-tests', 'Generate test file', false)
    .option('--dry-run', 'Show what would be generated without writing files', false)
    .option('--force', 'Overwrite existing files', false)
    .option('--destination <path>', 'Destination directory (default: auto-detect)')
    .action(async (name: string, options: any) => {
      try {
        console.log(chalk.blue.bold('\nGenerating value object...\n'));

        const generator = new ValueObjectGenerator({
          name,
          props: options.props,
          withValidation: options.withValidation,
          withTests: options.withTests,
          dryRun: options.dryRun,
          force: options.force,
          destination: options.destination,
        });

        await generator.generate();

        if (!options.dryRun) {
          console.log(chalk.green.bold('Value object generated successfully!\n'));

          if (options.withTests) {
            console.log(chalk.dim('Next steps:'));
            console.log(chalk.dim('  1. Review the generated files'));
            console.log(chalk.dim('  2. Run tests: pnpm test'));
            console.log(chalk.dim('  3. Add custom validation if needed\n'));
          }
        }
      } catch (error) {
        console.error(chalk.red('\nError:'), (error as Error).message);
        console.error(chalk.dim('\nStack trace:'), (error as Error).stack);
        process.exit(1);
      }
    });

  // Subcommand: use-case (command)
  generate
    .command('command <name>')
    .description('Generate a CQRS command with handler')
    .option(
      '--input <props>',
      'Command input properties (e.g., "productId:string,quantity:number")'
    )
    .option('--output <props>', 'Command output properties (e.g., "orderId:string")')
    .option('--with-tests', 'Generate test file', false)
    .option('--dry-run', 'Show what would be generated without writing files', false)
    .option('--force', 'Overwrite existing files', false)
    .option('--destination <path>', 'Destination directory (default: auto-detect)')
    .action(async (name: string, options: any) => {
      try {
        console.log(chalk.blue.bold('\nGenerating command...\n'));

        const generator = new UseCaseGenerator({
          name,
          type: 'command',
          input: options.input,
          output: options.output,
          withTests: options.withTests,
          dryRun: options.dryRun,
          force: options.force,
          destination: options.destination,
        });

        await generator.generate();

        if (!options.dryRun) {
          console.log(chalk.green.bold('Command generated successfully!\n'));

          if (options.withTests) {
            console.log(chalk.dim('Next steps:'));
            console.log(chalk.dim('  1. Review the generated files'));
            console.log(chalk.dim('  2. Implement the business logic'));
            console.log(chalk.dim('  3. Run tests: pnpm test\n'));
          }
        }
      } catch (error) {
        console.error(chalk.red('\nError:'), (error as Error).message);
        console.error(chalk.dim('\nStack trace:'), (error as Error).stack);
        process.exit(1);
      }
    });

  // Subcommand: use-case (query)
  generate
    .command('query <name>')
    .description('Generate a CQRS query with handler')
    .option('--input <props>', 'Query input properties (e.g., "userId:string,limit:number")')
    .option('--output <props>', 'Query output properties (e.g., "items:Product[],total:number")')
    .option('--with-tests', 'Generate test file', false)
    .option('--dry-run', 'Show what would be generated without writing files', false)
    .option('--force', 'Overwrite existing files', false)
    .option('--destination <path>', 'Destination directory (default: auto-detect)')
    .action(async (name: string, options: any) => {
      try {
        console.log(chalk.blue.bold('\nGenerating query...\n'));

        const generator = new UseCaseGenerator({
          name,
          type: 'query',
          input: options.input,
          output: options.output,
          withTests: options.withTests,
          dryRun: options.dryRun,
          force: options.force,
          destination: options.destination,
        });

        await generator.generate();

        if (!options.dryRun) {
          console.log(chalk.green.bold('Query generated successfully!\n'));

          if (options.withTests) {
            console.log(chalk.dim('Next steps:'));
            console.log(chalk.dim('  1. Review the generated files'));
            console.log(chalk.dim('  2. Implement the query logic'));
            console.log(chalk.dim('  3. Run tests: pnpm test\n'));
          }
        }
      } catch (error) {
        console.error(chalk.red('\nError:'), (error as Error).message);
        console.error(chalk.dim('\nStack trace:'), (error as Error).stack);
        process.exit(1);
      }
    });

  // Subcommand: repository
  generate
    .command('repository <name>')
    .description('Generate a repository interface and implementation(s)')
    .option('--entity <entityName>', 'Entity name (required)', '')
    .option(
      '--impl <implementations>',
      'Implementations (comma-separated: inmemory,postgres,mongodb)',
      'inmemory'
    )
    .option('--with-tests', 'Generate test files', false)
    .option('--dry-run', 'Show what would be generated without writing files', false)
    .option('--force', 'Overwrite existing files', false)
    .option('--destination <path>', 'Destination directory (default: auto-detect)')
    .action(async (name: string, options: any) => {
      try {
        console.log(chalk.blue.bold('\nGenerating repository...\n'));

        if (!options.entity) {
          console.error(chalk.red('Error: --entity option is required'));
          console.log(
            chalk.dim('Example: stratix g repository ProductRepository --entity Product')
          );
          process.exit(1);
        }

        const implementations = options.impl
          .split(',')
          .map((impl: string) => impl.trim())
          .filter((impl: string) => impl.length > 0);

        const generator = new RepositoryGenerator({
          name,
          entityName: options.entity,
          implementations,
          withTests: options.withTests,
          dryRun: options.dryRun,
          force: options.force,
          destination: options.destination,
        });

        await generator.generate();

        if (!options.dryRun) {
          console.log(chalk.green.bold('Repository generated successfully!\n'));

          if (options.withTests) {
            console.log(chalk.dim('Next steps:'));
            console.log(chalk.dim('  1. Review the generated files'));
            console.log(chalk.dim('  2. Implement the mapping methods'));
            console.log(chalk.dim('  3. Run tests: pnpm test\n'));
          }
        }
      } catch (error) {
        console.error(chalk.red('\nError:'), (error as Error).message);
        console.error(chalk.dim('\nStack trace:'), (error as Error).stack);
        process.exit(1);
      }
    });

  // Subcommand: test
  generate
    .command('test <target>')
    .description('Generate test file for existing code')
    .option('--type <type>', 'Test type (unit|integration|e2e)', 'unit')
    .option('--dry-run', 'Show what would be generated without writing files', false)
    .option('--force', 'Overwrite existing test file', false)
    .action(async (target: string, options: any) => {
      try {
        console.log(chalk.blue.bold('\nGenerating test...\n'));

        const generator = new TestGenerator({
          name: target,
          target,
          type: options.type as 'unit' | 'integration' | 'e2e',
          dryRun: options.dryRun,
          force: options.force,
        });

        await generator.generate();

        if (!options.dryRun) {
          console.log(chalk.green.bold('Test generated successfully!\n'));
          console.log(chalk.dim('Next steps:'));
          console.log(chalk.dim('  1. Review the generated test file'));
          console.log(chalk.dim('  2. Implement test cases'));
          console.log(chalk.dim('  3. Run tests: pnpm test\n'));
        }
      } catch (error) {
        console.error(chalk.red('\nError:'), (error as Error).message);
        console.error(chalk.dim('\nStack trace:'), (error as Error).stack);
        process.exit(1);
      }
    });

  // Subcommand: context
  generate
    .command('context <name>')
    .description('Generate a complete Bounded Context with ContextModule')
    .option('--props <props>', 'Entity properties (e.g., "name:string,price:number")')
    .option('--with-tests', 'Generate test files', false)
    .option('--dry-run', 'Show what would be generated without writing files', false)
    .option('--force', 'Overwrite existing files', false)
    .option('--destination <path>', 'Destination directory (default: auto-detect)')
    .action(async (name: string, options: any) => {
      try {
        console.log(chalk.blue.bold('\nGenerating Bounded Context...\n'));

        const generator = new ContextGenerator({
          name,
          props: options.props,
          withTests: options.withTests,
          dryRun: options.dryRun,
          force: options.force,
          destination: options.destination,
        });

        await generator.generate();

        if (!options.dryRun) {
          console.log(chalk.green.bold('Bounded Context generated successfully!\n'));
          console.log(chalk.dim('Generated files:'));
          console.log(chalk.dim('  - Domain layer (entity, repository, events)'));
          console.log(chalk.dim('  - Application layer (commands, queries, handlers)'));
          console.log(chalk.dim('  - Infrastructure layer (in-memory repository)'));
          console.log(chalk.dim(`  - ${name}ContextModule (auto-wiring all components)\n`));
          console.log(chalk.dim('Next steps:'));
          console.log(chalk.dim('  1. Review the generated files'));
          console.log(chalk.dim('  2. Register the context module in your application:'));
          console.log(chalk.dim(`     app.useContext(new ${name}ContextModule())`));
          console.log(chalk.dim('  3. Customize business logic in the domain layer'));
          console.log(chalk.dim('  4. Add more commands/queries as needed\n'));
        }
      } catch (error) {
        console.error(chalk.red('\nError:'), (error as Error).message);
        console.error(chalk.dim('\nStack trace:'), (error as Error).stack);
        process.exit(1);
      }
    });

  // Help for generate command
  generate.on('--help', () => {
    console.log('');
    console.log('Examples:');
    console.log('  $ stratix generate entity Product');
    console.log('  $ stratix g entity Product --props "name:string,price:number"');
    console.log('  $ stratix g entity Product --with-event ProductCreated --with-tests');
    console.log('  $ stratix g entity Order --props "total:number,items:OrderItem[]"');
    console.log('');
    console.log('  $ stratix generate value-object Email --props "value:string" --with-validation');
    console.log(
      '  $ stratix g value-object Money --props "amount:number,currency:string" --with-tests'
    );
    console.log(
      '  $ stratix g value-object Price --props "value:number" --with-validation --with-tests'
    );
    console.log('');
    console.log(
      '  $ stratix generate command CreateProduct --input "name:string,price:number" --with-tests'
    );
    console.log(
      '  $ stratix g command PlaceOrder --input "productId:string,quantity:number" --output "orderId:string"'
    );
    console.log(
      '  $ stratix g query GetProductById --input "id:string" --output "product:Product" --with-tests'
    );
    console.log('  $ stratix g query ListProducts --output "products:Product[]"');
    console.log('');
    console.log('  $ stratix generate repository ProductRepository --entity Product --with-tests');
    console.log(
      '  $ stratix g repository ProductRepository --entity Product --impl postgres,inmemory'
    );
    console.log(
      '  $ stratix g repository OrderRepository --entity Order --impl mongodb --with-tests'
    );
    console.log('');
    console.log('  $ stratix generate test src/domain/entities/Product.ts');
    console.log(
      '  $ stratix g test src/application/commands/CreateProductHandler.ts --type integration'
    );
    console.log('  $ stratix g test src/infrastructure/http/ProductController.ts --type e2e');
    console.log('');
    console.log('  $ stratix generate context Products --props "name:string,price:number"');
    console.log('  $ stratix g context Orders --props "total:number,status:string" --with-tests');
    console.log('  $ stratix g context Inventory --props "sku:string,quantity:number"');
    console.log('');
  });

  return generate;
}
