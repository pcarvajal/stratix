import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero', styles.heroBanner)}>
      <div className="container">
        <div className={styles.heroContent}>
          <div className={styles.heroLeft}>
            <div className={styles.preReleaseWarning}>
              <span className={styles.warningIcon}>⚠️</span>
              <span>PRE-RELEASE - ACTIVE DEVELOPMENT</span>
            </div>

            <div className={styles.brandSection}>
              <img
                src="/stratix/img/rustic-ai-20251120T043545.jpg"
                alt="Stratix Logo"
                className={styles.heroLogo}
              />
              <Heading as="h1" className={styles.heroTitle}>
                Stratix
              </Heading>
            </div>

            <p className={styles.heroSubtitle}>
              AI-First TypeScript Framework for Enterprise Applications
            </p>

            <p className={styles.heroDescription}>
              Build scalable, maintainable applications with AI agents as first-class citizens.
              Start with a modular monolith, scale to microservices when needed.
            </p>

            <div className={styles.buttons}>
              <Link
                className={clsx('button button--primary button--lg', styles.primaryButton)}
                to="/docs/getting-started/introduction">
                Get Started
              </Link>
              <Link
                className={clsx('button button--secondary button--lg', styles.secondaryButton)}
                to="/docs/getting-started/quick-start">
                Quick Start →
              </Link>
            </div>

            <div className={styles.stats}>
              <div className={styles.stat}>
                <div className={styles.statNumber}>14+</div>
                <div className={styles.statLabel}>Official Plugins</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>100%</div>
                <div className={styles.statLabel}>Type-Safe</div>
              </div>
              <div className={styles.stat}>
                <div className={styles.statNumber}>AI</div>
                <div className={styles.statLabel}>First-Class</div>
              </div>
            </div>
          </div>

          <div className={styles.heroRight}>
            <div className={styles.codeWindow}>
              <div className={styles.codeWindowHeader}>
                <div className={styles.codeWindowDots}>
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
                <div className={styles.codeWindowTitle}>main.ts</div>
              </div>
              <pre className={styles.codeContent}>
                {`import { ApplicationBuilder } from '@stratix/runtime';
import { OpenAIProvider } from '@stratix/ai-openai';

// Build AI-powered application
const app = await ApplicationBuilder.create()
  .usePlugin(new OpenAIProvider({ apiKey }))
  .build();

// Create an AI agent
class SupportAgent extends AIAgent {
  readonly name = 'Customer Support';
  
  async execute(input: string) {
    const response = await this.llm.chat({
      model: 'gpt-4o',
      messages: [
        { role: 'system', 
          content: 'You are helpful.' },
        { role: 'user', content: input }
      ]
    });
    
    return AgentResult.success(
      response.content
    );
  }
}

await app.start();`}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.heroBackground}>
        <div className={styles.gridPattern}></div>
      </div>
    </header>
  );
}

export default function Home(): JSX.Element {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - AI-First TypeScript Framework`}
      description="AI-First TypeScript Framework for Enterprise Applications - Modular, Scalable, Production-Ready">
      <HomepageHeader />
    </Layout>
  );
}
