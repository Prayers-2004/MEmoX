import * as vscode from 'vscode';
import { ModelManager } from '../model/ModelManager';
import { CodeIndexer } from '../indexer/CodeIndexer';

export class ChatPanel implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(
        private readonly _context: vscode.ExtensionContext,
        private readonly _modelManager: ModelManager,
        private readonly _codeIndexer: CodeIndexer
    ) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [
                this._context.extensionUri
            ]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);

        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(async (data) => {
            switch (data.type) {
                case 'sendMessage':
                    await this._handleUserMessage(data.value);
                    break;
            }
        });
    }

    public reveal() {
        if (this._view) {
            this._view.show(true);
        }
    }

    private async _handleUserMessage(message: string) {
        if (!this._view) {
            return;
        }

        // Get relevant code context
        const context = await this._codeIndexer.getRelevantContext(message);

        // Get response from model
        const response = await this._modelManager.getResponse(message, context);

        // Send response back to webview
        this._view.webview.postMessage({
            type: 'addResponse',
            value: response
        });
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>DevPilot Chat</title>
                <style>
                    body {
                        padding: 20px;
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                    }
                    .chat-container {
                        display: flex;
                        flex-direction: column;
                        height: 100vh;
                    }
                    .messages {
                        flex: 1;
                        overflow-y: auto;
                        margin-bottom: 20px;
                    }
                    .input-container {
                        display: flex;
                        gap: 10px;
                    }
                    input {
                        flex: 1;
                        padding: 8px;
                        border: 1px solid var(--vscode-input-border);
                        background: var(--vscode-input-background);
                        color: var(--vscode-input-foreground);
                    }
                    button {
                        padding: 8px 16px;
                        background: var(--vscode-button-background);
                        color: var(--vscode-button-foreground);
                        border: none;
                        cursor: pointer;
                    }
                    button:hover {
                        background: var(--vscode-button-hoverBackground);
                    }
                </style>
            </head>
            <body>
                <div class="chat-container">
                    <div class="messages" id="messages"></div>
                    <div class="input-container">
                        <input type="text" id="messageInput" placeholder="Ask a question...">
                        <button id="sendButton">Send</button>
                    </div>
                </div>
                <script>
                    const vscode = acquireVsCodeApi();
                    const messagesContainer = document.getElementById('messages');
                    const messageInput = document.getElementById('messageInput');
                    const sendButton = document.getElementById('sendButton');

                    function addMessage(content, isUser = false) {
                        const messageDiv = document.createElement('div');
                        messageDiv.style.marginBottom = '10px';
                        messageDiv.style.padding = '10px';
                        messageDiv.style.borderRadius = '5px';
                        messageDiv.style.backgroundColor = isUser ? 'var(--vscode-button-background)' : 'var(--vscode-editor-background)';
                        messageDiv.style.color = isUser ? 'var(--vscode-button-foreground)' : 'var(--vscode-foreground)';
                        messageDiv.textContent = content;
                        messagesContainer.appendChild(messageDiv);
                        messagesContainer.scrollTop = messagesContainer.scrollHeight;
                    }

                    function sendMessage() {
                        const message = messageInput.value.trim();
                        if (message) {
                            addMessage(message, true);
                            vscode.postMessage({
                                type: 'sendMessage',
                                value: message
                            });
                            messageInput.value = '';
                        }
                    }

                    sendButton.addEventListener('click', sendMessage);
                    messageInput.addEventListener('keypress', (e) => {
                        if (e.key === 'Enter') {
                            sendMessage();
                        }
                    });

                    // Handle messages from the extension
                    window.addEventListener('message', event => {
                        const message = event.data;
                        switch (message.type) {
                            case 'addResponse':
                                addMessage(message.value);
                                break;
                        }
                    });
                </script>
            </body>
            </html>
        `;
    }
} 