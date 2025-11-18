#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { resolve, join } from 'path';

const NEW_VERSION = '0.1.7';

// Find all package.json files in packages directory (excluding templates)
function findPackageFiles(dir) {
  const packages = [];
  const items = readdirSync(dir);

  for (const item of items) {
    const fullPath = join(dir, item);
    const stat = statSync(fullPath);

    if (stat.isDirectory() && item !== 'node_modules' && item !== 'templates') {
      const packageJsonPath = join(fullPath, 'package.json');
      try {
        statSync(packageJsonPath);
        packages.push(packageJsonPath);
      } catch {
        // No package.json in this directory
      }
    }
  }

  return packages;
}

const packagesDir = resolve(process.cwd(), 'packages');
const packageFiles = findPackageFiles(packagesDir);

console.log(`Found ${packageFiles.length} packages to update\n`);

for (const file of packageFiles) {
  try {
    const content = readFileSync(file, 'utf8');
    const pkg = JSON.parse(content);
    const oldVersion = pkg.version;

    // Update version
    pkg.version = NEW_VERSION;

    // Write back
    writeFileSync(file, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
    console.log(`✓ ${pkg.name}: ${oldVersion} → ${NEW_VERSION}`);
  } catch (error) {
    console.error(`✗ Failed to update ${file}:`, error.message);
  }
}

console.log(`\nAll packages updated to version ${NEW_VERSION}`);
