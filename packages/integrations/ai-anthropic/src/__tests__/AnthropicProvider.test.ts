import { describe, it, expect, beforeEach } from 'vitest';
import { AnthropicProvider } from '../AnthropicProvider.js';

describe('AnthropicProvider', () => {
  describe('construction', () => {
    it('should create provider with API key', () => {
      const provider = new AnthropicProvider({
        apiKey: 'test-api-key',
      });

      expect(provider.name).toBe('anthropic');
      expect(provider.models).toContain('claude-3-opus-20240229');
      expect(provider.models).toContain('claude-3-sonnet-20240229');
      expect(provider.models).toContain('claude-3-haiku-20240307');
    });

    it('should have correct models list', () => {
      const provider = new AnthropicProvider({
        apiKey: 'test-api-key',
      });

      expect(provider.models).toEqual([
        'claude-3-opus-20240229',
        'claude-3-sonnet-20240229',
        'claude-3-haiku-20240307',
        'claude-3-5-sonnet-20241022',
      ]);
    });
  });

  describe('cost calculation', () => {
    let provider: AnthropicProvider;

    beforeEach(() => {
      provider = new AnthropicProvider({
        apiKey: 'test-api-key',
      });
    });

    it('should calculate cost for Claude 3 Opus', () => {
      const cost = provider.calculateCost('claude-3-opus-20240229', {
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
      });

      // 1000/1M * 15 + 500/1M * 75 = 0.015 + 0.0375 = 0.0525
      expect(cost).toBeCloseTo(0.0525, 6);
    });

    it('should calculate cost for Claude 3 Sonnet', () => {
      const cost = provider.calculateCost('claude-3-sonnet-20240229', {
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
      });

      // 1000/1M * 3 + 500/1M * 15 = 0.003 + 0.0075 = 0.0105
      expect(cost).toBeCloseTo(0.0105, 6);
    });

    it('should calculate cost for Claude 3 Haiku', () => {
      const cost = provider.calculateCost('claude-3-haiku-20240307', {
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
      });

      // 1000/1M * 0.25 + 500/1M * 1.25 = 0.00025 + 0.000625 = 0.000875
      expect(cost).toBeCloseTo(0.000875, 6);
    });

    it('should calculate cost for Claude 3.5 Sonnet', () => {
      const cost = provider.calculateCost('claude-3-5-sonnet-20241022', {
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
      });

      // Same pricing as Claude 3 Sonnet
      expect(cost).toBeCloseTo(0.0105, 6);
    });

    it('should return zero for unknown model', () => {
      const cost = provider.calculateCost('unknown-model', {
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
      });

      expect(cost).toBe(0);
    });

    it('should handle zero tokens', () => {
      const cost = provider.calculateCost('claude-3-sonnet-20240229', {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      });

      expect(cost).toBe(0);
    });
  });

  describe('Real-world usage patterns', () => {
    it('should calculate realistic conversation costs', () => {
      const provider = new AnthropicProvider({ apiKey: 'test-key' });

      // Small query with Haiku
      const smallCost = provider.calculateCost('claude-3-haiku-20240307', {
        promptTokens: 50,
        completionTokens: 100,
        totalTokens: 150,
      });

      // Should be very cheap
      expect(smallCost).toBeLessThan(0.001);

      // Large query with Opus
      const largeCost = provider.calculateCost('claude-3-opus-20240229', {
        promptTokens: 3000,
        completionTokens: 1000,
        totalTokens: 4000,
      });

      // Should be around $0.12
      expect(largeCost).toBeGreaterThan(0.1);
      expect(largeCost).toBeLessThan(0.15);
    });

    it('should show cost differences between models', () => {
      const provider = new AnthropicProvider({ apiKey: 'test-key' });

      const usage = {
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
      };

      const opusCost = provider.calculateCost('claude-3-opus-20240229', usage);
      const sonnetCost = provider.calculateCost('claude-3-sonnet-20240229', usage);
      const haikuCost = provider.calculateCost('claude-3-haiku-20240307', usage);

      // Opus should be most expensive
      expect(opusCost).toBeGreaterThan(sonnetCost);
      expect(sonnetCost).toBeGreaterThan(haikuCost);

      // Opus is 5x more expensive than Sonnet
      expect(opusCost / sonnetCost).toBeCloseTo(5, 1);

      // Sonnet is ~12x more expensive than Haiku
      expect(sonnetCost / haikuCost).toBeGreaterThan(10);
    });

    it('should show Haiku is cheapest for high-volume', () => {
      const provider = new AnthropicProvider({ apiKey: 'test-key' });

      // 10,000 queries with average tokens
      const queries = 10000;
      const avgPromptTokens = 100;
      const avgCompletionTokens = 200;

      const haikuCostPerQuery = provider.calculateCost('claude-3-haiku-20240307', {
        promptTokens: avgPromptTokens,
        completionTokens: avgCompletionTokens,
        totalTokens: avgPromptTokens + avgCompletionTokens,
      });

      const sonnetCostPerQuery = provider.calculateCost('claude-3-sonnet-20240229', {
        promptTokens: avgPromptTokens,
        completionTokens: avgCompletionTokens,
        totalTokens: avgPromptTokens + avgCompletionTokens,
      });

      const haikuTotal = haikuCostPerQuery * queries;
      const sonnetTotal = sonnetCostPerQuery * queries;

      // Haiku total should be under $10
      expect(haikuTotal).toBeLessThan(10);

      // Sonnet would be significantly more
      expect(sonnetTotal).toBeGreaterThan(haikuTotal * 10);
    });

    it('should estimate monthly costs for different tiers', () => {
      const provider = new AnthropicProvider({ apiKey: 'test-key' });

      const dailyQueries = 1000;
      const avgPromptTokens = 150;
      const avgCompletionTokens = 300;

      const usage = {
        promptTokens: avgPromptTokens,
        completionTokens: avgCompletionTokens,
        totalTokens: avgPromptTokens + avgCompletionTokens,
      };

      // Haiku tier (fast, simple responses)
      const haikuDailyCost =
        provider.calculateCost('claude-3-haiku-20240307', usage) * dailyQueries;
      const haikuMonthlyCost = haikuDailyCost * 30;

      // Sonnet tier (balanced)
      const sonnetDailyCost =
        provider.calculateCost('claude-3-sonnet-20240229', usage) * dailyQueries;
      const sonnetMonthlyCost = sonnetDailyCost * 30;

      // Opus tier (complex reasoning)
      const opusDailyCost = provider.calculateCost('claude-3-opus-20240229', usage) * dailyQueries;
      const opusMonthlyCost = opusDailyCost * 30;

      // Haiku: Very affordable for high volume
      expect(haikuMonthlyCost).toBeLessThan(20);

      // Sonnet: Moderate cost
      expect(sonnetMonthlyCost).toBeGreaterThan(50);
      expect(sonnetMonthlyCost).toBeLessThan(200);

      // Opus: Premium pricing
      expect(opusMonthlyCost).toBeGreaterThan(250);
    });

    it('should compare with GPT-4 equivalent pricing', () => {
      const provider = new AnthropicProvider({ apiKey: 'test-key' });

      const usage = {
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
      };

      // Claude 3 Opus (comparable to GPT-4)
      const opusCost = provider.calculateCost('claude-3-opus-20240229', usage);

      // GPT-4 would be: 1000/1M * 30 + 500/1M * 60 = 0.03 + 0.03 = 0.06
      const gpt4Cost = 0.06;

      // Opus should be cheaper than GPT-4
      expect(opusCost).toBeLessThan(gpt4Cost);
    });
  });

  describe('provider metadata', () => {
    it('should have correct provider name', () => {
      const provider = new AnthropicProvider({ apiKey: 'test-key' });

      expect(provider.name).toBe('anthropic');
    });

    it('should list available models', () => {
      const provider = new AnthropicProvider({ apiKey: 'test-key' });

      expect(provider.models.length).toBe(4);
      expect(provider.models).toContain('claude-3-opus-20240229');
      expect(provider.models).toContain('claude-3-sonnet-20240229');
      expect(provider.models).toContain('claude-3-haiku-20240307');
      expect(provider.models).toContain('claude-3-5-sonnet-20241022');
    });
  });

  describe('embeddings', () => {
    it('should throw error for embeddings', async () => {
      const provider = new AnthropicProvider({ apiKey: 'test-key' });

      await expect(
        provider.embeddings({
          model: 'any-model',
          input: ['test'],
        })
      ).rejects.toThrow('Anthropic does not support embeddings');
    });
  });
});
