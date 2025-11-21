import { pipeline } from '@xenova/transformers';
import * as path from 'path';
import * as vscode from 'vscode';
import * as fs from 'fs/promises';

export interface Document {
  id: string;
  content: string;
  metadata: {
    type: 'pattern' | 'example' | 'docs' | 'api';
    category: string;
    source: string;
    title?: string;
  };
}

export interface DocumentWithEmbedding extends Document {
  embedding: number[];
}

export interface SearchResult {
  documents: string[];
  metadatas: Document['metadata'][];
  distances: number[];
}

export interface KnowledgeBaseMetadata {
  version: string;
  generatedAt: string;
  documentCount: number;
  stratixVersion: string;
  statistics: Record<string, number>;
  sources: {
    docusaurus: number;
    packages: number;
    patterns: number;
    examples: number;
  };
}

export class StratixKnowledgeBase {
  private documents: DocumentWithEmbedding[] = [];
  private embedder: any = null;
  private initialized = false;
  private metadata: KnowledgeBaseMetadata | null = null;
  private storagePath: string;
  private loadedFrom: string = 'none';

  constructor(private context: vscode.ExtensionContext) {
    this.storagePath = path.join(context.globalStorageUri.fsPath, 'knowledge-base.json');
  }

  async initialize(): Promise<void> {
    if (this.initialized) {
      return;
    }

    try {
      console.log('Initializing Stratix Knowledge Base...');

      // Initialize embedding model
      console.log('Loading embedding model (Xenova/all-MiniLM-L6-v2)...');
      this.embedder = await pipeline(
        'feature-extraction',
        'Xenova/all-MiniLM-L6-v2'
      );
      console.log('✅ Embedding model loaded');

      // Try to load from storage
      const loaded = await this.loadFromStorage();

      if (!loaded) {
        // Load initial knowledge and generate embeddings
        console.log('Building initial knowledge base...');
        await this.loadInitialKnowledge();
        await this.saveToStorage();
      }

      this.initialized = true;
      console.log(`✅ Stratix Knowledge Base initialized with ${this.documents.length} documents`);
    } catch (error) {
      console.error('Failed to initialize knowledge base:', error);
      throw error;
    }
  }

  async search(query: string, topK: number = 5): Promise<SearchResult> {
    if (!this.initialized || !this.embedder) {
      throw new Error('Knowledge base not initialized');
    }

    try {
      // Generate embedding for query
      const queryEmbedding = await this.generateEmbedding(query);

      // Calculate cosine similarity with all documents
      const scored = this.documents.map(doc => {
        const similarity = this.cosineSimilarity(queryEmbedding, doc.embedding);
        return { doc, similarity };
      });

      // Sort by similarity (highest first) and take top K
      const topResults = scored
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      return {
        documents: topResults.map(item => item.doc.content),
        metadatas: topResults.map(item => item.doc.metadata),
        distances: topResults.map(item => 1 - item.similarity) // Convert similarity to distance
      };
    } catch (error) {
      console.error('Error searching knowledge base:', error);
      throw error;
    }
  }


  async addDocument(doc: Document): Promise<void> {
    const embedding = await this.generateEmbedding(doc.content);
    this.documents.push({ ...doc, embedding });
    await this.saveToStorage();
  }

  async addDocuments(docs: Document[]): Promise<void> {
    for (const doc of docs) {
      const embedding = await this.generateEmbedding(doc.content);
      this.documents.push({ ...doc, embedding });
    }
    await this.saveToStorage();
  }

  async clear(): Promise<void> {
    this.documents = [];
    this.loadedFrom = 'cleared';
    await this.saveToStorage();
  }

  getStats(): {
    documentCount: number;
    loadedFrom: string;
    metadata?: KnowledgeBaseMetadata;
  } {
    return {
      documentCount: this.documents.length,
      loadedFrom: this.loadedFrom,
      metadata: this.metadata || undefined
    };
  }


