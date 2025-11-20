/**
 * Core types for the CLI system
 */

/**
 * Validation result
 */
export interface ValidationResult {
    valid: boolean;
    errors?: string[];
}

/**
 * Generator context
 */
export interface GeneratorContext {
    projectRoot: string;
    options: Record<string, any>;
    dryRun?: boolean;
    force?: boolean;
}

/**
 * File change action
 */
export type FileAction = 'create' | 'update' | 'delete' | 'skip';

/**
 * Generated file
 */
export interface GeneratedFile {
    path: string;
    content: string;
    action: FileAction;
}

/**
 * Generator result
 */
export interface GeneratorResult {
    files: GeneratedFile[];
    summary?: string;
}

/**
 * Template data
 */
export interface TemplateData {
    [key: string]: any;
}

/**
 * Project structure type
 */
export type ProjectStructureType = 'ddd' | 'modular' | 'unknown';

/**
 * Project structure
 */
export interface ProjectStructure {
    type: ProjectStructureType;
    basePath: string;
    sourceRoot: string;
    domainPath?: string;
    applicationPath?: string;
    infrastructurePath?: string;
    contextsPath?: string;
}
