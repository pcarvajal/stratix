import { Command } from 'commander';
import { createNewCommand } from './commands/new.js';
import { createGenerateCommand } from './commands/generate.js';
import { createAddCommand } from './commands/add.js';
import { createInfoCommand } from './commands/info.js';

const program = new Command();

program
  .name('stratix')
  .description('Stratix CLI - Build DDD applications with ease')
  .version('0.1.8');

program.addCommand(createNewCommand());
program.addCommand(createGenerateCommand());
program.addCommand(createAddCommand());
program.addCommand(createInfoCommand());

program.parse(process.argv);

export { defineConfig } from './config/config-schema.js';
export type { StratixConfig } from './config/config-schema.js';
