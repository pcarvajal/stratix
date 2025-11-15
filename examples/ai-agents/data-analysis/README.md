# Data Analysis Agent Example

A production-ready AI agent that analyzes datasets and provides statistical insights using the Stratix AI Agent Framework.

## Overview

This example demonstrates how to build an intelligent data analysis agent that can:

- Parse CSV datasets
- Calculate statistical summaries
- Identify trends and patterns
- Provide actionable recommendations
- Generate visualization suggestions
- Assess data quality

## Features

- **Automated Data Analysis**: Parse and analyze CSV data automatically
- **Statistical Insights**: Calculate means, medians, distributions, and correlations
- **Pattern Recognition**: Identify trends, outliers, and anomalies
- **Natural Language Q&A**: Ask questions about your data in plain English
- **Structured Reports**: Get comprehensive analysis reports with findings and recommendations
- **Budget Control**: Set cost limits for expensive analyses
- **Cost Tracking**: Monitor LLM costs per analysis

## Quick Start

### Prerequisites

- Node.js 18+ (with TypeScript support)
- Anthropic API key (or OpenAI API key for alternative provider)
- Basic understanding of CSV data

### Installation

```bash
# From the project root
cd examples/ai-agents/data-analysis
pnpm install
```

### Configuration

Set your Anthropic API key:

```bash
export ANTHROPIC_API_KEY="your-api-key-here"
```

Alternatively, you can use OpenAI by setting:

```bash
export OPENAI_API_KEY="your-api-key-here"
```

### Run the Example

```bash
pnpm start
```

This will run three analysis examples:

1. Sales trend analysis
2. Customer churn analysis
3. Product performance analysis

## Example Output

```
=============================================================
Example 1: Sales Trend Analysis
=============================================================

SUMMARY:
The sales data shows strong upward growth throughout the year with clear
seasonal patterns. Revenue increased 111% from January to December, with
particularly strong performance in Q4.

KEY FINDINGS:
1. [HIGH] Revenue shows consistent month-over-month growth averaging 8.3%
   Evidence: Revenue grew from $45,000 in January to $95,000 in December

2. [HIGH] Strong seasonality with Q4 outperforming other quarters by 35%
   Evidence: Q4 average revenue of $88,333 vs Q1 average of $48,333

3. [MEDIUM] Profit margins remain stable at 29-31% despite scaling
   Evidence: Profit margins fluctuate minimally between 28.9% and 31.6%

RECOMMENDATIONS:
1. Prepare inventory and staffing for Q4 surge based on historical patterns
2. Investigate Q2 dip to determine if it's seasonal or addressable
3. Maintain current cost structure as margins are healthy and consistent
4. Focus growth investments in Q3 to maximize Q4 performance

VISUALIZATION SUGGESTIONS:
1. Line chart showing revenue, expenses, and profit trends over time
2. Bar chart comparing quarterly performance
3. Scatter plot of customers vs revenue to show correlation
```

## Architecture

### Agent Structure

```
DataAnalysisAgent
├── Tools
│   ├── ParseCSVTool        - Parse and validate CSV data
│   ├── CalculateStatsTool  - Compute statistical summaries
│   └── QueryDataTool       - Filter and aggregate data
├── Domain Types
│   ├── AnalysisRequest     - Input schema
│   ├── AnalysisReport      - Output schema
│   ├── Dataset             - Structured data representation
│   └── StatisticalSummary  - Stats schema
└── LLM Integration
    ├── Anthropic Claude 3  - Analysis and insights (default)
    ├── OpenAI GPT-4o       - Alternative provider
    └── Structured outputs  - JSON schema validation / prompt engineering
```

### Execution Flow

```
1. User submits question + CSV data
   ↓
2. ParseCSVTool extracts structured data
   ↓
3. CalculateStatsTool computes statistics
   ↓
4. LLM analyzes data + stats + question
   ↓
5. Agent returns structured report
   - Summary
   - Findings with confidence levels
   - Recommendations
   - Data quality assessment
   - Visualization suggestions
```

## Tools

### 1. ParseCSVTool

Parses CSV data into structured format.

**Input:**

```typescript
{
  csvData: string;      // CSV content
  hasHeader?: boolean;  // Whether first row is header (default: true)
}
```

**Output:**

```typescript
{
  dataset: Dataset; // Structured data
  preview: string; // Formatted preview
}
```

**Features:**

- Automatic type detection (numeric vs categorical)
- Header extraction
- Empty line skipping
- Value trimming

### 2. CalculateStatisticsTool

Calculates statistical summary for dataset.

**Input:**

```typescript
{
  dataset: Dataset;
}
```

**Output:**

```typescript
{
  summary: StatisticalSummary;
  report: string; // Human-readable report
}
```

**Statistics Computed:**

For numeric columns:

- Mean, median, standard deviation
- Min, max, range
- Unique value count
- Missing data count

For categorical columns:

- Mode (most frequent value)
- Unique value count
- Top 5 values with frequencies
- Missing data count

### 3. QueryDataTool

