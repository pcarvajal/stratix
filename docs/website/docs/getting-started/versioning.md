# Versioning Policy

Stratix follows [Semantic Versioning 2.0.0](https://semver.org/) for all package releases.

## Current Status: Pre-release (0.x)

**Current Version**: 0.1.x

Stratix is currently in the **0.x pre-release phase**. This means:

- The API may change without prior notice
- No backward compatibility guarantees
- Recommended for early adopters and testing
- Breaking changes increment MINOR version
- New features increment MINOR version
- Bug fixes increment PATCH version

### Version Progression Example

```
0.1.0 → Initial public release (current)
0.1.1 → Bug fixes only
0.2.0 → New features or breaking changes
0.3.0 → More features or breaking changes
```

## What This Means for You

### If You're an Early Adopter

We welcome early adopters to test Stratix and provide feedback. However, be aware that:

1. **API Instability**: Function signatures, class interfaces, and public APIs may change between minor versions
2. **Migration Effort**: Upgrading from 0.1.x to 0.2.x may require code changes
3. **Documentation Updates**: Documentation may lag behind the latest changes during rapid development
4. **Feature Completeness**: Some features are still under development

### Recommended Usage

During the 0.x phase, Stratix is best suited for:

- Prototypes and proof-of-concepts
- Learning and experimentation
- Side projects and non-critical applications
- Providing feedback to shape the 1.0 API

We do **not** recommend using 0.x versions for mission-critical production applications yet.

## Semantic Versioning Format

```
MAJOR.MINOR.PATCH[-PRERELEASE][+BUILD]
```

- **MAJOR**: Incompatible API changes (breaking changes)
- **MINOR**: New functionality in a backward-compatible manner
- **PATCH**: Backward-compatible bug fixes
- **PRERELEASE**: Pre-release versions (alpha, beta, rc)
- **BUILD**: Build metadata

## Version Increment Rules

### During 0.x Phase

| Change Type | Version Increment | Example |
|------------|-------------------|---------|
| Breaking changes | MINOR | 0.1.0 → 0.2.0 |
| New features | MINOR | 0.1.0 → 0.2.0 |
| Bug fixes | PATCH | 0.1.0 → 0.1.1 |

### After 1.0.0 (Stable Release)

| Change Type | Version Increment | Example |
|------------|-------------------|---------|
| Breaking changes | MAJOR | 1.5.0 → 2.0.0 |
| New features | MINOR | 1.5.0 → 1.6.0 |
| Bug fixes | PATCH | 1.5.0 → 1.5.1 |

## Pre-release Versions

For testing before an official release:

```
1.0.0-alpha.1    → First alpha version
1.0.0-alpha.2    → Second alpha version
1.0.0-beta.1     → First beta version
1.0.0-beta.2     → Second beta version
1.0.0-rc.1       → Release Candidate 1
1.0.0-rc.2       → Release Candidate 2
1.0.0            → Stable version
```

**Pre-release stages**:
- **alpha**: Active development, unstable, internal testing only
- **beta**: Features complete, may have bugs, public testing
- **rc**: Release Candidate, production-ready if no critical bugs found
