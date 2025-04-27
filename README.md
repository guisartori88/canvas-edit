# AI Canvas

A visual canvas application with connectable blocks for AI image generation.

## Features

- Canvas with draggable and connectable blocks
- Text-to-Image generation block
- Support for multiple AI image generation models
- Custom parameters for image generation
- Visual node editor interface

## Getting Started

### Prerequisites

- Node.js 18+ and npm

### Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Copy the environment variables example file and fill in your API keys:
   ```bash
   cp .env.local.example .env.local
   ```
   Then edit the `.env.local` file with your API keys for OpenAI, Stability AI, etc.

### Running the Application

```bash
npm run dev
```

The application will start at [http://localhost:3000](http://localhost:3000).

## How to Use

1. Click the "Add Text-to-Image" button in the top-right corner to add a block
2. Configure the block with your desired prompt, model, and parameters
3. Click "Generate Image" to create an image
4. Connect blocks by dragging from the output handle to inputs of other blocks

## Project Structure

- `/src/components/blocks` - Block components (Text-to-Image, etc.)
- `/src/components/canvas` - Canvas and node rendering components
- `/src/lib/api` - API integration for image generation services
- `/src/store` - State management using Zustand

## Technologies Used

- Next.js with React
- TypeScript
- ReactFlow for the visual node editor
- Zustand for state management
- Tailwind CSS for styling
- OpenAI, Stability AI, and Replicate APIs for image generation

## Future Enhancements

- Image-to-Image transformation block
- Text-to-Video generation
- Project saving and sharing
- More customization options for each block
- Additional AI models and parameters
