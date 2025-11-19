#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('Fixing circular imports in core package...\n');

// Find all TypeScript files in core/src/ai-agents that came from abstractions
const files = execSync('find packages/core/src/ai-agents -name "*.ts" ! -name "index.ts" 2>/dev/null || true', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);

console.log(`Found ${files.length} files to fix\n`);

for (const file of files) {
    try {
        let content = readFileSync(file, 'utf-8');

        // Replace @stratix/core imports with relative imports
        const originalContent = content;

        // Check if this file has imports from @stratix/core
        if (content.includes("from '@stratix/core'") || content.includes('from "@stratix/core"')) {
            // This file came from abstractions and needs to import from primitives files
            // Replace with relative imports to the primitives ai-agents files
            content = content.replace(
                /from ['"]@stratix\/core['"]/g,
                "from '../ai-agents/index.js'"
            );

            if (content !== originalContent) {
                writeFileSync(file, content);
                console.log(`✓ Fixed ${file}`);
            }
        }
    } catch (error) {
        console.error(`✗ Failed to fix ${file}:`, error.message);
    }
}

console.log('\nDone!');
