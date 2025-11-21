import type { SidebarsConfig } from '@docusaurus/plugin-content-docs';

/**
 * Comprehensive sidebar configuration for Stratix documentation.
 * 
 * Organized into 6 major sections:
 * 1. Getting Started
 * 2. Core Concepts
 * 3. Plugin System
 * 4. AI Agents (AI-First Feature)
 * 5. CLI Reference
 * 6. Database & Persistence
 */
const sidebars: SidebarsConfig = {
  tutorialSidebar: [
    {
      type: 'doc',
      id: 'intro',
      label: 'Introduction',
    },

    // ========================================
    // 1. GETTING STARTED
    // ========================================
    {
      type: 'category',
      label: 'Getting Started',
      collapsed: false,
      items: [
        'getting-started/introduction',
        'getting-started/installation',
        'getting-started/quick-start',
        'getting-started/project-structure',
      ],
    },

    // ========================================
    // 2. STRATIX COPILOT (VS CODE EXTENSION)
    // ========================================
    {
      type: 'category',
      label: '🤖 Stratix Copilot',
      collapsed: false,
      items: [
        'stratix-copilot/overview',
        'stratix-copilot/installation',
        'stratix-copilot/usage',
        'stratix-copilot/commands',
      ],
    },

    // ========================================
    // 3. CORE CONCEPTS
    // ========================================
    {
      type: 'category',
      label: 'Core Concepts',
      collapsed: false,
      items: [
        'core-concepts/architecture-overview',
        'core-concepts/domain-modeling',
        'core-concepts/result-pattern',
        'core-concepts/cqrs',
        'core-concepts/bounded-contexts',
        'core-concepts/dependency-injection',
      ],
    },

    // ========================================
    // 4. PLUGIN SYSTEM
    // ========================================
    {
      type: 'category',
      label: 'Plugin System',
      collapsed: true,
      items: [
        'plugins/plugin-architecture',
        'plugins/creating-plugins',
        'plugins/official-plugins',
        'plugins/plugin-configuration',
      ],
    },

    // ========================================
    // 5. AI AGENTS (AI-FIRST)
    // ========================================
    {
      type: 'category',
      label: 'AI Agents',
      collapsed: true,
      items: [
        'ai-agents/ai-agents-overview',
        'ai-agents/creating-agents',
        'ai-agents/llm-providers',
        'ai-agents/agent-tools',
        'ai-agents/agent-memory',
        'ai-agents/agent-orchestration',
        'ai-agents/agent-testing',
      ],
    },

    // ========================================
    // 6. CLI REFERENCE
    // ========================================
    {
      type: 'category',
      label: 'CLI Reference',
      collapsed: true,
      items: [
        'cli/cli-overview',
        'cli/new-command',
        'cli/generate-commands',
        'cli/add-command',
        'cli/info-command',
      ],
    },

    // ========================================
    // 7. DATABASE & PERSISTENCE
    // ========================================
    {
      type: 'category',
      label: 'Database & Persistence',
      collapsed: true,
      items: [
        'database/database-overview',
        'database/postgres',
        'database/mongodb',
        'database/redis',
      ],
    },
  ],
};

export default sidebars;
