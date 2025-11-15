import { describe, it, expect, beforeEach } from 'vitest';
import { OpenAIProvider } from '../OpenAIProvider.js';

describe('OpenAIProvider', () => {
  describe('construction', () => {
    it('should create provider with API key', () => {
      const provider = new OpenAIProvider({
        apiKey: 'test-api-key',
      });

      expect(provider.name).toBe('openai');
      expect(provider.models).toContain('gpt-4');
      expect(provider.models).toContain('gpt-3.5-turbo');
    });

    it('should have correct models list', () => {
      const provider = new OpenAIProvider({
        apiKey: 'test-api-key',
      });

      expect(provider.models).toEqual([
        'gpt-4o',
        'gpt-4o-mini',
        'gpt-4',
        'gpt-4-turbo',
        'gpt-4-turbo-preview',
        'gpt-3.5-turbo',
        'gpt-3.5-turbo-16k',
      ]);
    });
  });

  describe('cost calculation', () => {
    let provider: OpenAIProvider;

    beforeEach(() => {
      provider = new OpenAIProvider({
        apiKey: 'test-api-key',
      });
    });

    it('should calculate cost for GPT-4', () => {
      const cost = provider.calculateCost('gpt-4', {
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
      });

      // 1000/1M * 30 + 500/1M * 60 = 0.03 + 0.03 = 0.06
      expect(cost).toBeCloseTo(0.06, 6);
    });

    it('should calculate cost for GPT-3.5', () => {
      const cost = provider.calculateCost('gpt-3.5-turbo', {
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
      });

      // 1000/1M * 0.50 + 500/1M * 1.50 = 0.0005 + 0.00075 = 0.00125
      expect(cost).toBeCloseTo(0.00125, 6);
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
      const cost = provider.calculateCost('gpt-4', {
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
      });

      expect(cost).toBe(0);
    });

    it('should calculate cost for different token amounts', () => {
      const cost1 = provider.calculateCost('gpt-4', {
        promptTokens: 100,
        completionTokens: 50,
        totalTokens: 150,
      });

      const cost2 = provider.calculateCost('gpt-4', {
        promptTokens: 10000,
        completionTokens: 5000,
        totalTokens: 15000,
      });

      expect(cost2).toBeCloseTo(cost1 * 100, 5);
    });
  });

  describe('Real-world usage patterns', () => {
    it('should calculate realistic conversation costs', () => {
      const provider = new OpenAIProvider({ apiKey: 'test-key' });

      // Small query
      const smallCost = provider.calculateCost('gpt-4', {
        promptTokens: 50,
        completionTokens: 100,
        totalTokens: 150,
      });

      // Should be under $0.01
      expect(smallCost).toBeLessThan(0.01);

      // Large query
      const largeCost = provider.calculateCost('gpt-4', {
        promptTokens: 3000,
        completionTokens: 1000,
        totalTokens: 4000,
      });

      // Should be around $0.15
      expect(largeCost).toBeGreaterThan(0.1);
      expect(largeCost).toBeLessThan(0.2);
    });

    it('should show GPT-3.5 is cheaper than GPT-4', () => {
      const provider = new OpenAIProvider({ apiKey: 'test-key' });

      const usage = {
        promptTokens: 1000,
        completionTokens: 500,
        totalTokens: 1500,
      };

      const gpt4Cost = provider.calculateCost('gpt-4', usage);
      const gpt35Cost = provider.calculateCost('gpt-3.5-turbo', usage);

      expect(gpt35Cost).toBeLessThan(gpt4Cost);
      expect(gpt4Cost / gpt35Cost).toBeGreaterThan(40); // GPT-4 is ~48x more expensive
    });

    it('should calculate embedding costs', () => {
      const provider = new OpenAIProvider({ apiKey: 'test-key' });

      const cost = provider.calculateCost('text-embedding-3-small', {
        promptTokens: 1000,
        completionTokens: 0,
        totalTokens: 1000,
      });

      // Should be very cheap: 1000/1M * 0.02 = 0.00002
      expect(cost).toBeCloseTo(0.00002, 8);
      expect(cost).toBeLessThan(0.0001);
    });

    it('should estimate monthly costs', () => {
      const provider = new OpenAIProvider({ apiKey: 'test-key' });

      // Assume 1000 queries per day, average 100 prompt + 200 completion tokens
      const dailyQueries = 1000;
      const avgPromptTokens = 100;
      const avgCompletionTokens = 200;

      const costPerQuery = provider.calculateCost('gpt-3.5-turbo', {
        promptTokens: avgPromptTokens,
        completionTokens: avgCompletionTokens,
        totalTokens: avgPromptTokens + avgCompletionTokens,
      });

      const dailyCost = costPerQuery * dailyQueries;
      const monthlyCost = dailyCost * 30;

      // Should be manageable for GPT-3.5
      expect(monthlyCost).toBeLessThan(100); // Under $100/month
      expect(monthlyCost).toBeGreaterThan(0.1); // But not negligible
    });
  });

  describe('provider metadata', () => {
    it('should have correct provider name', () => {
      const provider = new OpenAIProvider({ apiKey: 'test-key' });

      expect(provider.name).toBe('openai');
    });

    it('should list available models', () => {
      const provider = new OpenAIProvider({ apiKey: 'test-key' });

      expect(provider.models.length).toBeGreaterThan(0);
      expect(provider.models).toContain('gpt-4');
    });
  });
});
