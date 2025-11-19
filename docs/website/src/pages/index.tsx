import type { ReactNode } from 'react';
import clsx from 'clsx';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import useBaseUrl from '@docusaurus/useBaseUrl';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();

  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)} style={{ minHeight: 'calc(100vh - 60px)', display: 'flex', alignItems: 'center' }}>
      <div className="container">
        <div style={{ textAlign: 'center' }}>
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
          <Heading as="h1" className="hero__title" style={{ color: 'white' }}>
            {siteConfig.title}
          </Heading>
          <p className="hero__subtitle" style={{ color: 'rgba(255, 255, 255, 0.9)', fontSize: '1.5rem', marginTop: '2rem' }}>
            Documentation Coming Soon
          </p>
          <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '1.1rem', maxWidth: '600px', margin: '1rem auto' }}>
            We are working hard to bring you comprehensive documentation for Stratix.
            Stay tuned for updates!
          </p>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title}`}
      description="Stratix Framework - Documentation Coming Soon">
      <HomepageHeader />
    </Layout>
  );
}
