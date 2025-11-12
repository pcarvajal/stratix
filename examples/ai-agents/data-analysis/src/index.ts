import { EntityId, AgentContext } from '@stratix/primitives';
import { StratixAgentOrchestrator, InMemoryExecutionAuditLog, InMemoryAgentRepository } from '@stratix/impl-ai-agents';
import { AnthropicProvider } from '@stratix/ext-ai-agents-anthropic';
import { DataAnalysisAgent } from './DataAnalysisAgent.js';
import type { AnalysisReport } from './domain/types.js';

// Sample datasets
const salesDataCSV = `month,revenue,expenses,profit,customers
January,45000,32000,13000,120
February,52000,35000,17000,145
March,48000,33000,15000,132
April,61000,38000,23000,178
May,58000,36000,22000,165
June,72000,42000,30000,201
July,68000,40000,28000,189
August,75000,43000,32000,215
September,70000,41000,29000,198
October,82000,46000,36000,234
November,88000,48000,40000,256
December,95000,52000,43000,289`;

const customerDataCSV = `customer_id,age,plan,usage_gb,satisfaction,churn
1001,28,premium,45,8,no
1002,35,basic,12,6,no
1003,42,premium,67,9,no
1004,25,basic,8,5,yes
1005,51,enterprise,120,9,no
1006,33,premium,52,7,no
1007,29,basic,15,4,yes
1008,45,enterprise,98,8,no
1009,38,premium,61,8,no
1010,27,basic,9,3,yes
1011,55,enterprise,145,9,no
1012,31,premium,48,7,no
1013,26,basic,11,5,yes
1014,49,enterprise,110,9,no
1015,36,premium,55,8,no`;

const productDataCSV = `product_id,category,price,units_sold,rating,returns
P001,electronics,299,145,4.5,5
P002,clothing,49,523,4.2,15
P003,electronics,899,67,4.8,2
P004,home,129,234,4.3,8
P005,electronics,549,189,4.6,6
P006,clothing,39,678,4.1,22
P007,home,79,345,4.4,12
P008,electronics,1299,45,4.9,1
P009,clothing,69,456,4.3,18
P010,home,199,178,4.5,7`;

