import * as vscode from 'vscode';
import { OllamaDetector } from './OllamaDetector';
import axios from 'axios';

export class ModelManager {
    private _isOfflineMode: boolean = false;
    private _modelSize: string = 'auto';

    constructor(
        private readonly _context: vscode.ExtensionContext,
        private readonly _ollamaDetector: OllamaDetector
    ) {}

    public async initialize(): Promise<void> {
        // Check if Ollama is installed and models are available
        const isOllamaInstalled = await this._ollamaDetector.isInstalled();
        const availableModels = isOllamaInstalled ? await this._ollamaDetector.getAvailableModels() : [];

        // Determine if we should use offline mode
        const config = vscode.workspace.getConfiguration('devpilot');
        const mode = config.get<string>('mode', 'auto');
        this._modelSize = config.get<string>('modelSize', 'auto');

        if (mode === 'auto') {
            this._isOfflineMode = isOllamaInstalled && availableModels.length > 0;
        } else {
            this._isOfflineMode = mode === 'offline';
        }

        if (this._isOfflineMode) {
            // Ensure we have the right model size
            if (this._modelSize === 'auto') {
                // TODO: Implement system performance detection
                this._modelSize = '3B';
            }

            // Ensure the model is downloaded
            const modelName = `codellama:${this._modelSize.toLowerCase()}`;
            if (!availableModels.includes(modelName)) {
                await this._ollamaDetector.pullModel(modelName);
            }
        }
    }

    public async getResponse(message: string, context: string): Promise<string> {
        if (this._isOfflineMode) {
            return this._getOfflineResponse(message, context);
        } else {
            return this._getOnlineResponse(message, context);
        }
    }

    private async _getOfflineResponse(message: string, context: string): Promise<string> {
        try {
            const modelName = `codellama:${this._modelSize.toLowerCase()}`;
            const response = await axios.post('http://localhost:11434/api/generate', {
                model: modelName,
                prompt: `Context:\n${context}\n\nQuestion: ${message}\n\nAnswer:`,
                stream: false
            });

            return response.data.response;
        } catch (error) {
            console.error('Error getting offline response:', error);
            return 'Sorry, I encountered an error while processing your request. Please try again.';
        }
    }

    private async _getOnlineResponse(message: string, context: string): Promise<string> {
        try {
            // TODO: Implement Sonar API integration
            return 'Online mode is not yet implemented. Please use offline mode or check back later.';
        } catch (error) {
            console.error('Error getting online response:', error);
            return 'Sorry, I encountered an error while processing your request. Please try again.';
        }
    }
} 