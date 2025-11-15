import { z } from 'zod';

// Input types
export const AnalysisRequestSchema = z.object({
  dataset: z.string().describe('CSV data or path to analyze'),
  question: z.string().describe('Question to answer about the data'),
  context: z.string().optional().describe('Additional context about the dataset')
});

export type AnalysisRequest = z.infer<typeof AnalysisRequestSchema>;

// Domain types
export interface Dataset {
  headers: string[];
  rows: Record<string, string | number>[];
  rowCount: number;
  columnCount: number;
}

export interface ColumnStatistics {
  column: string;
  type: 'numeric' | 'categorical' | 'mixed';
  count: number;
  missing: number;
  unique?: number;
  mean?: number;
  median?: number;
  stdDev?: number;
  min?: number;
  max?: number;
  mode?: string | number;
  topValues?: Array<{ value: string | number; count: number }>;
}

export interface StatisticalSummary {
  totalRows: number;
  totalColumns: number;
  columns: ColumnStatistics[];
  missingDataPercentage: number;
}

// Output types
export const AnalysisReportSchema = z.object({
  summary: z.string().describe('Executive summary of the analysis'),
  findings: z.array(z.object({
    finding: z.string(),
    confidence: z.enum(['high', 'medium', 'low']),
    evidence: z.string()
  })).describe('Key findings from the analysis'),
  recommendations: z.array(z.string()).describe('Actionable recommendations'),
  statistics: z.object({
    totalRows: z.number(),
    totalColumns: z.number(),
    dataQuality: z.enum(['excellent', 'good', 'fair', 'poor'])
  }),
  visualizationSuggestions: z.array(z.string()).optional()
});

export type AnalysisReport = z.infer<typeof AnalysisReportSchema>;
