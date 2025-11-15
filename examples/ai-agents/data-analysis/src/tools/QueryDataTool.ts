import { AgentTool, type ToolDefinition } from '@stratix/abstractions';
import type { Dataset } from '../domain/types.js';

interface QueryDataInput {
  dataset: Dataset;
  operation: 'filter' | 'aggregate' | 'sort' | 'group_by';
  column?: string;
  condition?: string;
  value?: string | number;
  aggregation?: 'count' | 'sum' | 'avg' | 'min' | 'max';
  sortOrder?: 'asc' | 'desc';
}

interface QueryDataOutput {
  result: unknown;
  resultCount: number;
  description: string;
}

export class QueryDataTool extends AgentTool<QueryDataInput, QueryDataOutput> {
  readonly name = 'query_data';
  readonly description = 'Query and filter dataset using various operations';
  readonly requiresApproval = false;

  async execute(input: QueryDataInput): Promise<QueryDataOutput> {
    const { dataset, operation } = input;

    switch (operation) {
      case 'filter':
        return this.executeFilter(dataset, input);
      case 'aggregate':
        return this.executeAggregate(dataset, input);
      case 'sort':
        return this.executeSort(dataset, input);
      case 'group_by':
        return this.executeGroupBy(dataset, input);
      default:
        throw new Error(`Unknown operation: ${operation}`);
    }
  }

  async validate(input: unknown): Promise<QueryDataInput> {
    if (typeof input !== 'object' || input === null) {
      throw new Error('Input must be an object');
    }

    const obj = input as Record<string, unknown>;

    if (!obj.dataset || typeof obj.dataset !== 'object') {
      throw new Error('dataset must be an object');
    }

    if (typeof obj.operation !== 'string') {
      throw new Error('operation must be a string');
    }

    const validOperations = ['filter', 'aggregate', 'sort', 'group_by'];
    if (!validOperations.includes(obj.operation)) {
      throw new Error(`operation must be one of: ${validOperations.join(', ')}`);
    }

    const dataset = obj.dataset as Dataset;

    return {
      dataset,
      operation: obj.operation as QueryDataInput['operation'],
      column: typeof obj.column === 'string' ? obj.column : undefined,
      condition: typeof obj.condition === 'string' ? obj.condition : undefined,
      value: typeof obj.value === 'string' || typeof obj.value === 'number' ? obj.value : undefined,
      aggregation: typeof obj.aggregation === 'string' ? obj.aggregation as QueryDataInput['aggregation'] : undefined,
      sortOrder: typeof obj.sortOrder === 'string' ? obj.sortOrder as QueryDataInput['sortOrder'] : undefined
    };
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
            description: 'Dataset to query'
          },
          operation: {
            type: 'string',
            enum: ['filter', 'aggregate', 'sort', 'group_by'],
            description: 'Type of query operation'
          },
          column: {
            type: 'string',
            description: 'Column name for the operation'
          },
          condition: {
            type: 'string',
            enum: ['equals', 'not_equals', 'greater_than', 'less_than', 'contains'],
            description: 'Filter condition'
          },
          value: {
            type: ['string', 'number'],
            description: 'Value for comparison'
          },
          aggregation: {
            type: 'string',
            enum: ['count', 'sum', 'avg', 'min', 'max'],
            description: 'Aggregation function'
          },
          sortOrder: {
            type: 'string',
            enum: ['asc', 'desc'],
            description: 'Sort order'
          }
        },
        required: ['dataset', 'operation']
      }
    };
  }

  private executeFilter(dataset: Dataset, input: QueryDataInput): QueryDataOutput {
    const { column, condition, value } = input;

    if (!column || !condition || value === undefined) {
      throw new Error('Filter requires column, condition, and value');
    }

    const filtered = dataset.rows.filter(row => {
      const cellValue = row[column];
      return this.evaluateCondition(cellValue, condition, value);
    });

    return {
      result: filtered,
      resultCount: filtered.length,
      description: `Filtered ${dataset.rowCount} rows to ${filtered.length} where ${column} ${condition} ${value}`
    };
  }

  private executeAggregate(dataset: Dataset, input: QueryDataInput): QueryDataOutput {
    const { column, aggregation } = input;

    if (!column || !aggregation) {
      throw new Error('Aggregate requires column and aggregation function');
    }

    const values = dataset.rows
      .map(row => row[column])
      .filter(v => v !== null && v !== undefined && v !== '')
      .map(v => typeof v === 'number' ? v : Number(v))
      .filter(n => !isNaN(n));

    let result: number;

    switch (aggregation) {
      case 'count':
        result = values.length;
        break;
      case 'sum':
        result = values.reduce((acc, v) => acc + v, 0);
        break;
      case 'avg':
        result = values.reduce((acc, v) => acc + v, 0) / values.length;
        break;
      case 'min':
        result = Math.min(...values);
        break;
      case 'max':
        result = Math.max(...values);
        break;
      default:
        throw new Error(`Unknown aggregation: ${aggregation}`);
    }

    return {
      result: Number(result.toFixed(2)),
      resultCount: 1,
      description: `${aggregation.toUpperCase()}(${column}) = ${result.toFixed(2)}`
    };
  }

  private executeSort(dataset: Dataset, input: QueryDataInput): QueryDataOutput {
    const { column, sortOrder = 'asc' } = input;

    if (!column) {
      throw new Error('Sort requires column');
    }

    const sorted = [...dataset.rows].sort((a, b) => {
      const aVal = a[column];
      const bVal = b[column];

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      const aStr = String(aVal);
      const bStr = String(bVal);
      return sortOrder === 'asc'
        ? aStr.localeCompare(bStr)
        : bStr.localeCompare(aStr);
    });

    return {
      result: sorted,
      resultCount: sorted.length,
      description: `Sorted ${dataset.rowCount} rows by ${column} (${sortOrder})`
    };
  }

  private executeGroupBy(dataset: Dataset, input: QueryDataInput): QueryDataOutput {
    const { column } = input;

    if (!column) {
      throw new Error('Group by requires column');
    }

    const groups = new Map<string | number, number>();

    for (const row of dataset.rows) {
      const value = row[column];
      const key = String(value);
      groups.set(key, (groups.get(key) || 0) + 1);
    }

    const result = Array.from(groups.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);

    return {
      result,
      resultCount: result.length,
      description: `Grouped ${dataset.rowCount} rows by ${column} into ${result.length} groups`
    };
  }

  private evaluateCondition(
    cellValue: string | number | undefined,
    condition: string,
    targetValue: string | number
  ): boolean {
    if (cellValue === null || cellValue === undefined) {
      return false;
    }

    const cell = String(cellValue).toLowerCase();
    const target = String(targetValue).toLowerCase();

    switch (condition) {
      case 'equals':
        return cell === target;
      case 'not_equals':
        return cell !== target;
      case 'contains':
        return cell.includes(target);
      case 'greater_than':
        return Number(cellValue) > Number(targetValue);
      case 'less_than':
        return Number(cellValue) < Number(targetValue);
      default:
        return false;
    }
  }
}
