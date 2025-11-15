// @ts-nocheck
import inquirer from 'inquirer';
import chalk from 'chalk';
import { runEchoExample } from './agents/01-echo/index.js';
import { runMockExample } from './agents/02-mock/index.js';

/**
 * Example definition
 */
interface Example {
  id: string;
  name: string;
  description: string;
  free: boolean;
  duration: string;
  run: () => Promise<void>;
}

/**
 * All available examples
 */
const examples: Example[] = [
  {
    id: 'echo',
    name: 'Level 1: Echo Agent',
    description: 'Learn agent fundamentals without LLM',
    free: true,
    duration: '5 min',
    run: runEchoExample,
  },
  {
    id: 'mock',
    name: 'Level 2: Mock Agent',
    description: 'Learn testing with mock LLM provider',
    free: true,
    duration: '10 min',
    run: runMockExample,
  },
  {
    id: 'basic',
    name: 'Level 3: Basic LLM',
    description: 'First real LLM integration (requires API key)',
    free: false,
    duration: '15 min',
    run: async () => {
      console.log('\n' + chalk.yellow('Level 3 coming soon!'));
      console.log('\nThis level will teach you:');
      console.log('- Setting up a real LLM provider (OpenAI/Anthropic)');
      console.log('- Making your first LLM API call');
      console.log('- Understanding costs and tokens');
      console.log('- Basic prompt engineering\n');
    },
  },
  {
    id: 'tools',
    name: 'Level 4: Agent with Tools',
    description: 'Create tools for your agents (requires API key)',
    free: false,
    duration: '20 min',
    run: async () => {
      console.log('\n' + chalk.yellow('Level 4 coming soon!'));
      console.log('\nThis level will teach you:');
      console.log('- Creating custom tools');
      console.log('- Tool calling patterns');
      console.log('- Function calling with LLMs');
      console.log('- Complex workflows\n');
    },
  },
  {
    id: 'memory',
    name: 'Level 5: Agent with Memory',
    description: 'Add memory to maintain context (requires API key)',
    free: false,
    duration: '20 min',
    run: async () => {
      console.log('\n' + chalk.yellow('Level 5 coming soon!'));
      console.log('\nThis level will teach you:');
      console.log('- Short-term memory (session)');
      console.log('- Long-term memory (persistent)');
      console.log('- Context management');
      console.log('- Memory stores\n');
    },
  },
  {
    id: 'production',
    name: 'Level 6: Production Agent',
    description: 'Complete production-ready agent (requires API key)',
    free: false,
    duration: '30 min',
    run: async () => {
      console.log('\n' + chalk.yellow('Level 6 coming soon!'));
      console.log('\nThis level will teach you:');
      console.log('- Error handling and retries');
      console.log('- Budget enforcement');
      console.log('- Monitoring and observability');
      console.log('- Production best practices\n');
    },
  },
];

/**
 * Show welcome message
 */
function showWelcome() {
  console.clear();
  console.log(chalk.blue.bold('\n╔════════════════════════════════════════════════════════╗'));
  console.log(chalk.blue.bold('║          Stratix AI Agents - Learning Path            ║'));
  console.log(chalk.blue.bold('╚════════════════════════════════════════════════════════╝\n'));
  console.log(chalk.gray('Learn AI agents step by step, from basics to production.\n'));
}

/**
 * Show example info
 */
function formatExample(example: Example): string {
  const badge = example.free ? chalk.green('[FREE]') : chalk.yellow('[API KEY REQUIRED]');

  return `${example.name} ${badge} (${example.duration})`;
}

/**
 * Show completion message
 */
function showCompletion(example: Example) {
  console.log('\n' + chalk.green.bold('════════════════════════════════════════════════════════'));
  console.log(chalk.green.bold(`✓ ${example.name} completed!`));
  console.log(chalk.green.bold('════════════════════════════════════════════════════════\n'));
}

/**
 * Main menu
 */
async function showMenu(): Promise<void> {
  showWelcome();

  const { exampleId } = await inquirer.prompt<{ exampleId: string }>([
    {
      type: 'list',
      name: 'exampleId',
      message: 'Which example would you like to run?',
      choices: [
        ...examples.map((ex) => ({
          name: formatExample(ex),
          value: ex.id,
        })),
        new inquirer.Separator(),
        {
          name: chalk.gray('Exit'),
          value: 'exit',
        },
      ],
    },
  ]);

  if (exampleId === 'exit') {
    console.log('\n' + chalk.gray('Thanks for learning with Stratix! Happy coding!\n'));
    return;
  }

  const example = examples.find((ex) => ex.id === exampleId);
  if (!example) {
    console.error(chalk.red('Example not found'));
    return;
  }

  // Run the example
  try {
    console.clear();
    await example.run();
    showCompletion(example);
  } catch (error) {
    console.error('\n' + chalk.red('Error running example:'), error);
  }

  // Ask if user wants to continue
  const { continueChoice } = await inquirer.prompt<{ continueChoice: string }>([
    {
      type: 'list',
      name: 'continueChoice',
      message: 'What would you like to do next?',
      choices: [
        {
          name: 'Run another example',
          value: 'continue',
        },
        {
          name: 'Exit',
          value: 'exit',
        },
      ],
    },
  ]);

  if (continueChoice === 'continue') {
    await showMenu();
  } else {
    console.log('\n' + chalk.gray('Thanks for learning with Stratix! Happy coding!\n'));
  }
}

/**
 * Main entry point
 */
async function main() {
  try {
    await showMenu();
  } catch (error) {
    if ((error as { isTtyError?: boolean }).isTtyError) {
      console.error('Prompt could not be rendered in the current environment');
    } else {
      console.error('An error occurred:', error);
    }
    process.exit(1);
  }
}

// Run the menu
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
