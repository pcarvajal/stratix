import {
  AIAgent,
  AgentResult,
  AgentVersionFactory,
  AgentCapabilities,
  type AgentId,
  type ModelConfig
} from '@stratix/primitives';
import { type LLMProvider } from '@stratix/abstractions';
import { ParseCSVTool } from './tools/ParseCSVTool.js';
import { CalculateStatisticsTool } from './tools/CalculateStatisticsTool.js';
import {
  AnalysisReportSchema,
  type AnalysisRequest,
  type AnalysisReport,
  type Dataset
} from './domain/types.js';

export interface DataAnalysisAgentConfig {
  agentId: AgentId;
  provider: LLMProvider;
  model?: string;
  temperature?: number;
}

export class DataAnalysisAgent extends AIAgent<AnalysisRequest, AnalysisReport> {
  readonly name = 'Data Analysis Agent';
  readonly description = 'Analyzes datasets and provides statistical insights';
  readonly version = AgentVersionFactory.create('1.0.0');
  readonly capabilities = [
    AgentCapabilities.DATA_ANALYSIS,
    AgentCapabilities.KNOWLEDGE_RETRIEVAL
  ];
  readonly model: ModelConfig;

  private provider: LLMProvider;
  private parseCSVTool: ParseCSVTool;
  private calculateStatsTool: CalculateStatisticsTool;

  constructor(config: DataAnalysisAgentConfig) {
    super(config.agentId, new Date(), new Date());

    this.provider = config.provider;
    this.model = {
      provider: this.provider.name,
      model: config.model || 'claude-3-haiku-20240307',
      temperature: config.temperature ?? 0.1, // Low temperature for analytical tasks
      maxTokens: 4000
    };

    // Initialize tools
    this.parseCSVTool = new ParseCSVTool();
    this.calculateStatsTool = new CalculateStatisticsTool();
  }

  async execute(input: AnalysisRequest): Promise<AgentResult<AnalysisReport>> {
    const startTime = Date.now();

    try {
      // Step 1: Parse CSV data
      const { dataset, preview } = await this.parseCSVTool.executeValidated({
        csvData: input.dataset
      });

      // Step 2: Calculate statistics
      const { report } = await this.calculateStatsTool.executeValidated({
        dataset
      });

      // Step 3: Analyze with LLM
      const analysis = await this.analyzeWithLLM(
        input.question,
        dataset,
        preview,
        report,
        input.context
      );

      const duration = Date.now() - startTime;

      return AgentResult.success(analysis, {
        model: this.model.model,
        duration,
        cost: 0.01 // Approximate cost
      });
    } catch (error) {
      const duration = Date.now() - startTime;
      return AgentResult.failure(
        error instanceof Error ? error : new Error('Unknown error during analysis'),
        {
          model: this.model.model,
          duration
        }
      );
    }
  }

  private async analyzeWithLLM(
    question: string,
    dataset: Dataset,
    preview: string,
    statsReport: string,
    context?: string
  ): Promise<AnalysisReport> {
    const systemPrompt = `You are a professional data analyst. Your job is to analyze datasets and provide clear, actionable insights.

When analyzing data:
1. Start with a brief summary
2. Identify key findings with confidence levels
3. Provide evidence-based recommendations
4. Assess data quality
5. Suggest useful visualizations

Be precise, objective, and focus on actionable insights.

IMPORTANT: You must respond with ONLY valid JSON matching this exact schema:
{
  "summary": "string - Executive summary of the analysis",
  "findings": [
    {
      "finding": "string - The key finding",
      "confidence": "high" | "medium" | "low",
      "evidence": "string - Evidence supporting this finding"
    }
  ],
  "recommendations": ["string - Actionable recommendation"],
  "statistics": {
    "totalRows": number,
    "totalColumns": number,
    "dataQuality": "excellent" | "good" | "fair" | "poor"
  },
  "visualizationSuggestions": ["string - Visualization suggestion"] (optional)
}

Do not include any text before or after the JSON. Output only the JSON object.`;

    const userPrompt = `Analyze this dataset and answer the question.

QUESTION: ${question}

${context ? `CONTEXT: ${context}\n` : ''}
DATASET PREVIEW:
${preview}

STATISTICAL SUMMARY:
${statsReport}

Dataset has ${dataset.rowCount} rows and ${dataset.columnCount} columns.

Provide a comprehensive analysis addressing the question. Focus on:
- Key findings from the data
- Statistical significance
- Actionable recommendations
- Data quality assessment
- Visualization suggestions

Respond with ONLY a JSON object following the schema provided in the system prompt.`;

    // For Anthropic, we use prompt engineering instead of responseFormat
    // For OpenAI, we use structured outputs with responseFormat
    const messages = [
      { role: 'system' as const, content: systemPrompt, timestamp: new Date() },
      { role: 'user' as const, content: userPrompt, timestamp: new Date() }
    ];

    const baseParams = {
      model: this.model.model,
      messages,
      temperature: this.model.temperature,
      maxTokens: this.model.maxTokens
    };

    const chatParams = this.provider.name === 'openai'
      ? {
          ...baseParams,
          responseFormat: {
            type: 'json_schema' as const,
            schema: AnalysisReportSchema as unknown as Record<string, unknown>
          }
        }
      : baseParams;

    const response = await this.provider.chat(chatParams);

    // Parse LLM response - extract JSON from markdown code blocks if present
    let content = response.content.trim();

    // Remove markdown code blocks if present
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      content = jsonMatch[1].trim();
    }

    const parsed = JSON.parse(content);

    // Validate with Zod
    return AnalysisReportSchema.parse(parsed);
  }

  protected async afterExecute(result: AgentResult<AnalysisReport>): Promise<void> {
    if (result.isSuccess()) {
      console.log(`[DataAnalysisAgent] Analysis completed successfully`);
      console.log(`[DataAnalysisAgent] Found ${result.data.findings.length} key findings`);
    } else {
      console.log(`[DataAnalysisAgent] Analysis failed: ${result.error}`);
    }
  }

  protected async onError(error: Error): Promise<void> {
    console.error(`[DataAnalysisAgent] Error during analysis:`, error.message);
  }
}
