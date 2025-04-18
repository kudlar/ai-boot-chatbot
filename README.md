# AI Chatbot App

A modern chat application built with Next.js, TypeScript, and the Vercel AI SDK that allows users to interact with OpenAI's GPT models.

## Features

- Real-time chat interface with streaming responses
- Support for both GPT-4 and GPT-3.5-turbo models
- Markdown rendering for AI responses
- Code syntax highlighting
- Model selection persistence
- Error handling and loading states
- Responsive design with Tailwind CSS

## Prerequisites

- Node.js 18.17 or later
- OpenAI API key

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a `.env.local` file in the root directory with your OpenAI API key:
   ```
   OPENAI_API_KEY=your_api_key_here
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. Select your preferred GPT model from the dropdown
3. Start chatting with the AI assistant
4. Use the "Stop" button to halt ongoing responses
5. Enjoy the markdown-formatted responses with syntax highlighting for code blocks

## Technologies Used

- Next.js 14 (App Router)
- TypeScript
- Vercel AI SDK
- Tailwind CSS
- React Markdown
- React Syntax Highlighter

## License

MIT