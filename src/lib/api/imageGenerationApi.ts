import axios from 'axios';

interface GenerateImageParams {
  prompt: string;
  model: string;
  seed?: number;
  style?: string;
  resolution: string;
}

interface GenerateImageEditParams {
  prompt: string;
  model: string;
  images: string[];
  maskIndex?: number;
}

interface GenerateImageResult {
  imageUrl: string;
  metadata: {
    model: string;
    seed?: number;
    timestamp: string;
  };
}

// Call our internal API endpoint to securely generate images
export async function generateImage(params: GenerateImageParams): Promise<GenerateImageResult> {
  try {
    const response = await axios.post('/api/generate-image', params);
    return response.data;
  } catch (error: any) {
    console.error('Image generation error:', error.response?.data || error);
    throw new Error(error.response?.data?.error || 'Failed to generate image');
  }
}

// Call our internal API endpoint for image editing
export async function generateImageEdit(params: GenerateImageEditParams): Promise<GenerateImageResult> {
  try {
    const response = await axios.post('/api/edit-image', params);
    return response.data;
  } catch (error: any) {
    console.error('Image editing error:', error.response?.data || error);
    throw new Error(error.response?.data?.error || 'Failed to edit image');
  }
}

// Use this when calling from the backend directly
export async function generateImageWithOpenAI(params: GenerateImageParams): Promise<GenerateImageResult> {
  return generateImage(params);
}

// Use this when calling from the backend directly
export async function generateImageWithStabilityAI(params: GenerateImageParams): Promise<GenerateImageResult> {
  return generateImage(params);
}