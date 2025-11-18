import { z } from 'zod';

export const StratixConfigSchema = z.object({
  structure: z.object({
    type: z.enum(['ddd', 'modular', 'custom']).default('ddd'),
    sourceRoot: z.string().default('src'),
    domainPath: z.string().optional(),
    applicationPath: z.string().optional(),
    infrastructurePath: z.string().optional(),
    contextsPath: z.string().optional(),
  }),
  
  generators: z.object({
    context: z.object({
      path: z.string(),
      withTests: z.boolean().default(false),
    }).optional(),
    
    entity: z.object({
      path: z.string(),
      aggregate: z.boolean().default(true),
      withTests: z.boolean().default(false),
    }).optional(),
    
    valueObject: z.object({
      path: z.string(),
      withValidation: z.boolean().default(false),
      withTests: z.boolean().default(false),
    }).optional(),
    
    command: z.object({
      path: z.string(),
      withHandler: z.boolean().default(true),
      withTests: z.boolean().default(false),
    }).optional(),
    
    query: z.object({
      path: z.string(),
      withHandler: z.boolean().default(true),
      withTests: z.boolean().default(false),
    }).optional(),
  }).optional(),
});

export type StratixConfig = z.infer<typeof StratixConfigSchema>;

export function defineConfig(config: StratixConfig): StratixConfig {
  return config;
}
