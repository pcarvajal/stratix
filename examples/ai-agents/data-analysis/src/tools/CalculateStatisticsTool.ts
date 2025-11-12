import { AgentTool, type ToolDefinition } from '@stratix/abstractions';
import type { Dataset, StatisticalSummary, ColumnStatistics } from '../domain/types.js';

interface CalculateStatisticsInput {
  dataset: Dataset;
}

interface CalculateStatisticsOutput {
  summary: StatisticalSummary;
  report: string;
}

export class CalculateStatisticsTool extends AgentTool<CalculateStatisticsInput, CalculateStatisticsOutput> {
  readonly name = 'calculate_statistics';
  readonly description = 'Calculate statistical summary for a dataset';
  readonly requiresApproval = false;

  async execute(input: CalculateStatisticsInput): Promise<CalculateStatisticsOutput> {
    const { dataset } = input;

    const columnStats: ColumnStatistics[] = [];
    let totalMissing = 0;

    for (const header of dataset.headers) {
      const values = dataset.rows.map(row => row[header]);
      const stats = this.calculateColumnStats(header, values);
      columnStats.push(stats);
      totalMissing += stats.missing;
    }

    const totalCells = dataset.rowCount * dataset.columnCount;
    const missingDataPercentage = totalCells > 0 ? (totalMissing / totalCells) * 100 : 0;

    const summary: StatisticalSummary = {
      totalRows: dataset.rowCount,
      totalColumns: dataset.columnCount,
      columns: columnStats,
      missingDataPercentage
    };

    const report = this.generateReport(summary);

    return {
      summary,
      report
    };
  }

  async validate(input: unknown): Promise<CalculateStatisticsInput> {
    if (typeof input !== 'object' || input === null) {
      throw new Error('Input must be an object');
    }

    const obj = input as Record<string, unknown>;

    if (!obj.dataset || typeof obj.dataset !== 'object') {
      throw new Error('dataset must be an object');
    }

    const dataset = obj.dataset as Dataset;

    if (!Array.isArray(dataset.headers) || !Array.isArray(dataset.rows)) {
      throw new Error('Invalid dataset structure');
    }

    return { dataset };
  }

  getDefinition(): ToolDefinition {
    return {
      name: this.name,
      description: this.description,
      parameters: {
        type: 'object',
        properties: {
          dataset: {
            type: 'object',
            description: 'Dataset to analyze',
            properties: {
              headers: {
                type: 'array',
                items: { type: 'string' }
              },
              rows: {
                type: 'array',
                items: { type: 'object' }
              }
            }
          }
        },
        required: ['dataset']
      }
    };
  }

  private calculateColumnStats(column: string, values: (string | number | undefined)[]): ColumnStatistics {
    const nonNullValues = values.filter(v => v !== null && v !== undefined && v !== '');
    const missing = values.length - nonNullValues.length;

    // Determine if numeric
    const numericValues = nonNullValues
      .map(v => typeof v === 'number' ? v : Number(v))
      .filter(n => !isNaN(n));

    const isNumeric = numericValues.length > nonNullValues.length * 0.8;

    if (isNumeric && numericValues.length > 0) {
      return this.calculateNumericStats(column, numericValues, missing, nonNullValues.length);
    } else {
      return this.calculateCategoricalStats(column, nonNullValues as (string | number)[], missing);
    }
  }

  private calculateNumericStats(
    column: string,
    values: number[],
    missing: number,
    count: number
  ): ColumnStatistics {
    const sorted = [...values].sort((a, b) => a - b);
    const sum = values.reduce((acc, v) => acc + v, 0);
    const mean = sum / values.length;

    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
    const stdDev = Math.sqrt(variance);

    const median = this.calculateMedian(sorted);

    return {
      column,
      type: 'numeric',
      count,
      missing,
      unique: new Set(values).size,
      mean: Number(mean.toFixed(2)),
      median: Number(median.toFixed(2)),
      stdDev: Number(stdDev.toFixed(2)),
      min: sorted[0],
      max: sorted[sorted.length - 1]
    };
  }

  private calculateCategoricalStats(
    column: string,
    values: (string | number)[],
    missing: number
  ): ColumnStatistics {
    const counts = new Map<string | number, number>();

    for (const value of values) {
      counts.set(value, (counts.get(value) || 0) + 1);
    }

    const sortedCounts = Array.from(counts.entries())
      .sort((a, b) => b[1] - a[1]);

    const mode = sortedCounts[0]?.[0];
    const topValues = sortedCounts.slice(0, 5).map(([value, count]) => ({ value, count }));

    return {
      column,
      type: 'categorical',
      count: values.length,
      missing,
      unique: counts.size,
      mode,
      topValues
    };
  }

  private calculateMedian(sorted: number[]): number {
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private generateReport(summary: StatisticalSummary): string {
    const lines: string[] = [];

    lines.push('STATISTICAL SUMMARY');
    lines.push('==================');
    lines.push('');
    lines.push(`Total Rows: ${summary.totalRows}`);
    lines.push(`Total Columns: ${summary.totalColumns}`);
    lines.push(`Missing Data: ${summary.missingDataPercentage.toFixed(2)}%`);
    lines.push('');
    lines.push('COLUMN STATISTICS');
    lines.push('-----------------');

    for (const col of summary.columns) {
      lines.push('');
      lines.push(`Column: ${col.column}`);
      lines.push(`Type: ${col.type}`);
      lines.push(`Count: ${col.count} (${col.missing} missing)`);
      lines.push(`Unique: ${col.unique}`);

      if (col.type === 'numeric') {
        lines.push(`Mean: ${col.mean}`);
        lines.push(`Median: ${col.median}`);
        lines.push(`Std Dev: ${col.stdDev}`);
        lines.push(`Range: [${col.min}, ${col.max}]`);
      } else {
        lines.push(`Mode: ${col.mode}`);
        if (col.topValues && col.topValues.length > 0) {
          lines.push('Top Values:');
          for (const { value, count } of col.topValues) {
            lines.push(`  - ${value}: ${count}`);
          }
        }
      }
    }

    return lines.join('\n');
  }
}
