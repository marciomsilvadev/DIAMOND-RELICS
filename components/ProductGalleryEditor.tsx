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
  const [isDragOverDropzone, setIsDragOverDropzone] = useState(false);

  // Estados para Arrastar e Reordenar Imagens (Drag and Drop)
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

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
        // Se for o primeiro item adicionado à galeria e não houver itens, é a foto principal
        if (mediaList.length === 0 && newItems.length === 0) {
          item.isCover = true;
        } else {
          item.isCover = false;
        }
        newItems.push(item);
      } catch (err: any) {
        alert(`Não foi possível carregar o arquivo ${file.name}: ${err.message || 'Erro'}`);
      }
    }

    const updated = [...mediaList, ...newItems];
    // Garante que o primeiro elemento é sempre marcado como capa
    syncCoverStatus(updated);

    setIsProcessing(false);
    setProgressText('');

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
  };

  const syncCoverStatus = (list: MediaItem[]) => {
    const adjusted = list.map((item, i) => ({
      ...item,
      isCover: i === 0,
    }));
    onChange(adjusted);
  };

  // Upload Dropzone
  const handleDropzoneDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDropzone(true);
  };

  const handleDropzoneDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDropzone(false);
  };

  const handleDropzoneDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOverDropzone(false);
    handleFiles(e.dataTransfer.files);
  };

  // Adicionar por URL
  const handleAddUrl = (e: React.FormEvent) => {
    e.preventDefault();
    if (!urlInput.trim()) return;

    const item = createMediaFromUrl(urlInput.trim(), urlType);
    const updated = [...mediaList, item];
    syncCoverStatus(updated);
    setUrlInput('');
    setShowUrlInput(false);
  };

  // Definir como Foto Principal (Move para a posição 0)
  const handleSetAsMainPhoto = (index: number) => {
    if (index === 0) return;
    const target = mediaList[index];
    const filtered = mediaList.filter((_, i) => i !== index);
    const reordered = [target, ...filtered];
    syncCoverStatus(reordered);
  };

  // Mover Posição (Setas para Esquerda / Direita)
  const handleMoveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= mediaList.length) return;
    const updated = [...mediaList];
    const [movedItem] = updated.splice(fromIndex, 1);
    updated.splice(toIndex, 0, movedItem);
    syncCoverStatus(updated);
  };

  // Drag and Drop entre os Cards da Galeria (Reordenar arrastando)
  const handleItemDragStart = (e: React.DragEvent, index: number) => {
    e.stopPropagation();
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Define dado para compatibilidade
    e.dataTransfer.setData('text/plain', index.toString());
  };

  const handleItemDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (draggedIndex === null || draggedIndex === index) return;
    setDragOverIndex(index);
  };

  const handleItemDragLeave = (e: React.DragEvent) => {
    e.stopPropagation();
    setDragOverIndex(null);
  };

  const handleItemDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    e.stopPropagation();

    if (draggedIndex === null || draggedIndex === targetIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const updated = [...mediaList];
    const [movedItem] = updated.splice(draggedIndex, 1);
    updated.splice(targetIndex, 0, movedItem);

    setDraggedIndex(null);
    setDragOverIndex(null);
    syncCoverStatus(updated);
  };

  const handleItemDragEnd = () => {
    setDraggedIndex(null);
    setDragOverIndex(null);
  };

  // Remover Item
  const handleRemove = (index: number) => {
    const updated = mediaList.filter((_, i) => i !== index);
    syncCoverStatus(updated);
  };

  const imageCount = mediaList.filter((m) => m.type === 'image').length;
  const videoCount = mediaList.filter((m) => m.type === 'video').length;

  return (
    <div className="space-y-3 font-['Space_Grotesk'] text-xs">
      <div className="flex items-center justify-between">
        <div>
          <label className="text-[#F4F1EA] font-bold block uppercase tracking-wider text-[11px] flex items-center gap-1.5">
            <span className="material-symbols-outlined text-sm text-[#f2ca50]">collections</span>
            Galeria de Fotos e Vídeos do Produto
          </label>
          <span className="text-[10px] text-[#9CA3AF]">
            Arraste as imagens para reordenar ou clique em &quot;Definir como Principal&quot;. A primeira foto é a capa da vitrine.
          </span>
        </div>

        {mediaList.length > 0 && (
          <div className="flex items-center gap-2 text-[10px] bg-[#08090B] border border-[#282E3A] px-2.5 py-1 rounded shrink-0">
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
        onDragOver={handleDropzoneDragOver}
        onDragLeave={handleDropzoneDragLeave}
        onDrop={handleDropzoneDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`border-2 border-dashed rounded-lg p-5 text-center cursor-pointer transition-all ${
          isDragOverDropzone
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
              Adicione fotos em alta resolução (JPG, PNG, WEBP) ou vídeos (MP4, WebM).
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
          className="text-[11px] text-[#9CA3AF] hover:text-[#f2ca50] underline flex items-center gap-1 cursor-pointer"
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

      {/* Grid de Reordenação e Gestão de Fotos e Vídeos */}
      {mediaList.length > 0 && (
        <div className="space-y-2 pt-2">
          <div className="flex items-center justify-between text-[11px] bg-[#12151B] border border-[#282E3A] px-3 py-2 rounded-lg">
            <span className="text-[#E5C875] flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-sm">drag_indicator</span>
              <strong>Dica de Ordem:</strong> Arraste os cards para trocar de posição ou use as setas ◀ ▶.
            </span>
            <span className="text-[#9CA3AF]">{mediaList.length} item(ns)</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-h-80 overflow-y-auto custom-scrollbar p-2 bg-[#08090B] rounded-lg border border-[#282E3A]">
            {mediaList.map((item, index) => {
              const isCover = index === 0;
              const isVideo = item.type === 'video';
              const isBeingDragged = draggedIndex === index;
              const isTargetHover = dragOverIndex === index;

              return (
                <div
                  key={item.id || index}
                  draggable={true}
                  onDragStart={(e) => handleItemDragStart(e, index)}
                  onDragOver={(e) => handleItemDragOver(e, index)}
                  onDragLeave={handleItemDragLeave}
                  onDrop={(e) => handleItemDrop(e, index)}
                  onDragEnd={handleItemDragEnd}
                  className={`relative rounded-lg overflow-hidden border transition-all bg-[#12151B] flex flex-col cursor-grab active:cursor-grabbing select-none group ${
                    isBeingDragged
                      ? 'opacity-30 scale-95 border-[#f2ca50] border-dashed'
                      : isTargetHover
                      ? 'border-[#f2ca50] ring-2 ring-[#f2ca50] scale-[1.02] bg-[#f2ca50]/10'
                      : isCover
                      ? 'border-[#f2ca50] ring-1 ring-[#f2ca50] shadow-[0_0_15px_rgba(242,202,80,0.3)]'
                      : 'border-[#282E3A] hover:border-[#9CA3AF]'
                  }`}
                >
                  {/* Thumbnail com Indicadores */}
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
                        className="w-full h-full object-cover pointer-events-none"
                      />
                    )}

                    {/* Badge de Ordem e Capa */}
                    <div className="absolute top-1.5 left-1.5 flex items-center gap-1">
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.5 rounded shadow flex items-center gap-0.5 uppercase ${
                          isCover
                            ? 'bg-[#f2ca50] text-[#08090B]'
                            : 'bg-[#08090B]/90 text-[#F4F1EA] border border-[#282E3A]'
                        }`}
                      >
                        {isCover && (
                          <span className="material-symbols-outlined text-[11px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                            star
                          </span>
                        )}
                        #{index + 1} {isCover ? 'Capa Principal' : ''}
                      </span>
                    </div>

                    {/* Indicador de Arraste no canto */}
                    <div className="absolute top-1.5 right-1.5 flex items-center gap-1">
                      <span className="bg-[#08090B]/85 text-[#9CA3AF] p-0.5 rounded border border-[#282E3A] opacity-80 group-hover:opacity-100" title="Clique e arraste para mudar a ordem">
                        <span className="material-symbols-outlined text-xs block">drag_indicator</span>
                      </span>
                    </div>
                  </div>

                  {/* Barra de Controles e Ordenação */}
                  <div className="p-2 bg-[#1A1E26] border-t border-[#282E3A] flex flex-col gap-1.5">
                    {/* Botão de Definir como Foto Principal */}
                    {!isCover ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSetAsMainPhoto(index);
                        }}
                        className="w-full py-1 px-2 bg-[#08090B] hover:bg-[#f2ca50] text-[#f2ca50] hover:text-[#08090B] border border-[#f2ca50]/50 hover:border-[#f2ca50] rounded font-bold text-[10px] uppercase transition-all flex items-center justify-center gap-1 cursor-pointer"
                        title="Mover esta foto para ser a Capa Principal"
                      >
                        <span className="material-symbols-outlined text-xs">star</span>
                        Definir como Principal
                      </button>
                    ) : (
                      <div className="w-full py-1 px-2 bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40 rounded font-bold text-[10px] uppercase text-center flex items-center justify-center gap-1">
                        <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>
                          check_circle
                        </span>
                        Foto Principal da Loja
                      </div>
                    )}

                    {/* Controles de Posição Manual (Setas ◀ e ▶) e Excluir */}
                    <div className="flex items-center justify-between gap-1 pt-1 border-t border-[#282E3A]/70">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveItem(index, index - 1);
                          }}
                          disabled={index === 0}
                          className="p-1 rounded bg-[#08090B] hover:bg-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Mover para trás"
                        >
                          <span className="material-symbols-outlined text-sm block">arrow_back</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMoveItem(index, index + 1);
                          }}
                          disabled={index === mediaList.length - 1}
                          className="p-1 rounded bg-[#08090B] hover:bg-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                          title="Mover para frente"
                        >
                          <span className="material-symbols-outlined text-sm block">arrow_forward</span>
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemove(index);
                        }}
                        className="p-1 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors"
                        title="Excluir da galeria"
                      >
                        <span className="material-symbols-outlined text-sm block">delete</span>
                      </button>
                    </div>
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
