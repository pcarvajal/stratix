#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

console.log('Updating package dependencies from removed packages to core/runtime...\n');

const replacements = [
    { from: '@stratix/logger-console', to: '@stratix/core' },
    { from: '@stratix/cqrs-inmemory', to: '@stratix/core' },
    { from: '@stratix/ai-runtime', to: '@stratix/runtime' },
];

// Update package.json files
const packages = readdirSync('packages', { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name);

let totalUpdates = 0;

for (const pkg of packages) {
    const packageJsonPath = join('packages', pkg, 'package.json');

    try {
        const content = readFileSync(packageJsonPath, 'utf-8');
        const packageJson = JSON.parse(content);
        let modified = false;

        for (const { from, to } of replacements) {
            // Update dependencies
            if (packageJson.dependencies?.[from]) {
                delete packageJson.dependencies[from];
                if (!packageJson.dependencies[to]) {
                    packageJson.dependencies[to] = 'workspace:*';
                }
                modified = true;
                totalUpdates++;
            }

            // Update devDependencies
            if (packageJson.devDependencies?.[from]) {
                delete packageJson.devDependencies[from];
                if (!packageJson.devDependencies[to]) {
                    packageJson.devDependencies[to] = 'workspace:*';
                }
                modified = true;
                totalUpdates++;
            }
        }

        if (modified) {
            writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n');
            console.log(`✓ Updated ${pkg}/package.json`);
        }
    } catch (error) {
        // Ignore errors
    }
}

console.log(`\n✓ Updated ${totalUpdates} package dependencies!\n`);

// Update imports in source files
console.log('Updating import statements...\n');

const files = execSync('find packages docs -type f \\( -name "*.ts" -o -name "*.js" -o -name "*.md" \\) ! -path "*/node_modules/*" ! -path "*/dist/*" 2>/dev/null || true', { encoding: 'utf-8' })
    .trim()
    .split('\n')
    .filter(Boolean);

let importUpdates = 0;

for (const file of files) {
    try {
        let content = readFileSync(file, 'utf-8');
        let modified = false;

        for (const { from, to } of replacements) {
            const regex = new RegExp(from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g');
            if (regex.test(content)) {
                content = content.replace(regex, to);
                modified = true;
                importUpdates++;
            }
        }

        if (modified) {
            writeFileSync(file, content);
        }
    } catch (error) {
        // Ignore errors
    }
}

console.log(`✓ Updated ${importUpdates} import statements!\n`);
console.log('Done!');
