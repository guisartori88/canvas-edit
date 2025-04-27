import React, { useCallback } from 'react';
import TextToImageBlock from '../blocks/TextToImageBlock';
import ImageToImageBlock from '../blocks/ImageToImageBlock';
import ImageInpaintingBlock from '../blocks/ImageInpaintingBlock';
import { useCanvasStore } from '../../store/canvasStore';

export const nodeTypes = {
  textToImage: ({ id, data }: { id: string; data: any }) => {
    const updateNodeData = useCanvasStore((state) => state.updateNodeData);
    const generateImage = useCanvasStore((state) => state.generateImage);
    
    const handlePromptChange = useCallback(
      (prompt: string) => {
        updateNodeData(id, { prompt });
      },
      [id, updateNodeData]
    );
    
    const handleModelChange = useCallback(
      (model: string) => {
        updateNodeData(id, { model });
      },
      [id, updateNodeData]
    );
    
    const handleResolutionChange = useCallback(
      (resolution: string) => {
        updateNodeData(id, { resolution });
      },
      [id, updateNodeData]
    );
    
    const handleGenerate = useCallback(async () => {
      await generateImage(id);
    }, [id, generateImage]);
    
    return (
      <TextToImageBlock
        data={{
          ...data,
          onPromptChange: handlePromptChange,
          onModelChange: handleModelChange,
          onResolutionChange: handleResolutionChange,
          onGenerate: handleGenerate,
        }}
      />
    );
  },

  imageToImage: ({ id, data }: { id: string; data: any }) => {
    const updateNodeData = useCanvasStore((state) => state.updateNodeData);
    const generateImage = useCanvasStore((state) => state.generateImage);
    
    const handlePromptChange = useCallback(
      (prompt: string) => {
        updateNodeData(id, { prompt });
      },
      [id, updateNodeData]
    );
    
    const handleModelChange = useCallback(
      (model: string) => {
        updateNodeData(id, { model });
      },
      [id, updateNodeData]
    );
    
    const handleImagesChange = useCallback(
      (images: string[]) => {
        updateNodeData(id, { uploadedImages: images });
      },
      [id, updateNodeData]
    );
    
    const handleGenerate = useCallback(async () => {
      await generateImage(id);
    }, [id, generateImage]);
    
    return (
      <ImageToImageBlock
        data={{
          ...data,
          onPromptChange: handlePromptChange,
          onModelChange: handleModelChange,
          onImagesChange: handleImagesChange,
          onGenerate: handleGenerate,
        }}
      />
    );
  },

  imageInpainting: ({ id, data }: { id: string; data: any }) => {
    const updateNodeData = useCanvasStore((state) => state.updateNodeData);
    const generateImage = useCanvasStore((state) => state.generateImage);
    
    const handlePromptChange = useCallback(
      (prompt: string) => {
        updateNodeData(id, { prompt });
      },
      [id, updateNodeData]
    );
    
    const handleModelChange = useCallback(
      (model: string) => {
        updateNodeData(id, { model });
      },
      [id, updateNodeData]
    );
    
    const handleImagesChange = useCallback(
      (images: string[]) => {
        updateNodeData(id, { uploadedImages: images });
      },
      [id, updateNodeData]
    );
    
    const handleMaskIndexChange = useCallback(
      (maskIndex: number) => {
        updateNodeData(id, { maskIndex });
      },
      [id, updateNodeData]
    );
    
    const handleGenerate = useCallback(async () => {
      await generateImage(id);
    }, [id, generateImage]);
    
    return (
      <ImageInpaintingBlock
        data={{
          ...data,
          onPromptChange: handlePromptChange,
          onModelChange: handleModelChange,
          onImagesChange: handleImagesChange,
          onMaskIndexChange: handleMaskIndexChange,
          onGenerate: handleGenerate,
        }}
      />
    );
  }
};