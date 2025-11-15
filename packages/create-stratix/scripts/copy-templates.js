#!/usr/bin/env node

import { copyFileSync, mkdirSync, readdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '..');

const generators = [
  'entity',
  'value-object',
  'use-case',
  'repository',
  'test',
  'context',
];

try {
  for (const generator of generators) {
    const srcTemplatesDir = join(
      rootDir,
      'src',
      'generators',
      generator,
      'templates'
    );
    const distTemplatesDir = join(
      rootDir,
      'dist',
      'generators',
      generator,
      'templates'
    );

    // Create destination directory
    mkdirSync(distTemplatesDir, { recursive: true });

    // Copy all .ejs files
    const files = readdirSync(srcTemplatesDir);
    for (const file of files) {
      if (file.endsWith('.ejs')) {
        const srcFile = join(srcTemplatesDir, file);
        const distFile = join(distTemplatesDir, file);
        copyFileSync(srcFile, distFile);
        console.log(`Copied ${generator}/${file}`);
      }
    }
  }

  console.log('All templates copied successfully');
} catch (error) {
  console.error('Error copying templates:', error);
  process.exit(1);
}
