'use client';

import { useState, useRef, useEffect, MouseEvent, WheelEvent } from 'react';
import { preloadHdImage } from '@/lib/media-helper';

interface ImageModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  mediaType?: 'image' | 'video';
  title: string;
  subtitle?: string;
}

export function ImageModal({
  isOpen,
  onClose,
  imageUrl,
  mediaType = 'image',
  title,
  subtitle,
}: ImageModalProps) {
  const [modalMode, setModalMode] = useState<'lens' | 'pan'>('lens');
  const [lupaScale, setLupaScale] = useState<number>(5.0); // 5.0x padrão forense
  const [lensDiameter, setLensDiameter] = useState<number>(340); // Diâmetro ampliado da lente no modal (padrão 340px)
  const [isLupaActive, setIsLupaActive] = useState<boolean>(true);
  const [hdLoaded, setHdLoaded] = useState<boolean>(false);

  // Posição da lente com matemática óptica absoluta em pixels
  const [lensState, setLensState] = useState<{
    visible: boolean;
    x: number;
    y: number;
    bgWidth: number;
    bgHeight: number;
    bgPosX: number;
    bgPosY: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    bgWidth: 0,
    bgHeight: 0,
    bgPosX: 0,
    bgPosY: 0,
  });

  // Pan & Drag state para modo Mesa de Luz
  const [panState, setPanState] = useState<{
    zoom: number;
    panX: number;
    panY: number;
    isDragging: boolean;
    startX: number;
    startY: number;
  }>({
    zoom: 1,
    panX: 0,
    panY: 0,
    isDragging: false,
    startX: 0,
    startY: 0,
  });

  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const isVideo =
    mediaType === 'video' ||
    (Boolean(imageUrl) &&
      (imageUrl.startsWith('data:video') ||
        imageUrl.endsWith('.mp4') ||
        imageUrl.endsWith('.webm')));

  // Carregamento sob demanda: pré-carrega o buffer HD assim que o modal abre
  useEffect(() => {
    if (isOpen && imageUrl && !isVideo) {
      setHdLoaded(false);
      preloadHdImage(imageUrl).then(() => setHdLoaded(true));
    }
  }, [isOpen, imageUrl, isVideo]);

  if (!isOpen) return null;

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isVideo || !isLupaActive) return;

    if (modalMode === 'pan') {
      if (panState.isDragging) {
        setPanState((prev) => ({
          ...prev,
          panX: prev.panX + (e.clientX - prev.startX),
          panY: prev.panY + (e.clientY - prev.startY),
          startX: e.clientX,
          startY: e.clientY,
        }));
      }
      return;
    }

    if (!imgRef.current) return;

    const imgRect = imgRef.current.getBoundingClientRect();
    const containerRect = containerRef.current.getBoundingClientRect();

    const xInImg = e.clientX - imgRect.left;
    const yInImg = e.clientY - imgRect.top;

    // Se o cursor estiver fora da foto (nas faixas pretas de padding), esconde a lente
    if (xInImg < 0 || yInImg < 0 || xInImg > imgRect.width || yInImg > imgRect.height) {
      setLensState((prev) => ({ ...prev, visible: false }));
      return;
    }

    const lensRadius = lensDiameter / 2; // Diâmetro proporcional configurável

    const lensX = e.clientX - containerRect.left;
    const lensY = e.clientY - containerRect.top;

    const bgWidth = imgRect.width * lupaScale;
    const bgHeight = imgRect.height * lupaScale;

    // Cálculo óptico absoluto: o pixel exato sob a mira fica 100% no meio da lente
    const bgPosX = -(xInImg * lupaScale - lensRadius);
    const bgPosY = -(yInImg * lupaScale - lensRadius);

    setLensState({
      visible: true,
      x: lensX,
      y: lensY,
      bgWidth,
      bgHeight,
      bgPosX,
      bgPosY,
    });
  };

  const handleWheel = (e: WheelEvent<HTMLDivElement>) => {
    if (isVideo || !isLupaActive) return;
    e.preventDefault();

    // Shift + Scroll: redimensiona o diâmetro da lente da lupa em tempo real (200px a 580px)
    if (e.shiftKey && modalMode === 'lens') {
      const deltaSize = e.deltaY < 0 ? 30 : -30;
      setLensDiameter((prev) => Math.min(580, Math.max(200, prev + deltaSize)));
      return;
    }

    const delta = e.deltaY < 0 ? 0.5 : -0.5;

    if (modalMode === 'pan') {
      setPanState((prev) => ({
        ...prev,
        zoom: Math.min(12, Math.max(1, Number((prev.zoom + delta * 0.8).toFixed(1)))),
      }));
    } else {
      setLupaScale((prev) => Math.min(10, Math.max(1.5, Number((prev + delta).toFixed(1)))));
    }
  };

  const handleMouseLeave = () => {
    setLensState((prev) => ({ ...prev, visible: false }));
    if (panState.isDragging) {
      setPanState((prev) => ({ ...prev, isDragging: false }));
    }
  };

  const handleFocusSignature = () => {
    setLupaScale(8.0);
    setIsLupaActive(true);
    setModalMode('lens');
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08090B]/95 backdrop-blur-md p-2 sm:p-4 md:p-6 animate-fadeIn">
      {/* Modal ocupando 88% do viewport da tela do usuário */}
      <div className="bg-[#12151B] border border-[#f2ca50]/60 rounded-xl w-[88vw] max-w-7xl h-[88vh] max-h-[88vh] flex flex-col shadow-[0_0_60px_rgba(0,0,0,0.95)] overflow-hidden">
        {/* Modal Header */}
        <div className="flex flex-wrap items-center justify-between px-5 py-3 bg-[#1A1E26] border-b border-[#282E3A] gap-3">
          <div className="flex items-center gap-3">
            <span
              className="material-symbols-outlined text-[#f2ca50] text-2xl"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {isVideo ? 'videocam' : 'biotech'}
            </span>
            <div>
              <h3 className="text-sm sm:text-base font-bold text-[#F4F1EA] font-['Playfair_Display'] tracking-wide">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-[#9CA3AF] font-['Space_Grotesk']">
                  {subtitle}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {!isVideo && (
              <>
                {/* Botão de Destaque: Foco na Assinatura (8x) */}
                <button
                  onClick={handleFocusSignature}
                  className="px-3 py-1.5 rounded text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1.5 bg-gradient-to-r from-[#C59B27] to-[#f2ca50] text-[#08090B] shadow-[0_0_15px_rgba(242,202,80,0.35)] hover:brightness-110 transition-all"
                  title="Focar imediatamente no autógrafo original com ultra-zoom pericial de 8x"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  <span>Foco na Assinatura (8x)</span>
                </button>

                {/* Alternância de Modo: Lente vs Mesa de Luz */}
                <div className="flex items-center bg-[#08090B] border border-[#282E3A] rounded overflow-hidden text-xs font-['Space_Grotesk']">
                  <button
                    onClick={() => {
                      setIsLupaActive(true);
                      setModalMode('lens');
                    }}
                    className={`px-2.5 py-1 flex items-center gap-1 transition-colors ${
                      isLupaActive && modalMode === 'lens'
                        ? 'bg-[#f2ca50] text-[#08090B] font-bold'
                        : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
                    }`}
                    title={`Lente óptica ampliada (${lensDiameter}px) com rastreamento milimétrico do mouse`}
                  >
                    <span className="material-symbols-outlined text-xs">adjust</span>
                    <span>Lente {lensDiameter}px</span>
                  </button>
                  <button
                    onClick={() => {
                      setIsLupaActive(true);
                      setModalMode('pan');
                    }}
                    className={`px-2.5 py-1 flex items-center gap-1 transition-colors ${
                      isLupaActive && modalMode === 'pan'
                        ? 'bg-[#f2ca50] text-[#08090B] font-bold'
                        : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
                    }`}
                    title="Mesa de Luz com arraste livre e zoom por roda do mouse"
                  >
                    <span className="material-symbols-outlined text-xs">pan_tool</span>
                    <span>Mesa de Luz</span>
                  </button>
                </div>

                {/* Seletor de Tamanho da Lente no Modal */}
                {isLupaActive && modalMode === 'lens' && (
                  <div className="flex items-center bg-[#12151B] border border-[#282E3A] rounded overflow-hidden text-xs font-['Space_Grotesk']">
                    <span className="px-2 py-1 text-[10px] text-[#9CA3AF] uppercase bg-[#08090B] font-semibold">Tamanho:</span>
                    {[
                      { size: 240, label: '240px' },
                      { size: 340, label: '340px' },
                      { size: 440, label: '440px' },
                      { size: 540, label: '540px Max' },
                    ].map((item) => (
                      <button
                        key={item.size}
                        onClick={() => setLensDiameter(item.size)}
                        className={`px-2 py-1 transition-colors ${
                          lensDiameter === item.size
                            ? 'bg-[#f2ca50] text-[#08090B] font-bold shadow-sm'
                            : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
                        }`}
                        title={`Ajustar diâmetro da lupa para ${item.size}px (ou segure Shift + gire a roda do mouse)`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}

                {/* Seleção do Nível da Lupa (2x a 10x - Até 1000%) */}
                {isLupaActive && (
                  <div className="flex items-center bg-[#12151B] border border-[#282E3A] rounded overflow-hidden text-xs font-['Space_Grotesk']">
                    {[
                      { scale: 2.0, label: '2x' },
                      { scale: 3.5, label: '3.5x' },
                      { scale: 5.0, label: '5x' },
                      { scale: 8.0, label: '8x' },
                      { scale: 10.0, label: '10x Ultra' },
                    ].map((opt) => (
                      <button
                        key={opt.scale}
                        onClick={() => {
                          setLupaScale(opt.scale);
                          if (modalMode === 'pan') {
                            setPanState((p) => ({ ...p, zoom: opt.scale }));
                          }
                        }}
                        className={`px-2.5 py-1 transition-colors ${
                          lupaScale === opt.scale
                            ? 'bg-[#f2ca50] text-[#08090B] font-bold shadow-sm'
                            : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
                        }`}
                        title={`Nível de zoom: ${opt.scale}x (${Math.round(opt.scale * 100)}%)`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}

            <button
              onClick={onClose}
              className="w-8 h-8 rounded bg-[#12151B] hover:bg-[#282a2d] border border-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA] flex items-center justify-center transition-colors ml-1"
              title="Fechar Visualizador"
            >
              <span className="material-symbols-outlined text-base">close</span>
            </button>
          </div>
        </div>

        {/* Modal Body / Large Viewport */}
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          onWheel={handleWheel}
          className="flex-1 overflow-hidden p-4 sm:p-6 flex items-center justify-center bg-[#08090B] relative min-h-[420px] max-h-[78vh] select-none"
        >
          {isVideo ? (
            <video
              src={imageUrl}
              controls
              autoPlay
              className="max-h-[72vh] w-auto max-w-full object-contain rounded-lg shadow-2xl"
            />
          ) : modalMode === 'pan' ? (
            /* MODO MESA DE LUZ: PAN & DRAG NO MODAL */
            <div
              className="w-full h-full flex items-center justify-center cursor-grab active:cursor-grabbing relative overflow-hidden"
              onMouseDown={(e) => {
                setPanState((prev) => ({
                  ...prev,
                  isDragging: true,
                  startX: e.clientX,
                  startY: e.clientY,
                }));
              }}
              onMouseUp={() => setPanState((prev) => ({ ...prev, isDragging: false }))}
            >
              <img
                ref={imgRef}
                src={imageUrl}
                alt={title}
                style={{
                  transform: `translate(${panState.panX}px, ${panState.panY}px) scale(${panState.zoom})`,
                  transition: panState.isDragging ? 'none' : 'transform 0.1s ease-out',
                }}
                className="max-h-[72vh] w-auto max-w-full object-contain select-none pointer-events-none"
              />

              {/* Controles Flutuantes da Mesa de Luz */}
              <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-[#08090B]/90 border border-[#282E3A] p-1.5 rounded-lg backdrop-blur-md z-30 shadow-2xl">
                <button
                  onClick={() => setPanState((p) => ({ ...p, zoom: Math.max(1, p.zoom - 1) }))}
                  className="w-6 h-6 flex items-center justify-center rounded bg-[#12151B] text-[#9CA3AF] hover:text-[#f2ca50] transition-colors"
                  title="Reduzir Zoom (-)"
                >
                  <span className="material-symbols-outlined text-sm">remove</span>
                </button>
                <span className="text-xs font-['Space_Grotesk'] text-[#f2ca50] font-bold px-1 min-w-[40px] text-center">
                  {panState.zoom.toFixed(1)}x
                </span>
                <button
                  onClick={() => setPanState((p) => ({ ...p, zoom: Math.min(12, p.zoom + 1) }))}
                  className="w-6 h-6 flex items-center justify-center rounded bg-[#12151B] text-[#9CA3AF] hover:text-[#f2ca50] transition-colors"
                  title="Aumentar Zoom (+)"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                </button>
                <button
                  onClick={() => setPanState({ zoom: 1, panX: 0, panY: 0, isDragging: false, startX: 0, startY: 0 })}
                  className="px-2 py-0.5 rounded bg-[#12151B] text-[#9CA3AF] hover:text-[#F4F1EA] text-[10px] font-['Space_Grotesk'] border-l border-[#282E3A] ml-1 transition-colors"
                  title="Restaurar Posição e Zoom Inicial (1x)"
                >
                  Reset
                </button>
              </div>

              <div className="absolute top-3 left-3 bg-[#08090B]/85 border border-[#282E3A] px-2.5 py-1 rounded text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] backdrop-blur-sm pointer-events-none">
                🖐️ Clique e arraste para explorar • Gire a roda do mouse para ampliar até 12x
              </div>
            </div>
          ) : (
            /* MODO NORMAL: FOTO BASE COM LUPA ÓPTICA PIXEL-EXACT */
            <div className="relative flex items-center justify-center max-w-full max-h-full cursor-crosshair">
              <img
                ref={imgRef}
                src={imageUrl}
                alt={title}
                className="max-h-[72vh] w-auto max-w-full object-contain select-none pointer-events-none"
              />

              {/* Lupa Magnifier Lens com Matemática Óptica em Pixels */}
              {isLupaActive && lensState.visible && (
                <div
                  className="absolute pointer-events-none rounded-full border-2 border-[#f2ca50] shadow-[0_0_50px_rgba(0,0,0,0.95),0_0_25px_rgba(242,202,80,0.6)] z-40 overflow-hidden"
                  style={{
                    width: lensDiameter,
                    height: lensDiameter,
                    left: lensState.x - lensDiameter / 2,
                    top: lensState.y - lensDiameter / 2,
                    backgroundImage: `url(${imageUrl})`,
                    backgroundSize: `${lensState.bgWidth}px ${lensState.bgHeight}px`,
                    backgroundPosition: `${lensState.bgPosX}px ${lensState.bgPosY}px`,
                    backgroundRepeat: 'no-repeat',
                  }}
                >
                  {/* Mira Reticular Centralizada */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full border border-[#f2ca50]/50 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-[#f2ca50] shadow" />
                    </div>
                    <div className="absolute w-full h-[1px] bg-[#f2ca50]/20 pointer-events-none" />
                    <div className="absolute h-full w-[1px] bg-[#f2ca50]/20 pointer-events-none" />
                  </div>
                  {/* Badge de ampliação no topo da lente */}
                  <div className="absolute bottom-2.5 inset-x-0 text-center">
                    <span className="bg-[#08090B]/90 border border-[#f2ca50]/70 text-[#f2ca50] text-[10px] font-['Space_Grotesk'] font-bold px-2.5 py-0.5 rounded shadow">
                      LUPA {lupaScale.toFixed(1)}X • ⌀{lensDiameter}px
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Dica de uso da lupa na base do viewport */}
          {!isVideo && (
            <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] pointer-events-none">
              <span className="bg-[#08090B]/85 border border-[#282E3A] px-2.5 py-1 rounded backdrop-blur-sm">
                🔍 {isLupaActive ? 'Passe o cursor sobre a peça • Use a roda do mouse para zoom ou Shift + Roda para redimensionar a lupa' : 'Lupa pausada'}
              </span>
              <span className="bg-[#08090B]/85 border border-[#282E3A] px-2.5 py-1 rounded backdrop-blur-sm text-[#10B981] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Alta Resolução 2400px • 100% Autêntico
              </span>
            </div>
          )}
        </div>

        {/* Modal Clean Minimal Footer */}
        <div className="px-5 py-2.5 bg-[#1A1E26] border-t border-[#282E3A] flex items-center justify-between text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[#C59B27] text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified
            </span>
            <span className="text-[#F4F1EA] text-[11px] font-medium">
              Diamond Relics • Visualização Forense de Relíquias Esportivas em Ultra-Resolução (Zoom até 10x)
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-bold text-xs uppercase rounded transition-colors"
            >
              Concluir Visualização
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
