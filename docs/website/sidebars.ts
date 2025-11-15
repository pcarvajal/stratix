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
        'core-concepts/bounded-contexts',
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
          label: 'Core Packages',
          items: [
            'api-reference/primitives/overview',
            'api-reference/abstractions/overview',
            'api-reference/runtime/overview',
          ],
        },
        {
          type: 'category',
          label: 'Tools',
          items: [
            'api-reference/tools/create-stratix',
          ],
        },
      ],
    },
  ],
};

export default sidebars;
