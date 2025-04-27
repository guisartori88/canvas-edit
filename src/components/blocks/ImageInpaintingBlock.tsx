import React, { useState, useRef } from 'react';

export interface ImageInpaintingBlockProps {
  data: {
    prompt: string;
    model: string;
    uploadedImages: string[];
    maskIndex: number;
    generatedImage?: string;
    metadata?: {
      model: string;
      timestamp: string;
    };
    onPromptChange: (prompt: string) => void;
    onModelChange: (model: string) => void;
    onImagesChange: (images: string[]) => void;
    onMaskIndexChange: (index: number) => void;
    onGenerate: () => Promise<void>;
  };
}

const ImageInpaintingBlock: React.FC<ImageInpaintingBlockProps> = ({ data }) => {
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

    // Ler até 2 arquivos (imagem principal e máscara)
    const fileArray = Array.from(files).slice(0, 2);
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
      // Define automaticamente a segunda imagem como máscara
      if (images.length >= 2) {
        data.onMaskIndexChange(1);
      }
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
    
    // Se removermos a imagem da máscara, limpe o maskIndex
    if (index === data.maskIndex) {
      data.onMaskIndexChange(-1);
    }
  };

  const setAsMask = (index: number) => {
    data.onMaskIndexChange(index);
  };

  const modelOptions = [
    { value: 'gpt-image-1', label: 'GPT Image-1' },
  ];

  return (
    <div className="border border-gray-300 rounded-md p-4 w-80 bg-white shadow-md">
      <div className="font-bold text-lg mb-2">Image Inpainting</div>
      
      <div className="mb-4">
        <label className="block text-sm font-medium">Prompt</label>
        <textarea
          className="w-full border border-gray-300 rounded p-2 text-sm"
          value={data.prompt}
          onChange={(e) => data.onPromptChange(e.target.value)}
          placeholder="Describe what to add to the masked area..."
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
        <label className="block text-sm font-medium mb-2">Upload Image & Mask</label>
        <div className="text-xs text-gray-500 mb-2">
          Upload the main image and a mask image. Transparent areas in the mask will be edited.
        </div>
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
                  className={`w-full h-24 object-cover rounded ${
                    index === data.maskIndex ? 'border-2 border-blue-500' : ''
                  }`}
                />
                <div className="absolute top-1 right-1 flex">
                  {data.uploadedImages.length >= 2 && (
                    <button
                      onClick={() => setAsMask(index)}
                      className={`bg-blue-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs mr-1 ${
                        index === data.maskIndex ? 'opacity-50' : ''
                      }`}
                      title="Set as mask"
                      disabled={index === data.maskIndex}
                    >
                      M
                    </button>
                  )}
                  <button
                    onClick={() => removeImage(index)}
                    className="bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs"
                    title="Remove image"
                  >
                    ×
                  </button>
                </div>
                {index === data.maskIndex && (
                  <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                    Mask
                  </div>
                )}
                {index === 0 && index !== data.maskIndex && (
                  <div className="absolute bottom-1 left-1 bg-green-500 text-white text-xs px-1 rounded">
                    Main
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      
      {data.generatedImage && (
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Generated Image</label>
          <img
            src={data.generatedImage}
            alt="Generated"
            className="w-full rounded border border-gray-300"
          />
          {data.metadata && (
            <div className="mt-1 text-xs text-gray-500">
              Generated with {data.metadata.model} at {new Date(data.metadata.timestamp).toLocaleString()}
            </div>
          )}
        </div>
      )}
      
      <button
        className={`w-full py-2 px-4 rounded ${
          isGenerating || data.uploadedImages.length < 2 || !data.prompt || data.maskIndex < 0
            ? 'bg-gray-400 cursor-not-allowed'
            : 'bg-blue-500 text-white hover:bg-blue-600'
        }`}
        onClick={handleGenerate}
        disabled={isGenerating || data.uploadedImages.length < 2 || !data.prompt || data.maskIndex < 0}
      >
        {isGenerating ? 'Generating...' : 'Generate Image'}
      </button>
    </div>
  );
};

export default ImageInpaintingBlock; 