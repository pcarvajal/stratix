import type {ReactNode} from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <div style={{textAlign: 'center'}}>
          <img
            src={useBaseUrl('/img/logo-light.png')}
            alt="Stratix Logo"
            className={styles.heroLogo}
            style={{
              width: '160px',
              height: 'auto',
              maxWidth: '100%',
              marginBottom: '3rem',
              filter: 'drop-shadow(0 20px 25px rgb(0 0 0 / 0.15))'
            }}
          />
          <Heading as="h1" className="hero__title" style={{color: 'white'}}>
            Enterprise TypeScript, Done Right
          </Heading>
          <p className="hero__subtitle" style={{color: 'rgba(255, 255, 255, 0.9)'}}>
            Modern framework with Domain-Driven Design, hexagonal architecture, and CQRS.
            <br/>
            Plus native AI agent support as a first-class feature.
          </p>
          <div className={styles.buttons}>
            <Link
              className="button button--secondary button--lg"
              to="/docs/getting-started/introduction"
              style={{marginRight: '1rem'}}>
              Get Started →
            </Link>
            <Link
              className="button button--outline button--lg"
              to="/docs/core-concepts/architecture"
              style={{
                color: 'white',
                borderColor: 'rgba(255, 255, 255, 0.3)',
              }}>
              View Architecture
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}

function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className={styles.featuresGrid}>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🏗️</div>
            <Heading as="h3">Domain-Driven Design</Heading>
            <p>
              Entity, AggregateRoot, ValueObject, and Repository patterns built-in.
              Apply tactical DDD patterns without reinventing the wheel.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🔷</div>
            <Heading as="h3">Hexagonal Architecture</Heading>
            <p>
              5-layer architecture with strict dependency rules.
              Clear separation between domain, application, and infrastructure.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>⚡</div>
            <Heading as="h3">Type-Safe by Design</Heading>
            <p>
              Full TypeScript strict mode with phantom types and Result pattern.
              Prevent runtime errors at compile time.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🎯</div>
            <Heading as="h3">CQRS Ready</Heading>
            <p>
              CommandBus, QueryBus, and EventBus with handler registration.
              Build scalable command-query applications out of the box.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🤖</div>
            <Heading as="h3">Native AI Agents</Heading>
            <p>
              AIAgent extends AggregateRoot. Build AI agents with the same rigor as your domain model.
              Multi-LLM support, cost tracking, and deterministic testing.
            </p>
          </div>
          <div className={styles.feature}>
            <div className={styles.featureIcon}>🚀</div>
            <Heading as="h3">Production Ready</Heading>
            <p>
              Plugin system, dependency injection, health checks, and graceful shutdown.
              OpenTelemetry integration and observability built-in.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home(): ReactNode {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - ${siteConfig.tagline}`}
      description="Modern TypeScript framework with Domain-Driven Design, hexagonal architecture, CQRS, and native AI agent support.">
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
