import React, { useState } from 'react';
import { Handle, Position } from 'reactflow';

export interface TextToImageBlockProps {
  data: {
    prompt: string;
    model: string;
    resolution: string;
    generatedImage?: string;
    metadata?: {
      model: string;
      seed: number;
      timestamp: string;
    };
    onPromptChange: (prompt: string) => void;
    onModelChange: (model: string) => void;
    onResolutionChange: (resolution: string) => void;
    onGenerate: () => Promise<void>;
  };
}

const TextToImageBlock: React.FC<TextToImageBlockProps> = ({ data }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      await data.onGenerate();
    } catch (error) {
      console.error('Generation failed:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const modelOptions = [
    { value: 'dall-e-3', label: 'DALL·E 3' },
    { value: 'stable-diffusion', label: 'Stable Diffusion' },
  ];

  const resolutionOptions = [
    { value: '512x512', label: '512x512' },
    { value: '1024x1024', label: '1024x1024' },
    { value: '1024x1792', label: 'Portrait (1024x1792)' },
    { value: '1792x1024', label: 'Landscape (1792x1024)' },
  ];

  return (
    <div className="border border-gray-300 rounded-md p-4 w-80 bg-white shadow-md">
      <div className="font-bold text-lg mb-2">Text-to-Image</div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium">Prompt</label>
        <textarea
          className="w-full border border-gray-300 rounded p-2 text-sm"
          value={data.prompt}
          onChange={(e) => data.onPromptChange(e.target.value)}
          placeholder="Describe the image you want to generate..."
          rows={3}
        />
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium">Model</label>
        <select
          className="w-full border border-gray-300 rounded p-2 text-sm"
          value={data.model}
          onChange={(e) => data.onModelChange(e.target.value)}
        >
          {modelOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium">Resolution</label>
        <select
          className="w-full border border-gray-300 rounded p-2 text-sm"
          value={data.resolution}
          onChange={(e) => data.onResolutionChange(e.target.value)}
        >
          {resolutionOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
      
      <button
        className={`w-full py-2 px-4 rounded ${
          isGenerating
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        onClick={handleGenerate}
        disabled={isGenerating || !data.prompt}
      >
        {isGenerating ? 'Generating...' : 'Generate Image'}
      </button>
      
      {data.generatedImage && (
        <div className="mt-4">
          <div className="border border-gray-300 rounded overflow-hidden">
            <img 
              src={data.generatedImage} 
              alt="Generated" 
              className="w-full h-auto"
            />
          </div>
          
          {data.metadata && (
            <div className="mt-2 text-xs text-gray-500">
              <div>Model: {data.metadata.model}</div>
              <div>Seed: {data.metadata.seed}</div>
              <div>Generated: {data.metadata.timestamp}</div>
            </div>
          )}
        </div>
      )}
      
      {/* Output handle at the bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="output"
        className="w-3 h-3 bg-blue-500"
      />
    </div>
  );
};

export default TextToImageBlock; 