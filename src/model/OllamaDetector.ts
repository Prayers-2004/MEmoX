import * as vscode from 'vscode';
import * as cp from 'child_process';
import * as util from 'util';

const exec = util.promisify(cp.exec);

export class OllamaDetector {
    public async isInstalled(): Promise<boolean> {
        try {
            await exec('ollama --version');
            return true;
        } catch (error) {
            return false;
        }
    }

    public async getAvailableModels(): Promise<string[]> {
        try {
            const { stdout } = await exec('ollama list');
            return stdout
                .split('\n')
                .slice(1) // Skip header
                .map(line => line.split(/\s+/)[0])
                .filter(Boolean);
        } catch (error) {
            console.error('Error getting available models:', error);
            return [];
        }
    }

    public async pullModel(modelName: string): Promise<void> {
        try {
            await exec(`ollama pull ${modelName}`);
        } catch (error) {
            console.error(`Error pulling model ${modelName}:`, error);
            throw new Error(`Failed to pull model ${modelName}`);
        }
    }

    public async getModelInfo(modelName: string): Promise<{ size: number; format: string }> {
        try {
            const { stdout } = await exec(`ollama show ${modelName}`);
            const info = JSON.parse(stdout);
            return {
                size: info.size || 0,
                format: info.format || 'unknown'
            };
        } catch (error) {
            console.error(`Error getting model info for ${modelName}:`, error);
            throw new Error(`Failed to get model info for ${modelName}`);
        }
    }
} 