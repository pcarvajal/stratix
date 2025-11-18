export interface NewCommandOptions {
  pm?: 'npm' | 'pnpm' | 'yarn';
  structure?: 'ddd' | 'modular';
  git?: boolean;
}

export interface GenerateCommandOptions {
  props?: string;
  aggregate?: boolean;
  withTests?: boolean;
  withValidation?: boolean;
  input?: string;
  output?: string;
  dryRun?: boolean;
  force?: boolean;
}

export interface ProjectStructure {
  type: 'ddd' | 'modular' | 'unknown';
  basePath: string;
  sourceRoot: string;
  domainPath?: string;
  applicationPath?: string;
  infrastructurePath?: string;
  contextsPath?: string;
}

export interface GeneratedFile {
  path: string;
  content: string;
  action: 'create' | 'skip' | 'dry-run';
}

export interface PropDefinition {
  name: string;
  type: string;
}

export interface TemplateData {
  entityName: string;
  entityNameCamel: string;
  entityNameKebab: string;
  entityNamePlural: string;
  contextName?: string;
  props: PropDefinition[];
  aggregate?: boolean;
  naming?: {
    toPascalCase: (str: string) => string;
    toCamelCase: (str: string) => string;
    toKebabCase: (str: string) => string;
  };
}
