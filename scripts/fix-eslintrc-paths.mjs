#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('Fixing .eslintrc.json paths after folder reorganization...\n');

// Find all .eslintrc.json files in plugins and integrations
const files = execSync('find packages/plugins packages/integrations -name ".eslintrc.json" 2>/dev/null || true', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);

console.log(`Found ${files.length} .eslintrc.json files to fix\n`);

for (const file of files) {
    try {
        const content = readFileSync(file, 'utf-8');
        const eslintrc = JSON.parse(content);

        // Update extends path from ../../.eslintrc.json to ../../../.eslintrc.json
        if (eslintrc.extends === '../../.eslintrc.json') {
            eslintrc.extends = '../../../.eslintrc.json';
            writeFileSync(file, JSON.stringify(eslintrc, null, 2) + '\n');
            console.log(`✓ Fixed ${file}`);
        }
    } catch (error) {
        console.error(`✗ Failed to fix ${file}:`, error.message);
    }
}

console.log('\nDone!');
