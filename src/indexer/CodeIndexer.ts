import * as vscode from 'vscode';
import * as HNSWLib from 'hnswlib-node';
import * as path from 'path';
import * as fs from 'fs';

interface IndexedFile {
    path: string;
    content: string;
    embedding: number[];
}

export class CodeIndexer {
    private _index: HNSWLib.HierarchicalNSW;
    private _indexedFiles: Map<string, IndexedFile>;
    private _isInitialized: boolean = false;

    constructor(private readonly _context: vscode.ExtensionContext) {
        this._indexedFiles = new Map();
        this._index = new HNSWLib.HierarchicalNSW('cosine', 384);
        this._index.initIndex(1000);
    }

    public async initialize(): Promise<void> {
        if (this._isInitialized) {
            return;
        }

        // Index workspace files
        await this._indexWorkspace();

        this._isInitialized = true;
    }

    public async getRelevantContext(query: string): Promise<string> {
        if (!this._isInitialized) {
            await this.initialize();
        }

        // TODO: Implement embedding generation for the query
        // For now, return a simple context
        return this._getSimpleContext();
    }

    private async _indexWorkspace(): Promise<void> {
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            return;
        }

        for (const folder of workspaceFolders) {
            const files = await vscode.workspace.findFiles(
                new vscode.RelativePattern(folder, '**/*.{js,ts,py,java,c,cpp}'),
                '**/node_modules/**'
            );

            for (const file of files) {
                await this._indexFile(file);
            }
        }
    }

    private async _indexFile(file: vscode.Uri): Promise<void> {
        try {
            const content = await vscode.workspace.fs.readFile(file);
            const text = Buffer.from(content).toString('utf8');

            // TODO: Implement embedding generation for the file content
            // For now, use a simple placeholder embedding
            const embedding = new Array(384).fill(0);

            const indexedFile: IndexedFile = {
                path: file.fsPath,
                content: text,
                embedding
            };

            this._indexedFiles.set(file.fsPath, indexedFile);
            this._index.addPoint(embedding, this._indexedFiles.size - 1);
        } catch (error) {
            console.error(`Error indexing file ${file.fsPath}:`, error);
        }
    }

    private _getSimpleContext(): string {
        // For now, return a simple context from the first few files
        const files = Array.from(this._indexedFiles.values()).slice(0, 3);
        return files.map(file => `File: ${path.basename(file.path)}\n${file.content.slice(0, 500)}...`).join('\n\n');
    }
} 