import { NextResponse } from 'next/server';
import OpenAI, { toFile } from 'openai';
import fs from 'fs';
import path from 'path';
import os from 'os';

export async function POST(request: Request) {
  try {
    const { prompt, model, images, maskIndex } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    if (!images || images.length === 0) {
      return NextResponse.json(
        { error: 'Images are required' },
        { status: 400 }
      );
    }

    if (model === 'gpt-image-1') {
      // Inicializa o cliente OpenAI com a chave API
      const openai = new OpenAI({
        apiKey: process.env.NEXT_PUBLIC_OPENAI_API_KEY
      });

      // Cria diretório temporário para salvar as imagens
      const tmpDir = path.join(os.tmpdir(), 'canvas-images-' + Date.now());
      fs.mkdirSync(tmpDir, { recursive: true });

      // Salva as imagens no servidor temporariamente
      const imagePaths = await Promise.all(
        images.map(async (dataUrl, index) => {
          // Extrai a parte base64 da data URL
          const base64 = dataUrl.split(',')[1];
          const buffer = Buffer.from(base64, 'base64');
          
          // Salva a imagem em um arquivo temporário
          const filePath = path.join(tmpDir, `image-${index}.png`);
          fs.writeFileSync(filePath, buffer);
          
          return filePath;
        })
      );

      try {
        let result;
        
        // Verifica se estamos fazendo edição com máscara (inpainting)
        if (images.length >= 2 && maskIndex !== undefined) {
          // O primeiro argumento é a imagem a ser editada, o segundo é a máscara
          const mainImageFile = await toFile(fs.createReadStream(imagePaths[0]), null, {
            type: 'image/png',
          });
          
          const maskImageFile = await toFile(fs.createReadStream(imagePaths[maskIndex]), null, {
            type: 'image/png',
          });
          
          // Gera a imagem editada com máscara (inpainting)
          result = await openai.images.edit({
            model: "gpt-image-1",
            image: mainImageFile,
            mask: maskImageFile,
            prompt
          });
        } else {
          // Converte os arquivos para o formato esperado pela API OpenAI
          const imageFiles = await Promise.all(
            imagePaths.map(async (filePath) => {
              return await toFile(fs.createReadStream(filePath), null, {
                type: 'image/png',
              });
            })
          );
          
          // Edição normal sem máscara
          result = await openai.images.edit({
            model: "gpt-image-1",
            image: imageFiles,
            prompt
          });
        }

        // Limpa os arquivos temporários
        try {
          imagePaths.forEach(filePath => fs.unlinkSync(filePath));
          fs.rmdirSync(tmpDir);
        } catch (cleanupError) {
          console.error('Error cleaning up temp files:', cleanupError);
        }

        // Verifica se a resposta contém uma URL ou base64
        let imageUrl;
        if (result.data[0].url) {
          imageUrl = result.data[0].url;
        } else if (result.data[0].b64_json) {
          imageUrl = `data:image/png;base64,${result.data[0].b64_json}`;
        } else {
          throw new Error('No image data received from API');
        }

        return NextResponse.json({
          imageUrl,
          metadata: {
            model: 'gpt-image-1',
            timestamp: new Date().toISOString(),
          },
        });
      } catch (apiError) {
        // Limpa os arquivos temporários em caso de erro
        try {
          imagePaths.forEach(filePath => fs.unlinkSync(filePath));
          fs.rmdirSync(tmpDir);
        } catch (cleanupError) {
          console.error('Error cleaning up temp files:', cleanupError);
        }
        throw apiError;
      }
    } else {
      // Modelo não suportado
      return NextResponse.json(
        { error: 'Unsupported model for image editing' },
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