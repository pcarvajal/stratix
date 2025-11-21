import * as vscode from 'vscode';

let outputChannel: vscode.OutputChannel | undefined;

export async function activate(context: vscode.ExtensionContext) {
  try {
    // Create output channel FIRST, before anything else
    outputChannel = vscode.window.createOutputChannel('Stratix AI Assistant');
    context.subscriptions.push(outputChannel);
    outputChannel.show(); // Show immediately

    outputChannel.appendLine('🚀 Stratix AI Assistant activating...');
    outputChannel.appendLine(`📍 VS Code version: ${vscode.version}`);
    outputChannel.appendLine(`📍 Extension path: ${context.extensionPath}`);

    // Verify chat API is available
    if (!vscode.chat) {
      const error = 'Chat API not available. Please update VS Code to 1.85.0 or higher.';
      outputChannel.appendLine(`❌ ${error}`);
      vscode.window.showErrorMessage(`Stratix AI Assistant: ${error}`);
      return;
    }

    outputChannel.appendLine('✅ Chat API is available');

    // Dynamic import to catch module errors
    outputChannel.appendLine('🔧 Loading StratixChatParticipant module...');
    const { StratixChatParticipant } = await import('./StratixChatParticipant');
    outputChannel.appendLine('✅ Module loaded');

    // Initialize chat participant
    outputChannel.appendLine('🔧 Initializing StratixChatParticipant...');
    const participant = new StratixChatParticipant(context);

    outputChannel.appendLine('🔧 Initializing knowledge base...');
    await participant.initialize();

    // Get knowledge base stats
    const kbStats = await participant.getKnowledgeBaseStats();
    outputChannel.appendLine(`✅ Knowledge base initialized with ${kbStats.documentCount} documents`);
    if (kbStats.loadedFrom) {
      outputChannel.appendLine(`   📁 Loaded from: ${kbStats.loadedFrom}`);
    }
    if (kbStats.metadata) {
      outputChannel.appendLine(`   📦 KB Version: ${kbStats.metadata.version}`);
      outputChannel.appendLine(`   📅 Generated: ${new Date(kbStats.metadata.generatedAt).toLocaleDateString()}`);
    }

    // Register chat participant
    outputChannel.appendLine('🔧 Registering chat participant with ID: stratix.assistant');
    const chatParticipant = vscode.chat.createChatParticipant(
      'stratix.assistant',
      participant.handleRequest.bind(participant)
    );

    outputChannel.appendLine('✅ Chat participant created');

    chatParticipant.iconPath = vscode.Uri.joinPath(context.extensionUri, 'media', 'icon.png');

    context.subscriptions.push(chatParticipant);
    outputChannel.appendLine('✅ Chat participant registered');

    // Register commands
    context.subscriptions.push(
      vscode.commands.registerCommand('stratix.openChat', () => {
        vscode.commands.executeCommand('workbench.action.chat.open', {
          query: '@stratix ',
          isPartialQuery: true,
        });
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('stratix.rebuildKnowledge', async () => {
        await participant.rebuildKnowledgeBase();
        vscode.window.showInformationMessage('Stratix knowledge base rebuilt successfully!');
      })
    );

    // Register file creation commands
    const { FileCreationHandler } = await import('./FileCreationHandler');
    const fileHandler = new FileCreationHandler();

    context.subscriptions.push(
      vscode.commands.registerCommand('stratix.createEntityFromChat', async (context) => {
        await fileHandler.createEntityFromChat(context);
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('stratix.createCommandFromChat', async (context) => {
        await fileHandler.createCommandFromChat(context);
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('stratix.createQueryFromChat', async (context) => {
        await fileHandler.createQueryFromChat(context);
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('stratix.createVOFromChat', async (context) => {
        await fileHandler.createVOFromChat(context);
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('stratix.createRepositoryFromChat', async (context) => {
        await fileHandler.createRepositoryFromChat(context);
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('stratix.saveCodeFromChat', async (context) => {
        await fileHandler.saveCodeFromChat(context);
      })
    );

    context.subscriptions.push(
      vscode.commands.registerCommand('stratix.showKnowledgeBaseInfo', async () => {
        const stats = await participant.getKnowledgeBaseStats();
        const metadata = stats.metadata;

        let message = `📚 Stratix Knowledge Base\n\n`;
        message += `Documents: ${stats.documentCount}\n`;
        message += `Loaded from: ${stats.loadedFrom}\n`;

        if (metadata) {
          message += `\n📦 Version Information:\n`;
          message += `Version: ${metadata.version}\n`;
          message += `Generated: ${new Date(metadata.generatedAt).toLocaleString()}\n`;
          message += `\n📊 Statistics:\n`;
          message += `Docusaurus docs: ${metadata.sources.docusaurus}\n`;
          message += `Package READMEs: ${metadata.sources.packages}\n`;
          message += `Patterns: ${metadata.sources.patterns}\n`;
          message += `Examples: ${metadata.sources.examples}\n`;
        }

        vscode.window.showInformationMessage(message, { modal: true });
      })
    );

    outputChannel.appendLine('✅ Commands registered');
    outputChannel.appendLine('🎉 Stratix AI Assistant activated successfully!');

    vscode.window.showInformationMessage('Stratix AI Assistant activated! Try @stratix in Copilot Chat.');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    const errorStack = error instanceof Error ? error.stack : 'No stack trace';

    if (outputChannel) {
      outputChannel.appendLine(`❌ FATAL ERROR during activation: ${errorMessage}`);
      outputChannel.appendLine(`Stack trace: ${errorStack}`);
      outputChannel.show();
    } else {
      // Fallback if output channel wasn't created
      console.error('❌ FATAL ERROR during activation:', error);
    }

    vscode.window.showErrorMessage(
      `Failed to activate Stratix AI Assistant: ${errorMessage}. Check Output → "Stratix AI Assistant" for details.`
    );
  }
}

export function deactivate() {
  if (outputChannel) {
    outputChannel.appendLine('👋 Stratix AI Assistant deactivated');
    outputChannel.dispose();
  }
}
