'use client';

import { useState } from 'react';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  subtitle?: string;
}

export function ImageModal({ isOpen, onClose, imageUrl, title, subtitle }: ImageModalProps) {
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(imageUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08090B]/90 backdrop-blur-md p-4 sm:p-6 animate-fadeIn">
      <div className="bg-[#12151B] border border-[#f2ca50]/50 rounded-lg max-w-5xl w-full max-h-[95vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-5 py-3.5 bg-[#1A1E26] border-b border-[#282E3A]">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-[#f2ca50] text-xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              photo_camera
            </span>
            <div>
              <h3 className="text-sm font-semibold text-[#F4F1EA] font-['Space_Grotesk'] tracking-wide">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-[#9CA3AF] font-['Space_Grotesk']">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setZoom(zoom === 1 ? 1.75 : 1)}
              className="px-2.5 py-1 bg-[#12151B] hover:bg-[#282a2d] border border-[#282E3A] text-xs font-['Space_Grotesk'] text-[#E5C875] rounded transition-colors flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-sm">
                {zoom === 1 ? 'zoom_in' : 'zoom_out'}
              </span>
              <span>{zoom === 1 ? 'Ampliar 1.75x' : 'Resetar 1.0x'}</span>
            </button>

            <button
              onClick={onClose}
              className="w-8 h-8 rounded bg-[#12151B] hover:bg-[#282a2d] border border-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA] flex items-center justify-center transition-colors"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Image Viewport */}
        <div className="flex-1 overflow-auto p-4 flex items-center justify-center bg-[#08090B] relative min-h-[320px] max-h-[70vh]">
          <img
            src={imageUrl}
            alt={title}
            style={{ transform: `scale(${zoom})`, transition: 'transform 0.3s ease' }}
            className="max-h-[65vh] w-auto max-w-full object-contain rounded shadow-lg select-none"
          />
        </div>

        {/* Modal Footer with Direct HTML Image Links as requested */}
        <div className="p-4 bg-[#1A1E26] border-t border-[#282E3A] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-['Space_Grotesk']">
          <div className="flex-1 w-full truncate">
            <span className="text-[#9CA3AF] text-[11px] uppercase tracking-wider block mb-1">
              Link Direto para Imagem em HTML:
            </span>
            <div className="flex items-center gap-2 bg-[#08090B] border border-[#282E3A] px-3 py-1.5 rounded">
              <span className="text-[#E5C875] truncate text-xs flex-1 selection:bg-[#f2ca50] selection:text-black">
                {imageUrl}
              </span>
              <button
                onClick={handleCopy}
                className="px-2 py-0.5 bg-[#12151B] hover:bg-[#282a2d] text-[#F4F1EA] border border-[#282E3A] rounded text-[11px] flex items-center gap-1 transition-colors shrink-0"
              >
                <span className="material-symbols-outlined text-xs">
                  {copied ? 'check' : 'content_copy'}
                </span>
                <span>{copied ? 'Copiado!' : 'Copiar URL'}</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Direct HTML link */}
            <a
              href={imageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-2 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-bold rounded flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-sm">open_in_new</span>
              <span>Abrir Imagem Original</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
