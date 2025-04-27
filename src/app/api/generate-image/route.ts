import { NextResponse } from 'next/server';
import OpenAI from 'openai';
import axios from 'axios';

export async function POST(request: Request) {
  try {
    const { prompt, model, resolution } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (model === 'dall-e-3' || model === 'gpt-image-1') {
      // Inicializa o cliente OpenAI com a chave API
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
      });

      const size = resolution === '1024x1024' ? '1024x1024' : 
                   resolution === '512x512' ? '512x512' : 
                   resolution === '1024x1792' ? '1024x1792' : 
                   resolution === '1792x1024' ? '1792x1024' : '1024x1024';
      
      // Gera a imagem usando a API oficial do OpenAI
      const result = await openai.images.generate({
        model: "dall-e-3", // ou use model se for "gpt-image-1"
        prompt,
        n: 1,
        size: size,
        response_format: "url",
      });

      return NextResponse.json({
        imageUrl: result.data[0].url,
        metadata: {
          model: 'dall-e-3',
          seed: 0, // OpenAI doesn't provide seed information
          timestamp: new Date().toISOString(),
        },
      });
    } else if (model === 'stable-diffusion') {
      if (!process.env.NEXT_PUBLIC_STABILITY_API_KEY) {
        return NextResponse.json(
          { error: 'Stability API key not configured' },
          { status: 500 }
        );
      }

      const [width, height] = resolution.split('x').map(Number);
      
      const response = await axios.post(
        'https://api.stability.ai/v1/generation/stable-diffusion-xl-1024-v1-0/text-to-image',
        {
          text_prompts: [{ text: prompt }],
          cfg_scale: 7,
          height,
          width,
          samples: 1,
          steps: 30,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${process.env.NEXT_PUBLIC_STABILITY_API_KEY}`,
          },
        }
      );
      
      // Convert the base64 image to a data URL
      const base64Image = response.data.artifacts[0].base64;
      const imageUrl = `data:image/png;base64,${base64Image}`;
      
      return NextResponse.json({
        imageUrl,
        metadata: {
          model: 'stable-diffusion-xl',
          seed: response.data.artifacts[0].seed,
          timestamp: new Date().toISOString(),
        },
      });
    } else {
      // Fallback ou modelo não suportado
      return NextResponse.json(
        { error: 'Unsupported model' },
        { status: 400 }
      );
    }
  } catch (error: any) {
    console.error('API error:', error.response?.data || error.message || error);
    return NextResponse.json(
      { error: error.response?.data?.error?.message || error.message || 'Unknown error' },
      { status: 500 }
    );
  }
} 