#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('Fixing tsconfig.json paths after folder reorganization...\n');

// Find all tsconfig.json files in plugins and integrations
const files = execSync('find packages/plugins packages/integrations -name "tsconfig.json" 2>/dev/null || true', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);

console.log(`Found ${files.length} tsconfig.json files to fix\n`);

for (const file of files) {
    try {
        const content = readFileSync(file, 'utf-8');
        const tsconfig = JSON.parse(content);

        // Update extends path from ../../tsconfig.base.json to ../../../tsconfig.base.json
        if (tsconfig.extends === '../../tsconfig.base.json') {
            tsconfig.extends = '../../../tsconfig.base.json';
            writeFileSync(file, JSON.stringify(tsconfig, null, 2) + '\n');
            console.log(`✓ Fixed ${file}`);
        }
    } catch (error) {
        console.error(`✗ Failed to fix ${file}:`, error.message);
    }
}

console.log('\nDone!');
