import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/**
 * Creating a sidebar enables you to:
 - create an ordered group of docs
 - render a sidebar for each doc of that group
 - provide next/previous navigation

 The sidebars can be generated from the filesystem, or explicitly defined here.

 Create as many sidebars as you want.
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'category',
      label: 'Getting Started',
      items: [
        'getting-started/introduction',
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/versioning',
      ],
    },
    {
      type: 'category',
      label: 'Core Concepts',
      items: [
        'core-concepts/architecture',
        'core-concepts/modules',
        'core-concepts/ai-agents',
        'core-concepts/entities',
        'core-concepts/value-objects',
        'core-concepts/cqrs',
      ],
    },
    {
      type: 'category',
      label: 'Examples',
      items: [
        'examples/overview',
        'examples/bc-migration',
      ],
    },
    {
      type: 'category',
      label: 'Advanced',
      items: [
        'advanced/testing',
      ],
    },
    {
      type: 'category',
      label: 'API Reference',
      items: [
        'api-reference/index',
        {
          type: 'category',
          label: 'Layer 1 - Primitives',
          items: [
            'api-reference/primitives/primitives-overview',
            'api-reference/primitives/entity',
            'api-reference/primitives/aggregate-root',
            'api-reference/primitives/value-object',
            'api-reference/primitives/entity-id',
            'api-reference/primitives/result',
            'api-reference/primitives/domain-event',
            'api-reference/primitives/domain-service',
            'api-reference/primitives/domain-error',
            'api-reference/primitives/specification',
            {
              type: 'category',
              label: 'Value Objects',
              items: [
                'api-reference/primitives/money',
                'api-reference/primitives/currency',
                'api-reference/primitives/email',
                'api-reference/primitives/uuid',
              ],
            },
            {
              type: 'category',
              label: 'AI Agents',
              items: [
                'api-reference/primitives/ai-agents/ai-agents-overview',
                'api-reference/primitives/ai-agents/ai-agent',
                'api-reference/primitives/ai-agents/stratix-tool',
                'api-reference/primitives/ai-agents/agent-context',
                'api-reference/primitives/ai-agents/types',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Layer 2 - Abstractions',
          items: [
            'api-reference/abstractions/abstractions-overview',
            'api-reference/abstractions/container',
            'api-reference/abstractions/logger',
            'api-reference/abstractions/repository',
            'api-reference/abstractions/event-bus',
            'api-reference/abstractions/plugin',
            'api-reference/abstractions/context-module',
            {
              type: 'category',
              label: 'CQRS',
              items: [
                'api-reference/abstractions/cqrs/cqrs-overview',
                'api-reference/abstractions/cqrs/command',
                'api-reference/abstractions/cqrs/query',
                'api-reference/abstractions/cqrs/command-bus',
                'api-reference/abstractions/cqrs/query-bus',
              ],
            },
            {
              type: 'category',
              label: 'AI Agents',
              items: [
                'api-reference/abstractions/ai-agents/ai-agents-abstractions-overview',
                'api-reference/abstractions/ai-agents/llm-provider',
                'api-reference/abstractions/ai-agents/agent-repository',
                'api-reference/abstractions/ai-agents/memory-store',
              ],
            },
          ],
        },
        {
          type: 'category',
          label: 'Layer 3 - Runtime',
          items: [
            'api-reference/runtime/runtime-overview',
            'api-reference/runtime/application-builder',
            'api-reference/runtime/application',
            'api-reference/runtime/lifecycle-manager',
            'api-reference/runtime/dependency-graph',
            'api-reference/runtime/plugin-registry',
            'api-reference/runtime/base-context-module',
            'api-reference/runtime/plugin-context',
            'api-reference/runtime/default-plugin-context',
            'api-reference/runtime/runtime-error',
          ],
        },
        {
          type: 'category',
          label: 'Tools',
          items: [
            'api-reference/tools/cli',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
