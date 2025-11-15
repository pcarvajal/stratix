import { MockAgent, type MockInput } from './MockAgent.js';
import { MockLLMProvider } from './MockLLMProvider.js';

/**
 * Level 2: Mock Agent Example
 *
 * Run this to learn about testing agents with mock LLM providers.
 * No API key required!
 */
export async function runMockExample() {
  console.log('\n=== Level 2: Mock Agent ===\n');
  console.log('This agent uses a mock LLM provider for testing.');
  console.log('- No API key required');
  console.log('- Deterministic responses');
  console.log('- Perfect for testing\n');

  // 1. Create mock LLM provider with predefined responses
  const mockProvider = new MockLLMProvider({
    responses: [
      'Based on current data, the weather is sunny and warm with temperatures around 75 degrees F!',
      'Quantum computing uses quantum mechanics principles like superposition and entanglement to process information in ways classical computers cannot.',
      'The capital of France is Paris, a beautiful city known for the Eiffel Tower, Louvre Museum, and rich cultural history.',
      'Artificial Intelligence is transforming industries by enabling machines to learn from data and make intelligent decisions.',
    ],
    costPer1kTokens: 0.001,
    tokensPerRequest: 100,
    modelName: 'mock-gpt-4',
    latencyMs: 50, // Simulate 50ms latency
  });

  // 2. Create Mock Agent
  const mockAgent = new MockAgent(mockProvider);

  console.log(`Agent: ${mockAgent.name} v${mockAgent.version.value}`);
  console.log(`Capabilities: ${mockAgent.capabilities.join(', ')}`);
  console.log(`Provider: Mock LLM (deterministic)\n`);

  // 3. Test cases with different inputs
  const testCases: MockInput[] = [
    {
      message: 'What is the weather today?',
      context: 'You are a weather assistant.',
    },
    {
      message: 'Explain quantum computing in simple terms.',
      context: 'You are an educational assistant.',
    },
    {
      message: 'What is the capital of France?',
      context: 'You are a geography expert.',
    },
    {
      message: 'Tell me about AI and machine learning.',
      context: 'You are a technology expert.',
    },
  ];

  console.log('--- Running Test Cases ---\n');

  for (let i = 0; i < testCases.length; i++) {
    const input = testCases[i];
    const testNum = i + 1;

    console.log(`Test ${testNum}/${testCases.length}:`);
    console.log(`  Question: "${input.message}"`);
    console.log(`  Context: "${input.context}"`);

    const startTime = Date.now();
    const result = await mockAgent.execute(input);
    const duration = Date.now() - startTime;

    if (result.success && result.data) {
      const data = result.data;
      console.log(`  Answer: "${data.response}"`);
      console.log(`  Model: ${data.model}`);
      console.log(`  Tokens: ${data.tokensUsed} (simulated)`);
      console.log(`  Cost: $${data.cost.toFixed(4)} (simulated)`);
      console.log(`  Duration: ${duration}ms\n`);
    } else if (result.error) {
      console.log(`  Error: ${result.error.message}\n`);
    }
  }

  // 4. Demonstrate provider reset
  console.log('--- Testing Provider Reset ---\n');
  console.log('Resetting mock provider to replay responses...\n');

  mockProvider.reset();

  const repeatTest = testCases[0];
  console.log(`Repeating Test 1: "${repeatTest.message}"`);

  const result = await mockAgent.execute(repeatTest);

  if (result.success && result.data) {
    const data = result.data;
    console.log(`Answer: "${data.response}"`);
    console.log('(Notice: Same response as first execution - deterministic!)\n');
  }

  // 5. Test with failure simulation
  console.log('--- Testing Failure Simulation ---\n');

  const failingProvider = new MockLLMProvider({
    responses: ['This should not appear'],
    failureRate: 1.0, // Always fail
  });

  const failingAgent = new MockAgent(failingProvider);

  console.log('Testing with 100% failure rate...');
  const failResult = await failingAgent.execute({ message: 'This will fail' });

  if (!failResult.success && failResult.error) {
    console.log(`Failure handled correctly: ${failResult.error.message}`);
  }

  console.log('\n=== Level 2 Complete! ===\n');
  console.log('Key Learnings:');
  console.log('1. LLM providers are abstracted behind an interface');
  console.log('2. Mock providers enable testing without API calls');
  console.log('3. Deterministic responses make tests reliable');
  console.log('4. Cost and token tracking works the same way');
  console.log('5. Easy to swap mock for real provider\n');
  console.log('Next: Try Level 3 (Basic LLM) to use a real LLM!\n');
  console.log('Note: Level 3 requires an API key and will incur small costs (~$0.01-0.05)\n');
}

// Allow running directly
if (import.meta.url === `file://${process.argv[1]}`) {
  runMockExample().catch(console.error);
}
