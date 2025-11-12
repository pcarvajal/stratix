#!/usr/bin/env node

import('../dist/index.js')
  .then((module) => {
    module.run();
  })
  .catch((error) => {
    console.error('Failed to load create-stratix:', error);
    process.exit(1);
  });
