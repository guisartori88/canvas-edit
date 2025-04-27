import { create } from 'zustand';
import { 
  Connection, 
  Edge, 
  EdgeChange, 
  Node, 
  NodeChange, 
  addEdge, 
  OnNodesChange, 
  OnEdgesChange, 
  OnConnect, 
  applyNodeChanges, 
  applyEdgeChanges 
} from 'reactflow';
import { generateImageWithOpenAI, generateImageWithStabilityAI, generateImageEdit } from '../lib/api/imageGenerationApi';

export type TextToImageNode = Node<{
  prompt: string;
  model: string;
  resolution: string;
  generatedImage?: string;
  metadata?: {
    model: string;
    seed: number;
    timestamp: string;
  };
}>;

export type ImageToImageNode = Node<{
  prompt: string;
  model: string;
  uploadedImages: string[];
  generatedImage?: string;
  metadata?: {
    model: string;
    timestamp: string;
  };
}>;

export type ImageInpaintingNode = Node<{
  prompt: string;
  model: string;
  uploadedImages: string[];
  maskIndex: number;
  generatedImage?: string;
  metadata?: {
    model: string;
    timestamp: string;
  };
}>;

type RFState = {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addTextToImageNode: (position: { x: number; y: number }) => void;
  addImageToImageNode: (position: { x: number; y: number }) => void;
  addImageInpaintingNode: (position: { x: number; y: number }) => void;
  updateNodeData: <T extends object>(nodeId: string, data: Partial<T>) => void;
  generateImage: (nodeId: string) => Promise<void>;
};

let nodeId = 0;

export const useCanvasStore = create<RFState>((set, get) => ({
  nodes: [],
  edges: [],
  
  onNodesChange: (changes: NodeChange[]) => {
    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
  },
  
  onEdgesChange: (changes: EdgeChange[]) => {
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
  },
  
  onConnect: (connection: Connection) => {
    set({
      edges: addEdge(connection, get().edges),
    });
  },
  
  addTextToImageNode: (position: { x: number; y: number }) => {
    const newNode: TextToImageNode = {
      id: `text-to-image-${nodeId++}`,
      type: 'textToImage',
      position,
      data: {
        prompt: '',
        model: 'dall-e-3',
        resolution: '1024x1024',
      },
    };
    
    set({
      nodes: [...get().nodes, newNode],
    });
  },
  
  addImageToImageNode: (position: { x: number; y: number }) => {
    const newNode: ImageToImageNode = {
      id: `image-to-image-${nodeId++}`,
      type: 'imageToImage',
      position,
      data: {
        prompt: '',
        model: 'gpt-image-1',
        uploadedImages: [],
      },
    };
    
    set({
      nodes: [...get().nodes, newNode],
    });
  },
  
  addImageInpaintingNode: (position: { x: number; y: number }) => {
    const newNode: ImageInpaintingNode = {
      id: `image-inpainting-${nodeId++}`,
      type: 'imageInpainting',
      position,
      data: {
        prompt: '',
        model: 'gpt-image-1',
        uploadedImages: [],
        maskIndex: -1,
      },
    };
    
    set({
      nodes: [...get().nodes, newNode],
    });
  },
  
  updateNodeData: <T extends object>(nodeId: string, data: Partial<T>) => {
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === nodeId) {
          return {
            ...node,
            data: {
              ...node.data,
              ...data,
            },
          };
        }
        return node;
      }),
    });
  },
  
  generateImage: async (nodeId: string) => {
    // Find the node
    const node = get().nodes.find((node) => node.id === nodeId);
    if (!node) return;
    
    try {
      let result;
      
      // Verifica se é um node de Text-to-Image
      if (node.type === 'textToImage') {
        const textNode = node as TextToImageNode;
        
        if (textNode.data.model === 'dall-e-3') {
          result = await generateImageWithOpenAI({
            prompt: textNode.data.prompt,
            model: textNode.data.model,
            resolution: textNode.data.resolution
          });
        } else if (textNode.data.model === 'stable-diffusion') {
          result = await generateImageWithStabilityAI({
            prompt: textNode.data.prompt,
            model: textNode.data.model,
            resolution: textNode.data.resolution
          });
        } else {
          // Fallback to mock data for other models or as a backup
          result = {
            imageUrl: `https://picsum.photos/${textNode.data.resolution.split('x')[0]}`,
            metadata: {
              model: textNode.data.model,
              seed: Math.floor(Math.random() * 1000000),
              timestamp: new Date().toISOString(),
            },
          };
        }
      } 
      // Verifica se é um node de Image-to-Image
      else if (node.type === 'imageToImage') {
        const imageNode = node as ImageToImageNode;
        
        result = await generateImageEdit({
          prompt: imageNode.data.prompt,
          model: imageNode.data.model,
          images: imageNode.data.uploadedImages
        });
      }
      // Verifica se é um node de Image Inpainting
      else if (node.type === 'imageInpainting') {
        const inpaintingNode = node as ImageInpaintingNode;
        
        result = await generateImageEdit({
          prompt: inpaintingNode.data.prompt,
          model: inpaintingNode.data.model,
          images: inpaintingNode.data.uploadedImages,
          maskIndex: inpaintingNode.data.maskIndex
        });
      }
      
      // Update the node with the generated image
      if (result) {
        get().updateNodeData(nodeId, {
          generatedImage: result.imageUrl,
          metadata: result.metadata,
        });
      }
    } catch (error) {
      console.error('Failed to generate image:', error);
      throw error;
    }
  },
})); 