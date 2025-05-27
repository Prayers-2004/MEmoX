# MEmoX - AI-Powered Dev Assistant

MEmoX is an AI-powered coding assistant for developers that provides intelligent code assistance through both offline and online modes. It's inspired by tools like Cursor and GitHub Copilot.

## Features

- 🤖 **Smart Code Assistance**
  - Answer questions about your code
  - Suggest improvements and refactoring
  - Generate documentation
  - Provide contextual help

- 🔄 **Dual Mode Operation**
  - **Online Mode**: Uses Sonar API for internet-based assistance
  - **Offline Mode**: Uses local CodeLLaMA models via Ollama

- 📚 **Code Understanding**
  - Semantic code search using HNSWlib
  - Context-aware responses
  - Multi-language support (Python, JavaScript, TypeScript, Java, C, C++)

## Prerequisites

- Visual Studio Code 1.85.0 or higher
- Node.js 16.x or higher
- For offline mode:
  - [Ollama](https://ollama.ai/) installed
  - CodeLLaMA model (3B or 7B) downloaded

## Installation

1. Clone this repository
2. Run `npm install` to install dependencies
3. Run `npm run compile` to build the extension
4. Press F5 to start debugging

## Configuration

The extension can be configured through VS Code settings:

- `MEmoX.mode`: Set operation mode (`auto`, `offline`, or `online`)
- `MEmoX.modelSize`: Choose model size (`auto`, `3B`, or `7B`)

## Development

### Project Structure

```
src/
├── chat/           # Chat UI components
├── model/          # Model management
├── indexer/        # Code indexing and search
└── extension.ts    # Main extension file
```

### Building

```bash
npm install
npm run compile
```

### Testing

```bash
npm run test
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details 
