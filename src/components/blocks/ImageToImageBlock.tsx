import React, { useState, useRef } from 'react';
import { Handle, Position } from 'reactflow';

export interface ImageToImageBlockProps {
  data: {
    prompt: string;
    model: string;
    uploadedImages: string[]; // Array de URLs de imagens em base64
    generatedImage?: string;
    metadata?: {
      model: string;
      timestamp: string;
    };
    onPromptChange: (prompt: string) => void;
    onModelChange: (model: string) => void;
    onImagesChange: (images: string[]) => void;
    onGenerate: () => Promise<void>;
  };
}

const ImageToImageBlock: React.FC<ImageToImageBlockProps> = ({ data }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Ler até 4 arquivos
    const fileArray = Array.from(files).slice(0, 4);
    const imagePromises = fileArray.map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve(reader.result as string);
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(imagePromises).then(images => {
      data.onImagesChange(images);
    });
  };

  const handleClickUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...data.uploadedImages];
    newImages.splice(index, 1);
    data.onImagesChange(newImages);
  };

  const modelOptions = [
    { value: 'gpt-image-1', label: 'GPT Image-1' },
  ];

  return (
    <div className="border border-gray-300 rounded-md p-4 w-80 bg-white shadow-md">
      <div className="font-bold text-lg mb-2">Image-to-Image</div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium">Prompt</label>
        <textarea
          className="w-full border border-gray-300 rounded p-2 text-sm"
          value={data.prompt}
          onChange={(e) => data.onPromptChange(e.target.value)}
          placeholder="Describe what to do with the images..."
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
        <label className="block text-sm font-medium mb-2">Upload Images (max 4)</label>
        <input
          type="file"
          accept="image/*"
          multiple
          ref={fileInputRef}
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          onClick={handleClickUpload}
          className="w-full py-2 px-4 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
        >
          {data.uploadedImages.length === 0 ? 'Select Images' : 'Change Images'}
        </button>
        
        {data.uploadedImages.length > 0 && (
          <div className="mt-2 grid grid-cols-2 gap-2">
            {data.uploadedImages.map((image, index) => (
              <div key={index} className="relative">
                <img
                  src={image}
                  alt={`Uploaded ${index + 1}`}
                  className="w-full h-24 object-cover rounded"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <button
        className={`w-full py-2 px-4 rounded ${
          isGenerating || data.uploadedImages.length === 0 || !data.prompt
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        onClick={handleGenerate}
        disabled={isGenerating || data.uploadedImages.length === 0 || !data.prompt}
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

export default ImageToImageBlock; 