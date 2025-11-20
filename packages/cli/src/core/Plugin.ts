import type { Command } from './Command.js';
import type { Generator } from './Generator.js';
import type { Template } from './Template.js';

/**
 * CLI Plugin interface
 * 
 * Plugins can extend the CLI with custom commands, generators, and templates
 * 
 * @example
 * ```typescript
 * const myPlugin: CLIPlugin = {
 *   name: 'my-plugin',
 *   version: '1.0.0',
 *   commands: [new MyCommand()],
 *   generators: [new MyGenerator()],
 *   async initialize(cli) {
 *     // Setup logic
 *   }
 * };
 * ```
 */
export interface CLIPlugin {
    /**
     * Plugin name
     */
    readonly name: string;

    /**
     * Plugin version
     */
    readonly version: string;

    /**
     * Plugin description
     */
    readonly description?: string;

    /**
     * Commands provided by this plugin
     */
    readonly commands?: Command[];

    /**
     * Generators provided by this plugin
     */
    readonly generators?: Generator[];

    /**
     * Templates provided by this plugin
     */
    readonly templates?: Template[];

    /**
     * Initialize the plugin
     * Called when the plugin is loaded
     */
    initialize?(cli: any): Promise<void>;

    /**
     * Cleanup when plugin is unloaded
     */
    dispose?(): Promise<void>;
}
