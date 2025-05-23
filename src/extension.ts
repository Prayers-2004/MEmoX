import * as vscode from 'vscode';
import { ChatPanel } from './chat/ChatPanel';
import { ModelManager } from './model/ModelManager';
import { OllamaDetector } from './model/OllamaDetector';
import { CodeIndexer } from './indexer/CodeIndexer';

export async function activate(context: vscode.ExtensionContext) {
    console.log('DevPilot is now active!');

    // Initialize components
    const ollamaDetector = new OllamaDetector();
    const modelManager = new ModelManager(context, ollamaDetector);
    const codeIndexer = new CodeIndexer(context);

    // Create and register the chat panel
    const chatPanel = new ChatPanel(context, modelManager, codeIndexer);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider('devpilotChatView', chatPanel)
    );

    // Register commands
    let startChatCommand = vscode.commands.registerCommand('devpilot.startChat', () => {
        chatPanel.reveal();
    });

    context.subscriptions.push(startChatCommand);

    // Initialize the model manager
    await modelManager.initialize();
}

export function deactivate() {
    // Cleanup resources
} 