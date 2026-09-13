'use client';

import { MediaItem } from './relics-data';

/**
 * Lê um arquivo do computador (foto ou vídeo) e converte para MediaItem.
 * Fotos são comprimidas via Canvas HTML5 para resolução HD (~1200px máx) e qualidade 0.82,
 * garantindo qualidade visual nítida e consumo ultra-leve no armazenamento.
 */
export async function readFileAsMediaItem(file: File): Promise<MediaItem> {
  const isVideo = file.type.startsWith('video/');

  if (isVideo) {
    return new Promise((resolve, reject) => {
      // Limite de 25MB para vídeos locais
      if (file.size > 25 * 1024 * 1024) {
        reject(new Error('O vídeo excede o tamanho máximo suportado de 25MB.'));
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        resolve({
          id: `vid-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          type: 'video',
          url: reader.result as string,
          title: file.name,
        });
      };
      reader.onerror = () => reject(new Error('Falha ao processar arquivo de vídeo.'));
      reader.readAsDataURL(file);
    });
  }

  // Processamento de Imagens de Alta Resolução (2000-3000px) com WebP 83%
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          let { width, height } = img;
          // Padrão de Alta Resolução: 2400px (proporção de 2.5x a 3x do contêiner)
          const maxDim = 2400;

          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');

          if (ctx) {
            ctx.imageSmoothingEnabled = true;
            ctx.imageSmoothingQuality = 'high';
            ctx.drawImage(img, 0, 0, width, height);

            // Tenta exportar em WebP 83% de alta fidelidade
            let compressed = canvas.toDataURL('image/webp', 0.83);
            if (!compressed.startsWith('data:image/webp')) {
              // Fallback para JPEG a 83% caso o navegador não suporte WebP
              compressed = canvas.toDataURL('image/jpeg', 0.83);
            }

            resolve({
              id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
              type: 'image',
              url: compressed,
              title: file.name,
            });
            return;
          }

          resolve({
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            type: 'image',
            url: e.target?.result as string,
            title: file.name,
          });
        } catch {
          resolve({
            id: `img-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            type: 'image',
            url: e.target?.result as string,
            title: file.name,
          });
        }
      };

      img.onerror = () => reject(new Error('Falha ao decodificar a imagem.'));
      img.src = e.target?.result as string;
    };

    reader.onerror = () => reject(new Error('Falha ao ler o arquivo selecionado.'));
    reader.readAsDataURL(file);
  });
}

/**
 * Pré-carrega uma imagem de alta definição sob demanda em memória cache do navegador
 */
export function preloadHdImage(url: string): Promise<boolean> {
  if (typeof window === 'undefined' || !url) return Promise.resolve(false);
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

/**
 * Cria um MediaItem a partir de um link URL (imagem ou vídeo MP4/WebM)
 */
export function createMediaFromUrl(
  url: string,
  type: 'image' | 'video' = 'image',
  title?: string
): MediaItem {
  const isVideo =
    type === 'video' ||
    url.endsWith('.mp4') ||
    url.endsWith('.webm') ||
    url.includes('youtube') ||
    url.includes('vimeo');

  return {
    id: `ext-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    type: isVideo ? 'video' : 'image',
    url: url.trim(),
    title: title || (isVideo ? 'Vídeo do Produto' : 'Foto do Produto'),
  };
}
