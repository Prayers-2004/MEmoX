export class OllamaDetector {
    isInstalled(): Promise<boolean>;
    getAvailableModels(): Promise<string[]>;
    pullModel(modelName: string): Promise<void>;
    getModelInfo(modelName: string): Promise<{ size: number; format: string }>;
} 