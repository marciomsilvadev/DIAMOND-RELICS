'use client';

import React, { useState, useRef } from 'react';
import { MediaItem } from '@/lib/relics-data';
import { readFileAsMediaItem, createMediaFromUrl } from '@/lib/media-helper';

interface ProductGalleryEditorProps {
  mediaList: MediaItem[];
  onChange: (items: MediaItem[]) => void;
}

export function ProductGalleryEditor({ mediaList, onChange }: ProductGalleryEditorProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progressText, setProgressText] = useState('');
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlType, setUrlType] = useState<'image' | 'video'>('image');
  const [isDragOver, setIsDragOver] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setIsProcessing(true);
    setProgressText(`Processando ${files.length} arquivo(s)...`);

    const newItems: MediaItem[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      setProgressText(`Otimizando ${i + 1} de ${files.length}: ${file.name}...`);
      try {
        const item = await readFileAsMediaItem(file);
        // Se for o primeiro item adicionado à galeria e não houver itens, é a capa
        if (mediaList.length === 0 && newItems.length === 0) {
          item.isCover = true;
        }
        newItems.push(item);
      } catch (err: any) {
        alert(`Não foi possível carregar o arquivo ${file.name}: ${err.message || 'Erro'}`);
      }
    }

    const updated = [...mediaList, ...newItems];
    onChange(updated);

    setIsProcessing(false);
    setProgressText('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const item = createMediaFromUrl(urlInput.trim(), urlType);
    if (mediaList.length === 0) {
      item.isCover = true;
    }
    onChange([...mediaList, item]);
    setUrlInput('');
    setShowUrlInput(false);
  };

  const handleSetCover = (index: number) => {
    if (index === 0) return;
    const target = mediaList[index];
    const filtered = mediaList.filter((_, i) => i !== index);
    const reordered = [{ ...target, isCover: true }, ...filtered.map((item) => ({ ...item, isCover: false }))];
    onChange(reordered);
  };

  const handleRemove = (index: number) => {
    const updated = mediaList.filter((_, i) => i !== index);
    if (updated.length > 0 && !updated.some((item) => item.isCover)) {
      updated[0].isCover = true;
    }
    onChange(updated);
  };

  const imageCount = mediaList.filter((m) => m.type === 'image').length;
  const videoCount = mediaList.filter((m) => m.type === 'video').length;

  return (
    <div className="space-y-3 font-['Space_Grotesk'] text-xs">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-[#F4F1EA] font-bold block uppercase tracking-wider text-[11px]">
            Galeria de Fotos e Vídeos do Produto
          </label>
          <span className="text-[10px] text-[#9CA3AF]">
            Adicione múltiplos arquivos de fotos e vídeos diretamente do seu computador.
          </span>
        </div>

        {mediaList.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] bg-[#08090B] border border-[#282E3A] px-2.5 py-1 rounded">
            <span className="text-[#10B981] font-bold">
              {imageCount} {imageCount === 1 ? 'Foto' : 'Fotos'}
            </span>
            <span className="text-[#9CA3AF]">•</span>
            <span className="text-[#E5C875] font-bold">
              {videoCount} {videoCount === 1 ? 'Vídeo' : 'Vídeos'}
            </span>
          </div>
        )}
      </div>

      {/* Área de Dropzone e Upload do Computador */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
          isDragOver
            ? 'border-[#f2ca50] bg-[#f2ca50]/10 scale-[1.01]'
            : 'border-[#282E3A] hover:border-[#f2ca50]/70 bg-[#08090B]'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileInputChange}
          className="hidden"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center justify-center gap-2 py-2">
            <span className="material-symbols-outlined text-3xl text-[#f2ca50] animate-spin">
              autorenew
            </span>
            <span className="text-xs text-[#f2ca50] font-bold">{progressText}</span>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center gap-1.5">
            <div className="w-12 h-12 rounded-full bg-[#12151B] border border-[#282E3A] flex items-center justify-center text-[#f2ca50] mb-1">
              <span className="material-symbols-outlined text-2xl">add_photo_alternate</span>
            </div>
            <strong className="text-sm text-[#F4F1EA]">
              Clique para selecionar fotos e vídeos ou arraste aqui
            </strong>
            <p className="text-[11px] text-[#9CA3AF] max-w-md">
              Adicione imagens em alta resolução (JPG, PNG, WEBP) ou vídeos curtos da peça (MP4, WebM).
              Você pode selecionar vários arquivos juntos.
            </p>
            <div className="flex items-center gap-2 mt-2">
              <span className="px-3 py-1 bg-[#1A1E26] hover:bg-[#282E3A] text-[#f2ca50] border border-[#282E3A] rounded font-bold text-[11px] uppercase flex items-center gap-1.5">
                <span className="material-symbols-outlined text-sm">upload_file</span>
                Escolher Arquivos do Computador
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Botão de Alternativa por Link URL */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] text-[#9CA3AF] hover:text-[#f2ca50] underline flex items-center gap-1"
        >
          <span className="material-symbols-outlined text-xs">link</span>
          {showUrlInput ? 'Ocultar adição por link' : 'Ou adicionar por link URL de imagem/vídeo'}
        </button>
      </div>

      {/* Formulário de Link URL */}
      {showUrlInput && (
        <div className="p-3 bg-[#1A1E26] border border-[#282E3A] rounded-lg space-y-2 animate-fadeIn">
          <span className="text-[11px] font-bold text-[#F4F1EA] block">Adicionar por Link URL:</span>
          <div className="flex gap-2">
            <select
              value={urlType}
              onChange={(e) => setUrlType(e.target.value as any)}
              className="bg-[#08090B] border border-[#282E3A] text-[#F4F1EA] px-2 py-1.5 rounded text-xs focus:outline-none focus:border-[#f2ca50]"
            >
              <option value="image">Foto (Imagem)</option>
              <option value="video">Vídeo (MP4/WebM)</option>
            </select>
            <input
              type="url"
              placeholder="https://exemplo.com/foto-ou-video.jpg"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              className="flex-1 bg-[#08090B] border border-[#282E3A] rounded px-3 py-1.5 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
            />
            <button
              type="button"
              onClick={handleAddUrl}
              className="px-3 py-1.5 bg-[#f2ca50] text-[#08090B] font-bold rounded uppercase hover:bg-[#E5C875] text-[11px]"
            >
              Adicionar
            </button>
          </div>
        </div>
      )}

      {/* Grid de Pré-visualização da Galeria de Fotos e Vídeos */}
      {mediaList.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-[11px] text-[#9CA3AF]">
            <span>Itens na Galeria (a primeira foto/vídeo será a Capa do produto):</span>
            <span>{mediaList.length} item(ns)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 max-h-64 overflow-y-auto custom-scrollbar p-1 bg-[#08090B] rounded-lg border border-[#282E3A]">
            {mediaList.map((item, index) => {
              const isCover = index === 0;
              const isVideo = item.type === 'video';

              return (
                <div
                  key={item.id || index}
                  className={`relative rounded-lg overflow-hidden border transition-all bg-[#12151B] group ${
                    isCover
                      ? 'border-[#f2ca50] ring-1 ring-[#f2ca50] shadow-[0_0_12px_rgba(242,202,80,0.25)]'
                      : 'border-[#282E3A] hover:border-[#9CA3AF]'
                  }`}
                >
                  {/* Thumbnail */}
                  <div className="aspect-square relative bg-black flex items-center justify-center overflow-hidden">
                    {isVideo ? (
                      <div className="w-full h-full relative flex items-center justify-center bg-black/80">
                        <video src={item.url} className="w-full h-full object-cover opacity-75" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="w-8 h-8 rounded-full bg-[#f2ca50] text-[#08090B] flex items-center justify-center shadow-lg">
                            <span className="material-symbols-outlined text-base">play_arrow</span>
                          </span>
                        </div>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.title || `Foto ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                    )}

                    {/* Tag de Capa */}
                    {isCover && (
                      <span className="absolute top-1.5 left-1.5 bg-[#f2ca50] text-[#08090B] text-[9px] font-bold uppercase px-1.5 py-0.5 rounded shadow flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[11px]">star</span>
                        Capa
                      </span>
                    )}

                    {/* Tag de Tipo (Foto ou Vídeo) */}
                    <span className="absolute top-1.5 right-1.5 bg-[#08090B]/85 text-[#F4F1EA] text-[9px] px-1 py-0.5 rounded border border-[#282E3A] flex items-center gap-0.5">
                      <span className="material-symbols-outlined text-[11px]">
                        {isVideo ? 'videocam' : 'photo'}
                      </span>
                      {isVideo ? 'Vídeo' : 'Foto'}
                    </span>
                  </div>

                  {/* Ações do Item */}
                  <div className="p-1.5 bg-[#1A1E26] border-t border-[#282E3A] flex items-center justify-between gap-1">
                    {!isCover ? (
                      <button
                        type="button"
                        onClick={() => handleSetCover(index)}
                        className="text-[10px] text-[#f2ca50] hover:text-[#E5C875] font-semibold truncate flex items-center gap-0.5"
                        title="Tornar esta imagem a capa principal do produto"
                      >
                        <span className="material-symbols-outlined text-xs">star</span>
                        Definir Capa
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#10B981] font-bold truncate">
                        Capa Principal
                      </span>
                    )}

                    <button
                      type="button"
                      onClick={() => handleRemove(index)}
                      className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                      title="Excluir da galeria"
                    >
                      <span className="material-symbols-outlined text-sm">delete</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