Performs queries on dataset.

**Supported Operations:**

- **filter**: Filter rows by condition
- **aggregate**: Compute sum, avg, min, max, count
- **sort**: Sort by column (asc/desc)
- **group_by**: Group and count by column

**Example:**

```typescript
{
  dataset: myData,
  operation: 'filter',
  column: 'revenue',
  condition: 'greater_than',
  value: 50000
}
```

## Use Cases

### 1. Sales Analysis

Analyze sales trends, seasonality, and growth patterns.

```typescript
const result = await orchestrator.executeAgent(agentId, {
  dataset: salesCSV,
  question: 'What are the sales trends and seasonal patterns?',
  context: 'Monthly sales data for retail business',
});
```

### 2. Customer Segmentation

Identify customer segments and churn risk factors.

```typescript
const result = await orchestrator.executeAgent(agentId, {
  dataset: customerCSV,
  question: 'Which customer segments are most likely to churn?',
  context: 'Customer data with plan, usage, and satisfaction',
});
```

### 3. Product Performance

Evaluate product categories and identify quality issues.

```typescript
const result = await orchestrator.executeAgent(agentId, {
  dataset: productCSV,
  question: 'Which categories perform best? Any quality issues?',
  context: 'Product data with ratings and returns',
});
```

### 4. Financial Reporting

Generate insights from financial data.

```typescript
const result = await orchestrator.executeAgent(agentId, {
  dataset: financialCSV,
  question: 'What is our profit margin trend? Where can we cut costs?',
  context: 'Monthly P&L statement',
});
```

## Customization

### Change LLM Provider

The example uses Anthropic Claude by default. To use OpenAI instead:

```typescript
import { OpenAIProvider } from '@stratix/ext-ai-agents-openai';

const provider = new OpenAIProvider({
  apiKey: process.env.OPENAI_API_KEY!,
});

const agent = new DataAnalysisAgent({
  agentId,
  provider,
  model: 'gpt-4o',
  temperature: 0.1,
});
```

Or use a more powerful Claude model:

```typescript
const agent = new DataAnalysisAgent({
  agentId,
  provider,
  model: 'claude-3-opus-20240229', // Most capable Claude 3 model
  temperature: 0.1,
});
```

### Adjust Analysis Depth

Control temperature for more/less creative analysis:

```typescript
// Conservative analysis (low temperature)
const agent = new DataAnalysisAgent({
  agentId,
  provider,
  temperature: 0.0, // Very analytical, factual
});

// Exploratory analysis (higher temperature)
const agent = new DataAnalysisAgent({
  agentId,
  provider,
  temperature: 0.3, // More creative insights
});
```

### Add Custom Tools

Extend the agent with domain-specific tools:

```typescript
class TimeSeriesAnalysisTool extends AgentTool<...> {
  async execute(input) {
    // Perform time series decomposition
    // Calculate moving averages
    // Detect anomalies
    return { forecast, trends, anomalies };
  }
}

// Register in agent
this.timeSeriesTool = new TimeSeriesAnalysisTool();
```

### Customize Output Format

Modify the `AnalysisReportSchema` to include custom fields:

```typescript
export const CustomReportSchema = z.object({
  summary: z.string(),
  findings: z.array(...),
  recommendations: z.array(...),

  // Custom fields
  executiveSummary: z.string(),
  riskAssessment: z.object({
    level: z.enum(['low', 'medium', 'high']),
    factors: z.array(z.string())
  }),
  nextSteps: z.array(z.string())
});
```

## Cost Management

### Set Budget Limits

Prevent expensive analyses from exceeding budget:

```typescript
const result = await orchestrator.executeAgent(
  agentId,
  { dataset, question },
  {
    userId: 'user-123',
    sessionId: 'session-456',
    environment: 'production',
    budget: 0.1, // $0.10 limit
  }
);
```

### Track Costs

Monitor spending across analyses:

```typescript
const executions = await orchestrator.getAuditLog().queryExecutions({
  agentId,
  startDate: new Date('2025-01-01'),
  success: true,
});

const totalCost = executions.reduce((sum, e) => sum + (e.cost || 0), 0);
console.log(`Total spent: $${totalCost.toFixed(4)}`);
```

### Optimize Costs

1. **Use Claude 3 Haiku for simple analyses**: Most cost-effective option ($0.25/$1.25 per 1M tokens)
2. **Cache statistical summaries**: Avoid recomputing stats
3. **Reduce max_tokens**: Lower token limit for concise reports
4. **Batch analyses**: Combine multiple questions in one request
5. **Switch providers based on task**: Use Haiku for quick analyses, Opus for complex insights

## Production Considerations

### Data Privacy

- **Never log sensitive data**: Disable tracing for PII
- **Sanitize inputs**: Remove sensitive columns before analysis
- **Secure API keys**: Use environment variables, not hardcoded keys

```typescript
// Remove sensitive columns
const sanitized = dataset.rows.map((row) => {
  const { ssn, credit_card, ...safe } = row;
  return safe;
});
```

### Error Handling

