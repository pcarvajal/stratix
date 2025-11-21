#!/usr/bin/env tsx
/**
 * Build Knowledge Base Script
 * 
 * This script indexes all Stratix documentation into the knowledge base:
 * - Docusaurus documentation (*.md files)
 * - Package READMEs
 * - Code examples
 * - DDD/CQRS patterns
 */

import * as fs from 'fs/promises';
import * as path from 'path';
import matter from 'gray-matter';

// Helper to recursively find files
async function findFiles(dir: string, pattern: RegExp): Promise<string[]> {
    const files: string[] = [];

    async function walk(currentPath: string, basePath: string) {
        const entries = await fs.readdir(currentPath, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentPath, entry.name);
            const relativePath = path.relative(basePath, fullPath);

            if (entry.isDirectory()) {
                await walk(fullPath, basePath);
            } else if (pattern.test(entry.name)) {
                files.push(relativePath);
            }
        }
    }

    try {
        await walk(dir, dir);
    } catch (error) {
        // Directory doesn't exist
    }

    return files;
}

interface Document {
    id: string;
    content: string;
    metadata: {
        type: 'pattern' | 'example' | 'docs' | 'api';
        category: string;
        source: string;
        title?: string;
    };
}


const ROOT_DIR = path.join(__dirname, '../../..');
const DOCS_DIR = path.join(ROOT_DIR, 'docs/website/docs');
const PACKAGES_DIR = path.join(ROOT_DIR, 'packages');
const OUTPUT_FILE = path.join(__dirname, '../src/rag/initial-knowledge.json');

async function main() {
    console.log('🔨 Building Stratix Knowledge Base...\n');

    const documents: Document[] = [];

    // 1. Index Docusaurus documentation
    console.log('📚 Indexing Docusaurus documentation...');
    const docFiles = await findFiles(DOCS_DIR, /\.md$/);

    for (const file of docFiles) {
        const filePath = path.join(DOCS_DIR, file);
        const content = await fs.readFile(filePath, 'utf-8');

        // Parse frontmatter
        const { data: frontmatter, content: markdown } = matter(content);

        // Skip if empty
        if (!markdown.trim()) continue;

        // Determine category from path
        const category = file.split('/')[0] || 'general';

        documents.push({
            id: `docs-${file.replace(/\//g, '-').replace(/\.md$/, '')}`,
            content: markdown,
            metadata: {
                type: 'docs',
                category,
                source: `docs/${file}`,
                title: frontmatter.title || path.basename(file, '.md')
            }
        });
    }

    console.log(`  ✅ Indexed ${docFiles.length} documentation files`);

    // 2. Index Package READMEs
    console.log('\n📦 Indexing package READMEs...');
    const packageDirs = await fs.readdir(PACKAGES_DIR);
    let readmeCount = 0;

    for (const pkg of packageDirs) {
        const readmePath = path.join(PACKAGES_DIR, pkg, 'README.md');

        try {
            const content = await fs.readFile(readmePath, 'utf-8');
            const { data: frontmatter, content: markdown } = matter(content);

            if (!markdown.trim()) continue;

            documents.push({
                id: `package-${pkg}`,
                content: markdown,
                metadata: {
                    type: 'api',
                    category: 'packages',
                    source: `packages/${pkg}/README.md`,
                    title: frontmatter.title || `@stratix/${pkg}`
                }
            });

            readmeCount++;
        } catch (error) {
            // README doesn't exist, skip
        }
    }

    console.log(`  ✅ Indexed ${readmeCount} package READMEs`);

    // 3. Index code examples (from docs/examples if exists)
    console.log('\n💡 Indexing code examples...');
    const examplesDir = path.join(DOCS_DIR, '../examples');
    let exampleCount = 0;

    try {
        const exampleFiles = await findFiles(examplesDir, /\.(ts|js)$/);

        for (const file of exampleFiles) {
            const filePath = path.join(examplesDir, file);
            const content = await fs.readFile(filePath, 'utf-8');

            if (!content.trim()) continue;

            const category = file.split('/')[0] || 'examples';

            documents.push({
                id: `example-${file.replace(/\//g, '-').replace(/\.(ts|js)$/, '')}`,
                content: `\`\`\`typescript\n${content}\n\`\`\``,
                metadata: {
                    type: 'example',
                    category,
                    source: `examples/${file}`,
                    title: path.basename(file, path.extname(file))
                }
            });

            exampleCount++;
        }
    } catch (error) {
        console.log('  ℹ️  No examples directory found');
    }

    if (exampleCount > 0) {
        console.log(`  ✅ Indexed ${exampleCount} code examples`);
    }

    // 4. Save to file with metadata
    console.log('\n💾 Saving knowledge base...');

    // Read Stratix version from root package.json
    const rootPackageJson = JSON.parse(
        await fs.readFile(path.join(ROOT_DIR, 'package.json'), 'utf-8')
    );
    const stratixVersion = rootPackageJson.version;

    // Calculate statistics
    const stats = documents.reduce((acc, doc) => {
        acc[doc.metadata.type] = (acc[doc.metadata.type] || 0) + 1;
        return acc;
    }, {} as Record<string, number>);

    // Create output with metadata
    const output = {
        metadata: {
            version: stratixVersion,
            generatedAt: new Date().toISOString(),
            documentCount: documents.length,
            stratixVersion: stratixVersion,
            statistics: stats,
            sources: {
                docusaurus: stats.docs || 0,
                packages: stats.api || 0,
                patterns: stats.pattern || 0,
                examples: stats.example || 0
            }
        },
        documents: documents
    };

    await fs.writeFile(
        OUTPUT_FILE,
        JSON.stringify(output, null, 2),
        'utf-8'
    );

    console.log(`  ✅ Saved ${documents.length} documents to ${path.relative(process.cwd(), OUTPUT_FILE)}`);

    // 5. Statistics
    console.log('\n📊 Knowledge Base Statistics:');
    console.log(`  - Version: ${output.metadata.version}`);
    console.log(`  - Generated: ${output.metadata.generatedAt}`);
    console.log(`  - Total documents: ${output.metadata.documentCount}`);
    console.log('\n  By type:');
    for (const [type, count] of Object.entries(output.metadata.statistics)) {
        console.log(`    - ${type}: ${count} documents`);
    }

    console.log('\n✅ Knowledge base built successfully!\n');
}

main().catch(error => {
    console.error('❌ Error building knowledge base:', error);
    process.exit(1);
});