  private async generateEmbedding(text: string): Promise<number[]> {
    if (!this.embedder) {
      throw new Error('Embedder not initialized');
    }

    const output = await this.embedder(text, {
      pooling: 'mean',
      normalize: true
    });

    return Array.from(output.data as Float32Array);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  private async loadFromStorage(): Promise<boolean> {
    try {
      // Ensure storage directory exists
      await fs.mkdir(path.dirname(this.storagePath), { recursive: true });

      const data = await fs.readFile(this.storagePath, 'utf-8');
      this.documents = JSON.parse(data);
      this.loadedFrom = 'persistent-storage';
      console.log(`Loaded ${this.documents.length} documents from storage`);
      return true;
    } catch (error) {
      // File doesn't exist or is corrupted
      console.log('No existing knowledge base found, will create new one');
      return false;
    }
  }

  private async saveToStorage(): Promise<void> {
    try {
      await fs.mkdir(path.dirname(this.storagePath), { recursive: true });
      await fs.writeFile(this.storagePath, JSON.stringify(this.documents, null, 2));
      console.log(`Saved ${this.documents.length} documents to storage`);
    } catch (error) {
      console.error('Failed to save knowledge base:', error);
    }
  }



  private async loadInitialKnowledge(): Promise<void> {
    try {
      // Try to load from generated knowledge base file
      const knowledgeFilePath = path.join(__dirname, 'initial-knowledge.json');

      try {
        const data = await fs.readFile(knowledgeFilePath, 'utf-8');
        const parsed = JSON.parse(data);

        // Check if it has metadata (new format) or is just an array (old format)
        if (parsed.metadata && parsed.documents) {
          // New format with metadata
          this.metadata = parsed.metadata;
          const docs: Document[] = parsed.documents;

          console.log(`Loading ${docs.length} documents from initial-knowledge.json...`);
          console.log(`  📦 KB Version: ${this.metadata?.version || 'unknown'}`);
          console.log(`  📅 Generated: ${this.metadata?.generatedAt ? new Date(this.metadata.generatedAt).toLocaleDateString() : 'unknown'}`);

          await this.addDocuments(docs);
          this.loadedFrom = 'initial-knowledge.json';
          console.log(`✅ Loaded ${docs.length} documents from knowledge base`);
        } else {
          // Old format (just array of documents)
          const docs: Document[] = Array.isArray(parsed) ? parsed : parsed.documents || [];
          console.log(`Loading ${docs.length} documents from initial-knowledge.json (legacy format)...`);
          await this.addDocuments(docs);
          this.loadedFrom = 'initial-knowledge.json';
          console.log(`✅ Loaded ${docs.length} documents from knowledge base`);
        }
        return;
      } catch (error) {
        console.log('No initial-knowledge.json found, using fallback patterns');
      }

      // Fallback: Load minimal hardcoded patterns if file doesn't exist
      const fallbackDocs: Document[] = [
        {
          id: 'entity-pattern-1',
          content: `# Entity Pattern in Stratix

Entities in Stratix extend the base Entity class from @stratix/core.

Example:
\`\`\`typescript
import { Entity, EntityId } from '@stratix/core';

export interface ProductProps {
  name: string;
  price: number;
}

export class Product extends Entity<ProductProps> {
  private constructor(
    id: EntityId<'Product'>,
    props: ProductProps,
    createdAt: Date,
    updatedAt: Date
  ) {
    super(id, props, createdAt, updatedAt);
  }

  static create(props: ProductProps): Product {
    return new Product(
      EntityId.create<'Product'>(),
      props,
      new Date(),
      new Date()
    );
  }

  get name(): string {
    return this.props.name;
  }

  get price(): number {
    return this.props.price;
  }
}
\`\`\`

Key points:
- Entities have a unique ID of type EntityId<'EntityName'>
- Use private constructor and static create method
- Props interface defines entity properties
- Getters provide access to properties
- Entities track createdAt and updatedAt timestamps`,
          metadata: {
            type: 'pattern',
            category: 'entity',
            source: 'core-patterns',
            title: 'Entity Pattern'
          }
        },
        {
          id: 'command-pattern-1',
          content: `# Command Pattern in Stratix

Commands in Stratix follow the CQRS pattern for write operations.

Example:
\`\`\`typescript
// Command
import { Command } from '@stratix/core';

export class CreateProductCommand implements Command {
  constructor(
    public readonly name: string,
    public readonly price: number
  ) {}
}

// Command Handler
import { CommandHandler, Result, Success } from '@stratix/core';

export class CreateProductHandler 
  implements CommandHandler<CreateProductCommand, Product> {
  
  constructor(private productRepository: IProductRepository) {}

  async handle(command: CreateProductCommand): Promise<Result<Product>> {
    const product = Product.create({
      name: command.name,
      price: command.price
    });

    await this.productRepository.save(product);

    return Success.create(product);
  }
}
\`\`\`

Key points:
- Commands are simple DTOs with readonly properties
- Command handlers implement CommandHandler interface
- Handlers return Result<T> for error handling
- Use dependency injection for repositories`,
          metadata: {
            type: 'pattern',
            category: 'command',
            source: 'core-patterns',
            title: 'Command Pattern'
          }
        },
        {
          id: 'value-object-pattern-1',
          content: `# Value Object Pattern in Stratix

Value Objects represent domain concepts without identity.

Example:
\`\`\`typescript
import { ValueObject, Result, Success, Failure } from '@stratix/core';

export interface EmailProps {
  value: string;
}

export class Email extends ValueObject<EmailProps> {
  private constructor(props: EmailProps) {
    super(props);
  }

  static create(value: string): Result<Email> {
    if (!value || value.trim().length === 0) {
      return Failure.create('Email cannot be empty');
    }

    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!emailRegex.test(value)) {
      return Failure.create('Invalid email format');
    }

    return Success.create(new Email({ value }));
  }

  get value(): string {
    return this.props.value;
  }
}
\`\`\`

Key points:
- Value objects extend ValueObject base class
- Use static create method with validation
- Return Result<T> for validation errors
- Value objects are immutable
- Equality is based on value, not identity`,
          metadata: {
            type: 'pattern',
            category: 'value-object',
            source: 'core-patterns',
            title: 'Value Object Pattern'
          }
        }
      ];

      await this.addDocuments(fallbackDocs);
      this.loadedFrom = 'hardcoded-fallback';
      console.log(`Loaded ${fallbackDocs.length} fallback documents`);
    } catch (error) {
      console.error('Error loading initial knowledge:', error);
      throw error;
    }
  }
}
