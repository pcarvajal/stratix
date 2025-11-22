---
sidebar_position: 2
---

# Installation

Install Stratix Copilot to enhance your Stratix development experience with AI-powered code generation.

## Prerequisites

Before installing Stratix Copilot, ensure you have:

- **VS Code** 1.85.0 or higher
- **GitHub Copilot** subscription and extension installed
- **Stratix project** (or create one with `npx @stratix/cli new`)

## Installation Methods

### Method 1: VS Code Marketplace (Recommended)

**[Install from VS Code Marketplace →](https://marketplace.visualstudio.com/items?itemName=stratix.stratix-copilot-rag)**

1. Open VS Code
2. Go to Extensions (`Cmd+Shift+X`)
3. Search for "Stratix Copilot"
4. Click **Install**

Or install directly from the marketplace:
- Visit [marketplace.visualstudio.com](https://marketplace.visualstudio.com/items?itemName=stratix.stratix-copilot-rag)
- Click **Install**

### Method 2: From Source (Development)

For development or early access:

```bash
# Clone the Stratix repository
git clone https://github.com/stratix-dev/stratix.git
cd stratix

# Install dependencies
pnpm install

# Build the extension
cd packages/copilot-rag
pnpm run compile

# Package the extension
pnpm run package
```

Then install the `.vsix` file:

1. Open VS Code
2. `Cmd+Shift+P` → `Extensions: Install from VSIX...`
3. Select `stratix-copilot-*.vsix`

## Verify Installation

After installation, verify Stratix Copilot is working:

1. **Check Output Panel**
   - Open Output panel (`Cmd+Shift+U`)
   - Select "Stratix AI Assistant" from dropdown
   - You should see:
     ```
     Stratix AI Assistant activating...
     Knowledge base initialized with 36 documents
     KB Version: 0.1.3
     🎉 Stratix AI Assistant activated successfully!
     ```

2. **Test in Copilot Chat**
   - Open Copilot Chat (`Cmd+Shift+I`)
   - Type `@stratix hello`
   - You should get a response about Stratix

3. **Check Commands**
   - `Cmd+Shift+P` → Type "Stratix"
   - You should see:
     - `Stratix: Open AI Assistant`
     - `Stratix: Rebuild Knowledge Base`
     - `Stratix: Show Knowledge Base Info`

## First-Time Setup

### 1. Initialize Knowledge Base

The first time you use Stratix Copilot, it will:

- Download the embedding model (~90MB)
- Generate embeddings for 36 documents
- Save to local storage for fast future loads

This takes **1-2 minutes** on first run. Subsequent loads are instant.

### 2. Configure (Optional)

Stratix Copilot works out of the box, but you can customize:

**VS Code Settings** (`settings.json`):

```json
{
  "stratix.copilot.enabled": true,
  "stratix.copilot.autoUpdate": true
}
```

## Troubleshooting

### Extension Not Activating

**Problem**: Extension doesn't appear in Output panel

**Solution**:
1. Check VS Code version: `Code → About Visual Studio Code`
2. Ensure GitHub Copilot is installed and activated
3. Reload window: `Cmd+Shift+P` → `Developer: Reload Window`

### Knowledge Base Not Loading

**Problem**: Shows "0 documents" or errors in Output

**Solution**:
```bash
# Rebuild knowledge base
Cmd+Shift+P → "Stratix: Rebuild Knowledge Base"
```

### Slow First Load

**Problem**: Takes long time on first activation

**Expected**: First load downloads embedding model (~90MB) and generates embeddings. This is normal and only happens once.

**Solution**: Wait for completion. Subsequent loads will be instant.

### Chat Not Responding

**Problem**: `@stratix` doesn't work in Copilot Chat

**Solution**:
1. Verify GitHub Copilot is active
2. Check Output panel for errors
3. Try reloading window
4. Ensure you're using `@stratix` (with @)

## Updating

### Automatic Updates (Marketplace)

When published to Marketplace, VS Code will auto-update the extension.

### Manual Updates (From Source)

```bash
cd stratix/packages/copilot-rag
git pull
pnpm run compile
pnpm run package
# Install new .vsix file
```

### Update Knowledge Base

The knowledge base auto-updates, but you can manually update:

```bash
Cmd+Shift+P → "Stratix: Rebuild Knowledge Base"
```

## Uninstallation

To remove Stratix Copilot:

1. Open Extensions (`Cmd+Shift+X`)
2. Find "Stratix Copilot"
3. Click **Uninstall**

This removes:
- Extension files
- Knowledge base storage
- All settings

## Next Steps

- [Usage Guide](./usage.md) - Learn how to use Stratix Copilot
- [Commands Reference](./commands.md) - Complete command list
- [Examples](./examples.md) - Real-world usage examples
