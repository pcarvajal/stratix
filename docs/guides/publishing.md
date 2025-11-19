# Publishing Guide

Complete guide for publishing Stratix packages to npm.

## Prerequisites

### 1. npm Account

Create an account at [npmjs.com](https://www.npmjs.com/) if you don't have one.

### 2. npm Authentication

```bash
# Login to npm
npm login

# Verify authentication
npm whoami
```

### 3. Organization Access

Request access to `@stratix` organization from maintainers, or create your own scope.

### 4. Repository Setup

Ensure all packages have proper metadata in `package.json`:

```json
{
  "name": "@stratix/package-name",
  "version": "0.1.0",
  "description": "Package description",
  "author": "Your Name <email@example.com>",
  "license": "MIT",
  "repository": {
    "type": "git",
    "url": "https://github.com/pcarvajal/stratix.git",
    "directory": "packages/package-name"
  },
  "homepage": "https://github.com/pcarvajal/stratix#readme",
  "bugs": {
    "url": "https://github.com/pcarvajal/stratix/issues"
  },
  "keywords": ["keyword1", "keyword2"],
  "files": ["dist", "README.md"],
  "publishConfig": {
    "access": "public"
  }
}
```

## Pre-Publication Checklist

### Code Quality

- [ ] All tests passing (`pnpm test`)
- [ ] No TypeScript errors (`pnpm typecheck`)
- [ ] No lint errors (`pnpm lint`)
- [ ] All packages build successfully (`pnpm -r build`)

### Documentation

- [ ] README.md exists and is up-to-date
- [ ] API documentation is complete
- [ ] Examples are working
- [ ] CHANGELOG.md is updated

### Package Metadata

- [ ] Version number is correct
- [ ] Description is clear and concise
- [ ] Keywords are relevant
- [ ] Author information is filled
- [ ] Repository URLs are correct
- [ ] License is specified (MIT)
- [ ] `files` field includes all necessary files

### Dependencies

- [ ] All dependencies are listed correctly
- [ ] Workspace dependencies use `workspace:*`
- [ ] No dev dependencies in `dependencies`
- [ ] Peer dependencies are specified if needed

## Publishing Process

### Manual Publishing

#### 1. Update Versions

```bash
# Update all packages to same version
pnpm -r exec npm version 0.1.0

# Or update individually
cd packages/primitives
npm version 0.1.0

cd ../abstractions
npm version 0.1.0

# ... etc
```

#### 2. Build All Packages

```bash
# Clean previous builds
pnpm -r clean

# Build all packages
pnpm -r build

# Verify build artifacts
ls packages/*/dist
```

#### 3. Run Final Tests

```bash
# Run all tests
pnpm test

# Run type checking
pnpm typecheck

# Run linting
pnpm lint
```

#### 4. Publish Packages

**Important:** Publish in dependency order!

```bash
# 1. Primitives (no dependencies)
cd packages/primitives
pnpm publish --access public

# 2. Abstractions (depends on primitives)
cd ../abstractions
pnpm publish --access public

# 3. Runtime (depends on primitives + abstractions)
cd ../impl-ai-agents
pnpm publish --access public

# 4. Extensions (depend on abstractions)
cd ../ext-ai-agents-openai
pnpm publish --access public

cd ../ext-ai-agents-anthropic
pnpm publish --access public

cd ../ext-redis
pnpm publish --access public

# 5. Testing (depends on primitives + abstractions)
cd ../testing
pnpm publish --access public

# 6. CLI tools (depend on all above)
cd ../cli
pnpm publish --access public
```

#### 5. Tag Release

```bash
# Create git tag
git tag -a v0.1.0 -m "Release v0.1.0"

# Push tag
git push origin v0.1.0
```

### Automated Publishing (CI/CD)

#### Via GitHub Actions

1. **Create Git Tag:**

   ```bash
   git tag -a v0.1.0 -m "Release v0.1.0"
   git push origin v0.1.0
   ```

2. **GitHub Actions will:**
   - Run all tests
   - Build all packages
   - Publish to npm
   - Create GitHub release

#### Requirements

- `NPM_TOKEN` secret configured in GitHub
- All tests passing
- All checks green

## Post-Publication

### 1. Verify on npm

```bash
# Check published versions
npm view @stratix/core versions
npm view @stratix/core versions
npm view @stratix/runtime versions

# Test installation
mkdir /tmp/test-stratix
cd /tmp/test-stratix
npm init -y
npm install @stratix/core @stratix/core
```

### 2. Update Documentation

- [ ] Update version badges in README
- [ ] Update installation instructions
- [ ] Update changelog
- [ ] Announce release

### 3. Test Installation

```bash
# Create test project
mkdir test-project
cd test-project
npm init -y

# Install packages
npm install @stratix/core @stratix/core @stratix/runtime

# Test imports
node -e "const { AIAgent } = require('@stratix/core'); console.log('Success!');"
```

## Versioning Strategy

### Semantic Versioning

Follow [semver](https://semver.org/):

- **Major** (1.0.0): Breaking changes
- **Minor** (0.1.0): New features, backward compatible
- **Patch** (0.0.1): Bug fixes, backward compatible

### Pre-release Versions

```bash
# Alpha release
npm version 0.1.0-alpha.0

# Beta release
npm version 0.1.0-beta.0

# Release candidate
npm version 0.1.0-rc.0

# Publish with tag
pnpm publish --access public --tag alpha
pnpm publish --access public --tag beta
pnpm publish --access public --tag rc
```

### Version Synchronization

Keep all `@stratix/*` packages on the same version:

```bash
# Update all to same version
pnpm -r exec npm version 0.2.0
```

## Publishing Different Tags

### Latest (default)

```bash
pnpm publish --access public
# or explicitly
pnpm publish --access public --tag latest
```

### Next

```bash
pnpm publish --access public --tag next
```

### Beta

```bash
pnpm publish --access public --tag beta
```

### Users install specific tags:

```bash
npm install @stratix/core@next
npm install @stratix/core@beta
npm install @stratix/core@latest
```

## Troubleshooting

### Error: 403 Forbidden

**Cause:** No permission to publish to `@stratix` scope.

**Solution:**

- Verify npm authentication: `npm whoami`
- Request access to organization
- Or publish to your own scope

### Error: Version already exists

**Cause:** Version number already published.

**Solution:**

```bash
# Bump version
npm version patch  # 0.1.0 -> 0.1.1
npm version minor  # 0.1.0 -> 0.2.0
npm version major  # 0.1.0 -> 1.0.0

# Or set specific version
npm version 0.1.1
```

### Error: Cannot find module

**Cause:** Missing files in published package.

**Solution:**

```bash
# Check files field in package.json
{
  "files": [
    "dist",
    "README.md",
    "LICENSE"
  ]
}

# Or check with dry-run
pnpm publish --dry-run
```

### Error: Dependency not found

**Cause:** Publishing order incorrect or dependency not published.

**Solution:**

```bash
# Publish in correct order:
# 1. primitives (no deps)
# 2. abstractions (depends on primitives)
# 3. implementations (depend on above)

# Verify dependency published
npm view @stratix/core
```

### Missing Types

**Cause:** TypeScript declaration files not included.

**Solution:**

```bash
# Ensure types field in package.json
{
  "types": "./dist/index.d.ts"
}

# Ensure .d.ts files in dist
ls packages/*/dist/*.d.ts

# Check tsconfig.json
{
  "compilerOptions": {
    "declaration": true
  }
}
```

## Best Practices

### 1. Test Before Publishing

```bash
# Full test suite
pnpm test
```

### 2. Use Dry Run

```bash
# Preview what will be published
pnpm publish --dry-run

# Check package contents
npm pack
tar -tzf stratix-primitives-0.1.0.tgz
```

### 3. Coordinate with Team

- Announce planned release in advance
- Ensure all PRs are merged
- Verify CI is green
- Update changelog together

### 4. Gradual Rollout

```bash
# First publish as beta
pnpm publish --access public --tag beta

# Test with beta users
npm install @stratix/core@beta

# Promote to latest when stable
npm dist-tag add @stratix/core@0.1.0 latest
```

### 5. Monitor After Release

- Watch npm download stats
- Monitor GitHub issues
- Check for error reports
- Be ready to hotfix if needed

## Emergency Procedures

### Unpublish (within 72 hours)

```bash
# Unpublish specific version
npm unpublish @stratix/core@0.1.0

# Unpublish entire package (careful!)
npm unpublish @stratix/core --force
```

**Warning:** Unpublishing is discouraged. Prefer deprecation.

### Deprecate Version

```bash
# Deprecate specific version
npm deprecate @stratix/core@0.1.0 "Security vulnerability, upgrade to 0.1.1"

# Deprecate range
npm deprecate @stratix/core@"<0.1.1" "Security vulnerability, upgrade to 0.1.1"
```

### Hotfix Release

```bash
# Create hotfix branch
git checkout -b hotfix/v0.1.1

# Fix issue
# ... make changes ...

# Test
pnpm test

# Bump patch version
pnpm -r exec npm version patch

# Publish
pnpm -r --filter '@stratix/*' publish --access public

# Tag and merge
git tag v0.1.1
git push origin v0.1.1
```

## Release Checklist Template

Use this template for each release:

```markdown
## Release v0.1.0

### Pre-Release

- [ ] All tests passing
- [ ] Documentation updated
- [ ] Changelog updated
- [ ] Version bumped in all packages
- [ ] Examples tested
- [ ] CI green on main branch

### Publishing

- [ ] Packages built successfully
- [ ] Published to npm in correct order
- [ ] Verified on npm registry
- [ ] Git tag created and pushed

### Post-Release

- [ ] GitHub release created
- [ ] Changelog published
- [ ] Social media announcement
- [ ] Documentation site updated
- [ ] Monitoring for issues

### Rollback Plan

- [ ] Previous version noted: v0.0.9
- [ ] Deprecation command ready if needed
- [ ] Hotfix branch prepared
```

## Resources

- [npm Publishing Guide](https://docs.npmjs.com/packages-and-modules/contributing-packages-to-the-registry)
- [Semantic Versioning](https://semver.org/)
- [npm Scopes](https://docs.npmjs.com/cli/v9/using-npm/scope)
- [GitHub Releases](https://docs.github.com/en/repositories/releasing-projects-on-github)