async function main() {
  console.log('='.repeat(60));
  console.log('Stratix Data Analysis Agent - Example');
  console.log('='.repeat(60));
  console.log('');

  // Check for Anthropic API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.error('ERROR: ANTHROPIC_API_KEY environment variable not set');
    console.error('');
    console.error('Please set your Anthropic API key:');
    console.error('  export ANTHROPIC_API_KEY="your-api-key-here"');
    console.error('');
    process.exit(1);
  }

  // Initialize provider
  const provider = new AnthropicProvider({ apiKey });

  // Create agent
  const agentId = EntityId.create<'AIAgent'>();
  const agent = new DataAnalysisAgent({
    agentId,
    provider,
    model: 'claude-3-haiku-20240307',
    temperature: 0.1
  });

  // Initialize orchestrator
  const repository = new InMemoryAgentRepository();
  const auditLog = new InMemoryExecutionAuditLog();
  const orchestrator = new StratixAgentOrchestrator(
    repository,
    auditLog,
    provider,
    {
      auditEnabled: true,
      budgetEnforcement: true,
      autoRetry: true,
      maxRetries: 2
    }
  );

  await orchestrator.registerAgent(agent);

  // Example 1: Sales Trend Analysis
  console.log('\n' + '-'.repeat(60));
  console.log('Example 1: Sales Trend Analysis');
  console.log('-'.repeat(60) + '\n');

  const salesContext = new AgentContext({
    userId: 'demo-user',
    sessionId: 'demo-session-1',
    environment: 'development'
  });

  const salesResult = await orchestrator.executeAgent(
    agentId,
    {
      dataset: salesDataCSV,
      question: 'What are the sales trends throughout the year? Are there any seasonal patterns?',
      context: 'This is monthly sales data for a retail business. Revenue and profit are in dollars.'
    },
    salesContext
  );

  if (salesResult.isSuccess()) {
    const report = salesResult.data as AnalysisReport;
    console.log('SUMMARY:');
    console.log(report.summary);
    console.log('');
    console.log('KEY FINDINGS:');
    report.findings.forEach((finding, i: number) => {
      console.log(`${i + 1}. [${finding.confidence.toUpperCase()}] ${finding.finding}`);
      console.log(`   Evidence: ${finding.evidence}`);
    });
    console.log('');
    console.log('RECOMMENDATIONS:');
    report.recommendations.forEach((rec: string, i: number) => {
      console.log(`${i + 1}. ${rec}`);
    });
  } else {
    console.error('Analysis failed:', salesResult.error);
  }

  // Example 2: Customer Churn Analysis
  console.log('\n' + '-'.repeat(60));
  console.log('Example 2: Customer Churn Analysis');
  console.log('-'.repeat(60) + '\n');

  const churnContext = new AgentContext({
    userId: 'demo-user',
    sessionId: 'demo-session-2',
    environment: 'development'
  });

  const churnResult = await orchestrator.executeAgent(
    agentId,
    {
      dataset: customerDataCSV,
      question: 'Which customer segments are most likely to churn? What patterns can you identify?',
      context: 'Customer data including plan type, usage, satisfaction scores, and churn status.'
    },
    churnContext
  );

  if (churnResult.isSuccess()) {
    const report = churnResult.data as AnalysisReport;
    console.log('SUMMARY:');
    console.log(report.summary);
    console.log('');
    console.log('KEY FINDINGS:');
    report.findings.forEach((finding, i: number) => {
      console.log(`${i + 1}. [${finding.confidence.toUpperCase()}] ${finding.finding}`);
      console.log(`   Evidence: ${finding.evidence}`);
    });
    console.log('');
    console.log('RECOMMENDATIONS:');
    report.recommendations.forEach((rec: string, i: number) => {
      console.log(`${i + 1}. ${rec}`);
    });
  } else {
    console.error('Analysis failed:', churnResult.error);
  }

  // Example 3: Product Performance Analysis
  console.log('\n' + '-'.repeat(60));
  console.log('Example 3: Product Performance Analysis');
  console.log('-'.repeat(60) + '\n');

  const productContext = new AgentContext({
    userId: 'demo-user',
    sessionId: 'demo-session-3',
    environment: 'development'
  });
  productContext.setBudget(0.50); // Set budget limit

  const productResult = await orchestrator.executeAgent(
    agentId,
    {
      dataset: productDataCSV,
      question: 'Which product categories are performing best? Are there any quality issues we should address?',
      context: 'Product sales data with ratings and return rates across different categories.'
    },
    productContext
  );

  if (productResult.isSuccess()) {
    const report = productResult.data as AnalysisReport;
    console.log('SUMMARY:');
    console.log(report.summary);
    console.log('');
    console.log('KEY FINDINGS:');
    report.findings.forEach((finding, i: number) => {
      console.log(`${i + 1}. [${finding.confidence.toUpperCase()}] ${finding.finding}`);
      console.log(`   Evidence: ${finding.evidence}`);
    });
    console.log('');
    console.log('RECOMMENDATIONS:');
    report.recommendations.forEach((rec: string, i: number) => {
      console.log(`${i + 1}. ${rec}`);
    });
    console.log('');
    if (report.visualizationSuggestions) {
      console.log('VISUALIZATION SUGGESTIONS:');
      report.visualizationSuggestions.forEach((viz: string, i: number) => {
        console.log(`${i + 1}. ${viz}`);
      });
    }
  } else {
    console.error('Analysis failed:', productResult.error);
  }

  // Display execution statistics
  console.log('\n' + '='.repeat(60));
  console.log('Execution Summary');
  console.log('='.repeat(60));

  const executions = await auditLog.queryExecutions({
    agentId,
    success: true
  });

  console.log(`Total analyses: ${executions.length}`);
  if (executions.length > 0) {
    const avgDuration = executions.reduce((acc, e) => acc + e.duration, 0) / executions.length;
    const totalCost = executions.reduce((acc, e) => acc + (e.cost || 0), 0);
    console.log(`Average duration: ${avgDuration.toFixed(2)}ms`);
    console.log(`Total cost: $${totalCost.toFixed(4)}`);
  }

  console.log('\nDone!');
}

// Run examples
main().catch(console.error);
