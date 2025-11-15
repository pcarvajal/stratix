export interface GeneratorOptions {
  name: string;
  destination?: string;
  dryRun?: boolean;
  force?: boolean;
  skipTests?: boolean;
}

export interface GeneratedFile {
  path: string;
  content: string;
  action: 'create' | 'update' | 'skip' | 'dry-run';
}

export type ProjectType = 'ddd' | 'layered' | 'modular-monolith' | 'microservice' | 'unknown';

export interface ProjectStructure {
  type: ProjectType;
  basePath: string;
  domainPath?: string;
  applicationPath?: string;
  infrastructurePath?: string;
  contextsPath?: string;
}

export interface EntityGeneratorOptions extends GeneratorOptions {
  props?: string;
  aggregate?: boolean;
  withEvent?: string;
  withValueObjects?: string[];
  withTests?: boolean;
  skipValidation?: boolean;
}

export interface ValueObjectGeneratorOptions extends GeneratorOptions {
  props?: string;
  withValidation?: boolean;
  withTests?: boolean;
}

export interface UseCaseGeneratorOptions extends GeneratorOptions {
  type: 'command' | 'query';
  entity?: string;
  input?: string;
  output?: string;
  withValidation?: boolean;
  withEvent?: string;
  withTests?: boolean;
}

export interface RepositoryGeneratorOptions extends GeneratorOptions {
  entityName: string;
  methods?: string;
  implementations?: string[];
  withTests?: boolean;
}

export interface TestGeneratorOptions extends GeneratorOptions {
  target: string;
  type?: 'unit' | 'integration' | 'e2e';
}

export interface ContextGeneratorOptions extends GeneratorOptions {
  props?: string;
  withTests?: boolean;
}
