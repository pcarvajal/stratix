import { AgentTool, type ToolDefinition } from '@stratix/abstractions';
import { parse } from 'csv-parse/sync';
import type { Dataset } from '../domain/types.js';

interface ParseCSVInput {
  csvData: string;
  hasHeader?: boolean;
}

interface ParseCSVOutput {
  dataset: Dataset;
  preview: string;
}

export class ParseCSVTool extends AgentTool<ParseCSVInput, ParseCSVOutput> {
  readonly name = 'parse_csv';
  readonly description = 'Parse CSV data and extract structured information';
  readonly requiresApproval = false;

  async execute(input: ParseCSVInput): Promise<ParseCSVOutput> {
    const { csvData, hasHeader = true } = input;

    // Parse CSV
    const records = parse(csvData, {
      columns: hasHeader,
      skip_empty_lines: true,
      trim: true,
      cast: (value: string, context: { header: boolean }) => {
        // Try to convert to number if possible
        if (context.header) return value;
        const num = Number(value);
        return isNaN(num) ? value : num;
      }
    });

    if (records.length === 0) {
      throw new Error('No data found in CSV');
    }

    // Extract headers
    const headers = Object.keys(records[0]);

    // Build dataset
    const dataset: Dataset = {
      headers,
      rows: records,
      rowCount: records.length,
      columnCount: headers.length
    };

    // Create preview (first 5 rows)
    const previewRows = records.slice(0, 5);
    const preview = this.formatPreview(headers, previewRows);

    return {
      dataset,
      preview
    };
  }

  async validate(input: unknown): Promise<ParseCSVInput> {
    if (typeof input !== 'object' || input === null) {
      throw new Error('Input must be an object');
    }

    const obj = input as Record<string, unknown>;

    if (typeof obj.csvData !== 'string') {
      throw new Error('csvData must be a string');
    }

    if (obj.csvData.trim().length === 0) {
      throw new Error('csvData cannot be empty');
    }

    return {
      csvData: obj.csvData,
      hasHeader: typeof obj.hasHeader === 'boolean' ? obj.hasHeader : true
    };
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          csvData: {
            type: 'string',
            description: 'CSV data as a string'
          },
          hasHeader: {
            type: 'boolean',
            description: 'Whether the first row contains column headers',
            default: true
          }
        },
        required: ['csvData']
      }
    };
  }

  private formatPreview(headers: string[], rows: Record<string, unknown>[]): string {
    const lines: string[] = [];

    // Header
    lines.push(headers.join(' | '));
    lines.push(headers.map(() => '---').join(' | '));

    // Rows
    for (const row of rows) {
      const values = headers.map(h => String(row[h] ?? ''));
      lines.push(values.join(' | '));
    }

    return lines.join('\n');
  }
}