- **Validate CSV format**: Check headers and data types
- **Handle missing data**: Decide on imputation strategy
- **Set timeouts**: Prevent long-running analyses
- **Graceful degradation**: Return partial results on failure

```typescript
try {
  const result = await agent.execute(request);
  if (result.isFailure()) {
    // Log error, return cached analysis, or default response
    logger.error('Analysis failed', result.error);
    return fallbackAnalysis;
  }
} catch (error) {
  // Handle unexpected errors
}
```

### Performance

- **Limit dataset size**: Sample large datasets (>10k rows)
- **Cache results**: Store analyses for identical datasets
- **Async execution**: Run multiple analyses in parallel
- **Stream results**: Use streaming for long reports

```typescript
// Sample large datasets
if (dataset.rowCount > 10000) {
  const sampled = dataset.rows.sort(() => Math.random() - 0.5).slice(0, 10000);
  dataset = { ...dataset, rows: sampled, rowCount: sampled.length };
}
```

### Monitoring

Track key metrics:

```typescript
const stats = await orchestrator.getAuditLog().getStatistics(agentId);

console.log('Agent Performance:');
console.log(`Success rate: ${stats.successRate.toFixed(2)}%`);
console.log(`Avg duration: ${stats.avgDuration.toFixed(0)}ms`);
console.log(`Total cost: $${stats.totalCost.toFixed(4)}`);
console.log(`Total executions: ${stats.totalExecutions}`);
```

## Advanced Usage

### Multi-Dataset Analysis

Compare multiple datasets:

```typescript
// Analyze dataset 1
const result1 = await agent.execute({
  dataset: salesQ1,
  question: 'What were Q1 performance metrics?',
});

// Analyze dataset 2
const result2 = await agent.execute({
  dataset: salesQ2,
  question: 'What were Q2 performance metrics?',
});

// Compare results
const comparison = compareAnalyses(result1.data, result2.data);
```

### Automated Reporting

Schedule regular analyses:

```typescript
import { CronJob } from 'cron';

// Run daily sales analysis at 9 AM
new CronJob(
  '0 9 * * *',
  async () => {
    const todayData = await fetchSalesData();
    const analysis = await agent.execute({
      dataset: todayData,
      question: 'How did we perform yesterday vs target?',
    });

    await sendSlackReport(analysis.data);
  },
  null,
  true
);
```

### Interactive Analysis

Build a chat interface for iterative exploration:

```typescript
const memory = new InMemoryAgentMemory();

// First question
const result1 = await agent.execute({
  dataset: salesData,
  question: 'What are the top performing products?',
});
await memory.store('last_analysis', result1.data, 'short');

// Follow-up question (with context)
const lastAnalysis = await memory.retrieve('last_analysis');
const result2 = await agent.execute({
  dataset: salesData,
  question: 'Why did those products perform well?',
  context: `Previous analysis: ${JSON.stringify(lastAnalysis)}`,
});
```

## Testing

### Unit Tests

Test individual tools:

```typescript
import { ParseCSVTool } from './tools/ParseCSVTool';

describe('ParseCSVTool', () => {
  it('should parse valid CSV', async () => {
    const tool = new ParseCSVTool();
    const result = await tool.execute({
      csvData: 'name,age\nAlice,30\nBob,25',
    });

    expect(result.dataset.rowCount).toBe(2);
    expect(result.dataset.headers).toEqual(['name', 'age']);
  });
});
```

### Integration Tests

Test complete agent workflow:

```typescript
import { DataAnalysisAgent } from './DataAnalysisAgent';

describe('DataAnalysisAgent', () => {
  it('should analyze sales data', async () => {
    const agent = new DataAnalysisAgent({ ... });
    const result = await agent.execute({
      dataset: salesCSV,
      question: 'What are the trends?'
    });

    expect(result.isSuccess()).toBe(true);
    expect(result.data.findings.length).toBeGreaterThan(0);
  });
});
```

## Troubleshooting

### "No data found in CSV"

**Cause**: Empty CSV or incorrect format

**Solution**: Verify CSV has at least headers and one data row

### "Invalid dataset structure"

**Cause**: Malformed CSV or missing headers

**Solution**: Ensure CSV has consistent column count per row

### "Rate limit exceeded"

**Cause**: Too many OpenAI API requests

**Solution**: Add delays between requests or increase rate limits

### High costs

**Cause**: Using expensive models with large datasets

**Solution**: Switch to Claude 3 Haiku or sample large datasets. Haiku is ~60x cheaper than Opus.

## Learn More

- [Stratix Documentation](../../README.md)
- [AI Agent Framework Guide](../../../docs/ai-agents.md)
- [Tool Development Guide](../../../docs/tools.md)
- [Cost Optimization Guide](../../../docs/cost-optimization.md)

## Support

- GitHub Issues: [github.com/pcarvajal/stratix/issues](https://github.com/pcarvajal/stratix/issues)
- Discord: [discord.gg/stratix](https://discord.gg/stratix)
- Email: support@stratix.dev

## License

MIT
