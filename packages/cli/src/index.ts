import { Command } from 'commander';
import { createNewCommand } from './commands/new.js';
import { createGenerateCommand } from './commands/generate.js';

const program = new Command();

program
  .name('stratix')
  .description('Stratix CLI - Build DDD applications with ease')
  .version('0.1.3');

program.addCommand(createNewCommand());
program.addCommand(createGenerateCommand());

program.parse(process.argv);

export { defineConfig } from './config/config-schema.js';
export type { StratixConfig } from './config/config-schema.js';
