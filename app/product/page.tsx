'use client';

import { useState, useEffect, useRef, MouseEvent, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { RelayBar } from '@/components/RelayBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ImageModal } from '@/components/ImageModal';
import { RELIC_IMAGES, RelicItem, CATALOG_RELICS } from '@/lib/relics-data';
import { getStoredProducts } from '@/lib/products-store';
import { getStoredSiteConfig, DEFAULT_SITE_CONFIG, SiteConfig } from '@/lib/site-config-store';
import { preloadHdImage } from '@/lib/media-helper';

function ProductContent() {
  const searchParams = useSearchParams();
  const currentId = searchParams.get('id');

  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [products, setProducts] = useState<RelicItem[]>(CATALOG_RELICS);
  const [activeTab, setActiveTab] = useState<'provenance' | 'specs' | 'shipping'>('provenance');

  // Sistema de Ultra-Zoom Forense (1.5x a 10.0x / até 1000% para perícia da assinatura)
  const [zoomScale, setZoomScale] = useState<number>(3.5);
  const [lupaMode, setLupaMode] = useState<'lens' | 'flyout' | 'pan'>('lens');
  const [lensDiameter, setLensDiameter] = useState<number>(300); // Diâmetro ampliado da lupa (padrão 300px, ajustável até 460px)
  const [hdReady, setHdReady] = useState<boolean>(false);
  const [lightFilter, setLightFilter] = useState<'normal' | 'uv' | 'raking'>('normal');

  // Lupa interativa no palco principal com cálculo óptico em pixels reais
  const [isStageLupaActive, setIsStageLupaActive] = useState<boolean>(true);
  const [stageLensPos, setStageLensPos] = useState<{
    visible: boolean;
    x: number;
    y: number;
    bgWidth: number;
    bgHeight: number;
    bgPosX: number;
    bgPosY: number;
    flyoutBgPosX: number;
    flyoutBgPosY: number;
    xInImg: number;
    yInImg: number;
    imgWidth: number;
    imgHeight: number;
  }>({
    visible: false,
    x: 0,
    y: 0,
    bgWidth: 0,
    bgHeight: 0,
    bgPosX: 0,
    bgPosY: 0,
    flyoutBgPosX: 0,
    flyoutBgPosY: 0,
    xInImg: 0,
    yInImg: 0,
    imgWidth: 0,
    imgHeight: 0,
  });

  // Modo Mesa de Luz (Pan & Drag + Wheel Zoom de 1x a 12x)
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

  const stageContainerRef = useRef<HTMLDivElement>(null);
  const stageImgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setProducts(getStoredProducts());
    setConfig(getStoredSiteConfig());

    const handleProductsUpdate = () => setProducts(getStoredProducts());
    const handleConfigUpdate = () => setConfig(getStoredSiteConfig());

    window.addEventListener('diamond_products_updated', handleProductsUpdate);
    window.addEventListener('diamond_config_updated', handleConfigUpdate);

    return () => {
      window.removeEventListener('diamond_products_updated', handleProductsUpdate);
      window.removeEventListener('diamond_config_updated', handleConfigUpdate);
    };
  }, []);

  // Selecionar o item clicado (?id=...) ou a peça em destaque
  const product =
    (currentId ? products.find((p) => p.id === currentId) : null) ||
    products.find((p) => p.featured) ||
    products[0] ||
    CATALOG_RELICS[0];
  const isSold = product.status === 'sold';

  interface DisplayMedia {
    id: string;
    type: 'image' | 'video';
    label: string;
    badge: string;
    url: string;
    desc: string;
  }

  const fallbackAngles: DisplayMedia[] = [
    {
      id: 'macro',
      type: 'image',
      label: 'Foco Macro #10',
      badge: 'MACRO 8K',
      url: RELIC_IMAGES.peleProductMacro,
      desc: 'Detalhe macro do número 10 e assinatura do Rei Pelé',
    },
    {
      id: 'front',
      type: 'image',
      label: 'Frente Canarinho #10',
      badge: 'VISTA TOTAL',
      url: product.imageUrl || RELIC_IMAGES.peleProductFullFront,
      desc: 'Visão panorâmica da camisa do Tricampeonato Mundial de 1970',
    },
    {
      id: 'signature',
      type: 'image',
      label: 'Autógrafo Caligráfico',
      badge: 'ASSINATURA',
      url: RELIC_IMAGES.peleProductSignature,
      desc: 'Varredura óptica do traço original em tinta nankin caligráfica',
    },
    {
      id: 'weave',
      type: 'image',
      label: 'Trama & Etiqueta 1970',
      badge: 'ETIQUETA',
      url: RELIC_IMAGES.peleProductFabricWeave,
      desc: 'Trama de algodão puro Athleta com densidade 180g/m²',
    },
    {
      id: 'coa',
      type: 'image',
      label: 'Lacre Físico COA-9801',
      badge: 'COA OFICIAL',
      url: RELIC_IMAGES.peleProductCoaDoc,
      desc: 'Certificado físico notarial com lacre inviolável e selo dourado',
    },
  ];

  const galleryItems: DisplayMedia[] =
    product.gallery && product.gallery.length > 0
      ? product.gallery.map((m, idx) => ({
          id: m.id || `g-${idx}`,
          type: m.type || 'image',
          label: m.title || (m.type === 'video' ? `Vídeo Oficial #${idx + 1}` : `Foto Detalhada #${idx + 1}`),
          badge: m.type === 'video' ? 'VÍDEO HD' : idx === 0 ? 'CAPA' : `FOTO #${idx + 1}`,
          url: m.url,
          desc: m.title || `Exibição de mídia #${idx + 1} da peça histórica`,
        }))
      : product.id === 'pel-1970'
      ? fallbackAngles
      : [
          {
            id: 'cover',
            type: 'image' as const,
            label: product.title,
            badge: 'FOTO OFICIAL',
            url: product.imageUrl,
            desc: product.title,
          },
        ];

  const [activeMedia, setActiveMedia] = useState<DisplayMedia | null>(null);

  const currentMedia: DisplayMedia =
    activeMedia ||
    galleryItems[0] ||
    fallbackAngles[0] || {
      id: 'fallback',
      type: 'image' as const,
      label: product?.title || 'Relíquia Esportiva',
      badge: 'FOTO OFICIAL',
      url: product?.imageUrl || RELIC_IMAGES.peleProductFullFront,
      desc: product?.title || 'Exibição da peça histórica',
    };

  useEffect(() => {
    if (galleryItems.length > 0) {
      setActiveMedia(galleryItems[0]);
    }
    setHdReady(false);
  }, [product]);

  // Carregamento sob demanda: dispara o buffer HD no primeiro hover do usuário
  const handleStageMouseEnter = () => {
    if (currentMedia?.url && currentMedia.type !== 'video' && !hdReady) {
      preloadHdImage(currentMedia.url).then(() => setHdReady(true));
    }
  };

  // Cálculo Óptico de Precisão Absoluta em Pixels (elimina 100% de desalinhamento de letterbox)
  const handleStageMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!stageContainerRef.current || !stageImgRef.current || currentMedia?.type === 'video' || !isStageLupaActive) return;

    // Se estiver no modo Mesa de Luz e arrastando
    if (lupaMode === 'pan') {
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

    const imgRect = stageImgRef.current.getBoundingClientRect();
    const stageRect = stageContainerRef.current.getBoundingClientRect();

    // Ponto relativo estritamente aos pixels reais renderizados da imagem
    const xInImg = e.clientX - imgRect.left;
    const yInImg = e.clientY - imgRect.top;

    // Se o cursor estiver fora da foto (nas barras pretas de padding), esconde a lente
    if (xInImg < 0 || yInImg < 0 || xInImg > imgRect.width || yInImg > imgRect.height) {
      setStageLensPos((prev) => ({ ...prev, visible: false }));
      return;
    }

    const lensRadius = lensDiameter / 2; // Diâmetro configurável (raio proporcional)
    const flyoutRadius = 260; // Janela Flyout de 520px (raio = 260px)

    const lensX = e.clientX - stageRect.left;
    const lensY = e.clientY - stageRect.top;

    const bgWidth = imgRect.width * zoomScale;
    const bgHeight = imgRect.height * zoomScale;

    // Fórmula óptica absoluta: o pixel exato sob a mira fica 100% centralizado no meio da lente
    const bgPosX = -(xInImg * zoomScale - lensRadius);
    const bgPosY = -(yInImg * zoomScale - lensRadius);

    const flyoutBgPosX = -(xInImg * zoomScale - flyoutRadius);
    const flyoutBgPosY = -(yInImg * zoomScale - flyoutRadius);

    setStageLensPos({
      visible: true,
      x: lensX,
      y: lensY,
      bgWidth,
      bgHeight,
      bgPosX,
      bgPosY,
      flyoutBgPosX,
      flyoutBgPosY,
      xInImg,
      yInImg,
      imgWidth: imgRect.width,
      imgHeight: imgRect.height,
    });
  };

  const handleStageWheel = (e: React.WheelEvent<HTMLDivElement>) => {
    if (currentMedia?.type === 'video' || !isStageLupaActive) return;
    e.preventDefault();

    // Shift + Scroll: redimensiona o diâmetro da lente da lupa em tempo real (180px a 480px)
    if (e.shiftKey && lupaMode === 'lens') {
      const deltaSize = e.deltaY < 0 ? 30 : -30;
      setLensDiameter((prev) => Math.min(480, Math.max(180, prev + deltaSize)));
      return;
    }

    const delta = e.deltaY < 0 ? 0.5 : -0.5;

    if (lupaMode === 'pan') {
      setPanState((prev) => ({
        ...prev,
        zoom: Math.min(12, Math.max(1, Number((prev.zoom + delta * 0.8).toFixed(1)))),
      }));
    } else {
      setZoomScale((prev) => Math.min(10, Math.max(1.5, Number((prev + delta).toFixed(1)))));
    }
  };

  const handleStageMouseLeave = () => {
    setStageLensPos((prev) => ({ ...prev, visible: false }));
    if (panState.isDragging) {
      setPanState((prev) => ({ ...prev, isDragging: false }));
    }
  };

  // Botão Pericial: Foco Instantâneo na Assinatura com Zoom 8x
  const handleFocusSignature = () => {
    const sigMedia = galleryItems.find(
      (m) =>
        m.label.toLowerCase().includes('assinatura') ||
        m.label.toLowerCase().includes('autógrafo') ||
        m.id.includes('signature') ||
        m.id.includes('macro')
    );
    if (sigMedia) {
      setActiveMedia(sigMedia);
    }
    setZoomScale(8.0);
    setIsStageLupaActive(true);
    setLupaMode('lens');
    setPanState((prev) => ({ ...prev, zoom: 6 }));
  };

  const [downloadingReport, setDownloadingReport] = useState(false);
  const [reportDownloaded, setReportDownloaded] = useState(false);
  const [showConcierge, setShowConcierge] = useState(false);
  const [cartAddedToast, setCartAddedToast] = useState(false);
  const [cep, setCep] = useState('');
  const [freightResult, setFreightResult] = useState<string | null>(null);

  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    mediaType?: 'image' | 'video';
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    mediaType: 'image',
    title: '',
    subtitle: '',
  });

  const handleDownloadPdf = () => {
    setDownloadingReport(true);
    setTimeout(() => {
      setDownloadingReport(false);
      setReportDownloaded(true);
      setTimeout(() => setReportDownloaded(false), 4000);
    }, 1500);
  };

  const handleAddToCart = () => {
    if (isSold) return;
    setCartAddedToast(true);
    setTimeout(() => setCartAddedToast(false), 3500);
  };

  const handleCalcFreight = (e: React.FormEvent) => {
    e.preventDefault();
    if (cep.length >= 8) {
      setFreightResult(
        config.productFreightResultText ||
          "Transporte Especializado: Grátis (Prazo estimado: 2 a 4 dias úteis com seguro total Lloyd's)"
      );
    } else {
      setFreightResult(
        config.productFreightInvalidText || 'Por favor, digite um CEP válido com 8 dígitos.'
      );
    }
  };

  const rawConciergePhone = (config.productConciergePhone || config.contactPhone || '5511998421970').replace(/\D/g, '');
  const whatsappPhone =
    rawConciergePhone.length <= 11 && !rawConciergePhone.startsWith('55')
      ? `55${rawConciergePhone}`
      : rawConciergePhone;
  const conciergeWhatsappUrl = `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(
    config.productConciergeWhatsappMessage ||
      `Olá! Gostaria de atendimento VIP sobre a peça "${product?.title || 'Item do Acervo'}" na Diamond Relics.`
  )}`;

  const openImage = (
    imageUrl: string,
    title: string,
    subtitle?: string,
    mediaType: 'image' | 'video' = 'image'
  ) => {
    setModalData({
      isOpen: true,
      imageUrl,
      mediaType,
      title,
      subtitle,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B] text-[#e2e2e6] selection:bg-[#d4af37] selection:text-[#08090B]">
      {/* 1. Global Navigation Relay Bar */}
      <RelayBar />

      {/* Main Top Institutional Nav Bar */}
      <Navbar cartCount={cartAddedToast ? 2 : 1} />

      {/* Breadcrumb de Navegação */}
      <nav className="w-full bg-[#12151B] border-b border-[#282E3A] px-4 sm:px-6 py-2.5 text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
        <div className="max-w-7xl mx-auto flex items-center gap-2">
          <Link href="/" className="hover:text-[#f2ca50] transition-colors">
            Início
          </Link>
          <span>/</span>
          <Link href="/catalog" className="hover:text-[#f2ca50] transition-colors">
            Catálogo de Relíquias
          </Link>
          <span>/</span>
          <span className="text-[#F4F1EA] truncate">
            {product.title}
          </span>
        </div>
      </nav>

      {/* Notificação Toast de Adicionado ao Carrinho */}
      {cartAddedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#1A1E26] border border-[#10B981] text-[#F4F1EA] px-5 py-4 rounded-lg shadow-2xl flex items-center gap-3 animate-fadeIn">
          <span className="material-symbols-outlined text-[#10B981] text-2xl">check_circle</span>
          <div>
            <p className="font-bold text-xs font-['Space_Grotesk']">Produto Adicionado ao Carrinho!</p>
            <p className="text-[11px] text-[#9CA3AF]">{product.title} reservada com sucesso.</p>
          </div>
          <Link
            href="/checkout"
            className="ml-3 px-3 py-1.5 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] text-xs font-bold font-['Space_Grotesk'] rounded"
          >
            Finalizar Compra
          </Link>
        </div>
      )}

      {/* Alerta de Produto Vendido */}
      {isSold && (
        <div className="w-full bg-red-950/80 border-b border-red-500/60 py-3 px-4 text-center">
          <p className="text-xs sm:text-sm font-['Space_Grotesk'] text-red-300 font-bold flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-base">lock</span>
            ESTA PEÇA HISTÓRICA JÁ FOI VENDIDA E NÃO ESTÁ MAIS DISPONÍVEL PARA AQUISIÇÃO.
          </p>
        </div>
      )}

      {/* Main Product Layout */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left Column: Visual Spectrometry & Inspection System */}
          <section className="lg:col-span-7 space-y-5">
            {/* Visualizer Frame */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg overflow-hidden shadow-2xl relative">
              {/* Top Viewport Header com Suíte Forense Completa */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-[#1A1E26] border-b border-[#282E3A] gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                  <span className="text-xs font-['Space_Grotesk'] font-bold text-[#F4F1EA] tracking-wide uppercase">
                    Microscópio Forense 10K
                  </span>
                  <span className="hidden lg:inline-flex items-center gap-1 text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] bg-[#08090B] px-2 py-0.5 rounded border border-[#282E3A]">
                    <span className={`w-1.5 h-1.5 rounded-full ${hdReady ? 'bg-[#10B981]' : 'bg-[#f2ca50]'}`} />
                    {hdReady ? 'HD 2400px Carregado' : 'Carregamento sob Demanda'}
                  </span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {/* Botão de Destaque Pericial: Foco na Assinatura */}
                  <button
                    onClick={handleFocusSignature}
                    className="px-3 py-1.5 rounded text-xs font-['Space_Grotesk'] font-bold flex items-center gap-1.5 bg-gradient-to-r from-[#C59B27] to-[#f2ca50] text-[#08090B] shadow-[0_0_15px_rgba(242,202,80,0.35)] hover:brightness-110 transition-all"
                    title="Focar imediatamente no autógrafo original com zoom de alta precisão 8x"
                  >
                    <span className="material-symbols-outlined text-sm">edit</span>
                    <span>Foco na Assinatura (8x)</span>
                  </button>

                  {/* Seletor de Modo da Lupa */}
                  {currentMedia.type !== 'video' && (
                    <div className="flex items-center bg-[#08090B] border border-[#282E3A] rounded overflow-hidden text-[11px] font-['Space_Grotesk']">
                      <button
                        onClick={() => {
                          setIsStageLupaActive(true);
                          setLupaMode('lens');
                        }}
                        className={`px-2.5 py-1 flex items-center gap-1 transition-colors ${
                          isStageLupaActive && lupaMode === 'lens'
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
                          setIsStageLupaActive(true);
                          setLupaMode('flyout');
                        }}
                        className={`px-2.5 py-1 hidden md:flex items-center gap-1 transition-colors ${
                          isStageLupaActive && lupaMode === 'flyout'
                            ? 'bg-[#f2ca50] text-[#08090B] font-bold'
                            : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
                        }`}
                        title="Janela lateral Flyout de 520px com inspeção ultra-HD"
                      >
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                        <span>Flyout 520px</span>
                      </button>
                      <button
                        onClick={() => {
                          setIsStageLupaActive(true);
                          setLupaMode('pan');
                        }}
                        className={`px-2.5 py-1 flex items-center gap-1 transition-colors ${
                          isStageLupaActive && lupaMode === 'pan'
                            ? 'bg-[#f2ca50] text-[#08090B] font-bold'
                            : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
                        }`}
                        title="Mesa de Luz com scroll do mouse e clique/arraste para explorar"
                      >
                        <span className="material-symbols-outlined text-xs">pan_tool</span>
                        <span>Mesa de Luz</span>
                      </button>
                    </div>
                  )}

                  <button
                    onClick={() =>
                      openImage(currentMedia.url, currentMedia.label, currentMedia.desc, currentMedia.type)
                    }
                    className="p-1.5 bg-[#08090B] hover:bg-[#f2ca50] hover:text-[#08090B] text-[#F4F1EA] rounded border border-[#282E3A] text-xs transition-colors flex items-center gap-1"
                    title="Expandir Mídia em Tela Cheia (88% do Viewport)"
                  >
                    <span className="material-symbols-outlined text-base">fullscreen</span>
                  </button>
                </div>
              </div>

              {/* Barra Secundária de Níveis de Zoom (Até 10x / 1000%) e Diâmetro da Lente */}
              {currentMedia.type !== 'video' && (
                <div className="px-4 py-2 bg-[#12151B] border-b border-[#282E3A] flex flex-wrap items-center justify-between gap-3 text-xs font-['Space_Grotesk']">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[11px] text-[#9CA3AF] uppercase font-semibold">Nível de Zoom:</span>
                    <div className="flex items-center bg-[#08090B] border border-[#282E3A] rounded overflow-hidden">
                      {[
                        { val: 2.0, label: '2x' },
                        { val: 3.5, label: '3.5x' },
                        { val: 5.0, label: '5x' },
                        { val: 8.0, label: '8x (Perícia)' },
                        { val: 10.0, label: '10x (Ultra-Macro)' },
                      ].map((item) => (
                        <button
                          key={item.val}
                          onClick={() => {
                            setZoomScale(item.val);
                            if (lupaMode === 'pan') {
                              setPanState((p) => ({ ...p, zoom: item.val }));
                            }
                          }}
                          className={`px-2 py-1 transition-colors ${
                            zoomScale === item.val
                              ? 'bg-[#f2ca50] text-[#08090B] font-bold'
                              : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
                          }`}
                          title={`Ampliação de ${item.val}x (${Math.round(item.val * 100)}%)`}
                        >
                          {item.label}
                        </button>
                      ))}
                    </div>

                    {/* Seletor de Tamanho da Lente (Diâmetro) quando em modo Lente */}
                    {lupaMode === 'lens' && isStageLupaActive && (
                      <div className="flex items-center gap-1.5 ml-1 sm:ml-3">
                        <span className="text-[10px] text-[#9CA3AF] uppercase font-semibold">Tamanho da Lente:</span>
                        <div className="flex items-center bg-[#08090B] border border-[#282E3A] rounded overflow-hidden">
                          {[
                            { size: 220, label: 'P (220px)' },
                            { size: 300, label: 'M (300px)' },
                            { size: 380, label: 'G (380px)' },
                            { size: 460, label: 'XL (460px)' },
                          ].map((item) => (
                            <button
                              key={item.size}
                              onClick={() => setLensDiameter(item.size)}
                              className={`px-2 py-1 transition-colors ${
                                lensDiameter === item.size
                                  ? 'bg-[#f2ca50] text-[#08090B] font-bold'
                                  : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
                              }`}
                              title={`Ajustar diâmetro da lente para ${item.size}px (ou segure Shift + gire a roda do mouse)`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Slider Contínuo de Zoom (1.5x a 10.0x) */}
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-[#9CA3AF]">Ajuste Fino:</span>
                    <input
                      type="range"
                      min="1.5"
                      max="10.0"
                      step="0.5"
                      value={zoomScale}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        setZoomScale(val);
                        if (lupaMode === 'pan') {
                          setPanState((p) => ({ ...p, zoom: val }));
                        }
                      }}
                      className="w-24 sm:w-32 accent-[#f2ca50] cursor-pointer"
                      title="Deslize para controle contínuo de ampliação"
                    />
                    <span className="text-xs font-bold text-[#f2ca50] w-12 text-right">
                      {zoomScale.toFixed(1)}x
                    </span>
                  </div>
                </div>
              )}

              {/* Main Media Stage com Suporte Óptico em Pixels Reais e Modo Mesa de Luz */}
              <div
                ref={stageContainerRef}
                onMouseEnter={handleStageMouseEnter}
                onMouseMove={handleStageMouseMove}
                onMouseLeave={handleStageMouseLeave}
                onWheel={handleStageWheel}
                className="relative aspect-[4/3] bg-[#08090B] flex items-center justify-center overflow-hidden select-none"
              >
                {currentMedia.type === 'video' ? (
                  <video
                    src={currentMedia.url}
                    controls
                    autoPlay
                    className="max-h-full max-w-full object-contain rounded"
                  />
                ) : lupaMode === 'pan' ? (
                  /* MODO MESA DE LUZ: PAN & DRAG + WHEEL ZOOM (1x a 12x) */
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
                      ref={stageImgRef}
                      src={currentMedia.url}
                      alt={currentMedia.desc}
                      style={{
                        transform: `translate(${panState.panX}px, ${panState.panY}px) scale(${panState.zoom})`,
                        transition: panState.isDragging ? 'none' : 'transform 0.1s ease-out',
                      }}
                      className="max-h-full max-w-full object-contain select-none pointer-events-none"
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
                  /* MODO NORMAL: FOTO BASE COM LUPA ÓPTICA PIXEL-EXACT OU FLYOUT */
                  <div className="w-full h-full flex items-center justify-center relative cursor-crosshair">
                    <img
                      ref={stageImgRef}
                      src={currentMedia.url}
                      alt={currentMedia.desc}
                      className="max-h-full max-w-full object-contain select-none pointer-events-none"
                    />

                    {/* MODO 1: LUPA ÓPTICA MILIMÉTRICA COM TAMANHO EXPANDIDO */}
                    {isStageLupaActive && lupaMode === 'lens' && stageLensPos.visible && (
                      <div
                        className="absolute pointer-events-none rounded-full border-2 border-[#f2ca50] shadow-[0_0_50px_rgba(0,0,0,0.95),0_0_25px_rgba(242,202,80,0.6)] z-40 overflow-hidden"
                        style={{
                          width: lensDiameter,
                          height: lensDiameter,
                          left: stageLensPos.x - lensDiameter / 2,
                          top: stageLensPos.y - lensDiameter / 2,
                          backgroundImage: `url(${currentMedia.url})`,
                          backgroundSize: `${stageLensPos.bgWidth}px ${stageLensPos.bgHeight}px`,
                          backgroundPosition: `${stageLensPos.bgPosX}px ${stageLensPos.bgPosY}px`,
                          backgroundRepeat: 'no-repeat',
                        }}
                      >
                        {/* Mira Reticular Forense no Ponto Central */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-8 h-8 rounded-full border border-[#f2ca50]/50 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 rounded-full bg-[#f2ca50] shadow" />
                          </div>
                          <div className="absolute w-full h-[1px] bg-[#f2ca50]/20 pointer-events-none" />
                          <div className="absolute h-full w-[1px] bg-[#f2ca50]/20 pointer-events-none" />
                        </div>
                        <div className="absolute bottom-2.5 inset-x-0 text-center">
                          <span className="bg-[#08090B]/90 border border-[#f2ca50]/70 text-[#f2ca50] text-[10px] font-['Space_Grotesk'] font-bold px-2.5 py-0.5 rounded shadow">
                            LUPA {zoomScale.toFixed(1)}X • ⌀{lensDiameter}px
                          </span>
                        </div>
                      </div>
                    )}

                    {/* MODO 2: RETÍCULO DELIMITADOR NA FOTO QUANDO EM MODO FLYOUT */}
                    {isStageLupaActive && lupaMode === 'flyout' && stageLensPos.visible && (
                      <div
                        className="absolute pointer-events-none border-2 border-[#f2ca50] bg-[#f2ca50]/15 shadow-[0_0_20px_rgba(242,202,80,0.4)] rounded-md z-30 flex items-center justify-center"
                        style={{
                          width: 140,
                          height: 140,
                          left: Math.max(0, stageLensPos.x - 70),
                          top: Math.max(0, stageLensPos.y - 70),
                        }}
                      >
                        <span className="material-symbols-outlined text-sm text-[#f2ca50]">center_focus_strong</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Overlay Badge */}
                <div className="absolute bottom-3 left-3 bg-[#08090B]/85 border border-[#282E3A] px-3 py-1.5 rounded text-[11px] font-['Space_Grotesk'] text-[#F4F1EA] backdrop-blur-sm flex items-center gap-2 pointer-events-none">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E5C875]"></span>
                  <span>
                    {currentMedia.badge}: {currentMedia.label}
                  </span>
                </div>
              </div>

              {/* MODO 2 FLYOUT: Janela Lateral Flutuante de 520x520px com Cálculo Óptico em Pixels */}
              {isStageLupaActive && lupaMode === 'flyout' && stageLensPos.visible && currentMedia.type !== 'video' && (
                <div className="absolute top-0 -right-[535px] w-[520px] h-[520px] bg-[#08090B] border-2 border-[#f2ca50] rounded-xl shadow-[0_0_50px_rgba(0,0,0,0.95)] overflow-hidden hidden xl:flex flex-col z-50 pointer-events-none animate-fadeIn">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-[#1A1E26] border-b border-[#282E3A]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
                      <span className="text-xs font-['Space_Grotesk'] font-bold text-[#F4F1EA] uppercase tracking-wide">
                        Inspeção Forense Ultra-HD • {zoomScale.toFixed(1)}x ({Math.round(zoomScale * 100)}%)
                      </span>
                    </div>
                    <span className="text-[10px] font-['Space_Grotesk'] text-[#f2ca50] bg-[#f2ca50]/10 border border-[#f2ca50]/30 px-2 py-0.5 rounded font-bold">
                      Pixel-Exact 2400px
                    </span>
                  </div>

                  <div
                    className="flex-1 bg-[#08090B] relative overflow-hidden"
                    style={{
                      backgroundImage: `url(${currentMedia.url})`,
                      backgroundSize: `${stageLensPos.bgWidth}px ${stageLensPos.bgHeight}px`,
                      backgroundPosition: `${stageLensPos.flyoutBgPosX}px ${stageLensPos.flyoutBgPosY}px`,
                      backgroundRepeat: 'no-repeat',
                    }}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-10 h-10 rounded-full border border-[#f2ca50]/40 flex items-center justify-center">
                        <div className="w-2 h-2 rounded-full bg-[#f2ca50] shadow" />
                      </div>
                      <div className="absolute w-full h-[1px] bg-[#f2ca50]/20 pointer-events-none" />
                      <div className="absolute h-full w-[1px] bg-[#f2ca50]/20 pointer-events-none" />
                    </div>
                  </div>
                </div>
              )}

              {/* Media Gallery Thumbnails */}
              <div className="p-4 bg-[#1A1E26] border-t border-[#282E3A] flex items-center gap-3 overflow-x-auto custom-scrollbar">
                {galleryItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveMedia(item)}
                    className={`shrink-0 w-20 h-20 rounded border overflow-hidden relative transition-all ${
                      currentMedia.id === item.id
                        ? 'border-[#f2ca50] shadow-[0_0_10px_rgba(242,202,80,0.3)] ring-1 ring-[#f2ca50]'
                        : 'border-[#282E3A] opacity-65 hover:opacity-100'
                    }`}
                  >
                    {item.type === 'video' ? (
                      <div className="w-full h-full bg-black flex items-center justify-center relative">
                        <video src={item.url} className="w-full h-full object-cover opacity-60" />
                        <span className="material-symbols-outlined text-2xl text-[#f2ca50] absolute">
                          play_circle
                        </span>
                      </div>
                    ) : (
                      <img
                        src={item.url}
                        alt={item.label}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <span className="absolute bottom-0 inset-x-0 bg-[#08090B]/90 text-[9px] font-['Space_Grotesk'] text-center py-0.5 text-[#F4F1EA] truncate px-1">
                      {item.badge}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Certificação & Laudo Forense */}
            {config.showProductCertificateBanner !== false && (
              <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fadeIn">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-[#08090B] border border-[#C59B27] flex items-center justify-center text-[#f2ca50] shrink-0">
                    <span className="material-symbols-outlined text-2xl">verified</span>
                  </div>
                  <div>
                    {config.productCertificateTitle !== undefined ? (
                      config.productCertificateTitle.trim() !== '' && (
                        <h4 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase">
                          {config.productCertificateTitle}
                        </h4>
                      )
                    ) : (
                      <h4 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase">
                        Certificado de Autenticidade Vitalício #COA-9801
                      </h4>
                    )}
                    {config.productCertificateSubtitle !== undefined ? (
                      config.productCertificateSubtitle.trim() !== '' && (
                        <p className="text-[11px] text-[#9CA3AF] font-['Manrope']">
                          {config.productCertificateSubtitle}
                        </p>
                      )
                    ) : (
                      <p className="text-[11px] text-[#9CA3AF] font-['Manrope']">
                        Laudo pericial com espectrometria molecular e correspondência fotográfica do jogo.
                      </p>
                    )}
                  </div>
                </div>

                <button
                  onClick={handleDownloadPdf}
                  disabled={downloadingReport}
                  className="px-4 py-2 bg-[#1A1E26] hover:bg-[#282E3A] border border-[#C59B27] text-[#f2ca50] text-xs font-['Space_Grotesk'] font-semibold rounded flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-base">
                    {downloadingReport ? 'hourglass_top' : reportDownloaded ? 'check' : 'download'}
                  </span>
                  <span>
                    {downloadingReport
                      ? 'Gerando Laudo...'
                      : reportDownloaded
                      ? 'Laudo Baixado!'
                      : (config.productCertificateBtnText || 'Baixar Laudo Oficial (PDF)')}
                  </span>
                </button>
              </div>
            )}
          </section>

          {/* Right Column: Commercial Details, Price & Buying Box */}
          <section className="lg:col-span-5 space-y-6">
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-6 space-y-6">
              {/* Product Header */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  {isSold ? (
                    <span className="px-2.5 py-0.5 bg-red-950/90 border border-red-500 text-red-400 text-[11px] font-['Space_Grotesk'] font-bold rounded uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                      {config.btnSoldOut || 'Peça Vendida'}
                    </span>
                  ) : (
                    <span className="px-2.5 py-0.5 bg-[#08090B] border border-[#10B981] text-[#10B981] text-[11px] font-['Space_Grotesk'] font-bold rounded uppercase flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                      {product?.statusLabel || 'Peça Única • Disponível'}
                    </span>
                  )}
                  <span className="text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                    SKU: {product?.sku || 'SKU-OFICIAL'}
                  </span>
                </div>

                <h1 className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#F4F1EA] leading-tight">
                  {product?.title || 'Relíquia Histórica'}
                </h1>

                <p className="text-xs font-['Manrope'] text-[#9CA3AF] mt-2 leading-relaxed">
                  {product?.description || 'Item histórico autêntico preservado em cofre de alta segurança.'}
                </p>
              </div>

              {/* Price & Installments Box in Reais */}
              <div className="p-5 bg-[#08090B] border border-[#282E3A] rounded-lg space-y-3">
                <div>
                  <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
                    Preço Especial à Vista no PIX (5% OFF)
                  </span>
                  <div className="flex items-baseline gap-3">
                    <span className="text-3xl sm:text-4xl font-['Playfair_Display'] font-bold text-[#f2ca50]">
                      R$ {((Number(product?.priceBRL) || 0) * 0.95).toLocaleString('pt-BR')},00
                    </span>
                    <span className="text-xs font-['Space_Grotesk'] text-[#10B981] font-bold bg-[#10B981]/10 px-2 py-0.5 rounded border border-[#10B981]/30">
                      5% OFF
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-[#282E3A]/60 flex flex-col gap-1">
                  <span className="text-xs font-['Space_Grotesk'] text-[#F4F1EA]">
                    Ou <strong>R$ {(Number(product?.priceBRL) || 0).toLocaleString('pt-BR')},00</strong> em até <strong>12x de R$ {((Number(product?.priceBRL) || 0) / 12).toLocaleString('pt-BR', { maximumFractionDigits: 2 })}</strong> sem juros
                  </span>
                  <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                    Aceitamos cartões de crédito alta renda (Visa Infinite, Mastercard Black, Amex Centurion) e Transferência Bancária / TED.
                  </span>
                </div>
              </div>

              {/* Buy Actions */}
              <div className="space-y-3">
                {isSold ? (
                  <div className="p-4 bg-red-950/40 border border-red-800/60 rounded-lg text-center space-y-2">
                    <span className="material-symbols-outlined text-3xl text-red-400">lock</span>
                    <h4 className="text-xs font-bold text-red-300 font-['Space_Grotesk'] uppercase">
                      Produto Indisponível para Compra
                    </h4>
                    <p className="text-[11px] text-[#9CA3AF]">
                      Esta peça exclusiva já foi adquirida por um colecionador. Navegue pelo catálogo para conhecer outras peças disponíveis.
                    </p>
                    <Link
                      href="/catalog"
                      className="inline-block mt-2 px-4 py-2 bg-[#1A1E26] hover:bg-[#282E3A] border border-[#282E3A] text-xs font-bold text-[#f2ca50] rounded"
                    >
                      Ver Outros Produtos Disponíveis
                    </Link>
                  </div>
                ) : (
                  <>
                    <Link
                      href="/checkout"
                      className="w-full py-4 px-6 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-['Space_Grotesk'] font-bold text-sm uppercase tracking-wider rounded-lg transition-all shadow-[0_0_20px_rgba(242,202,80,0.25)] flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-xl">shopping_cart_checkout</span>
                      {config.btnBuyNow} com Frete Grátis
                    </Link>

                    <button
                      onClick={handleAddToCart}
                      className="w-full py-3 px-6 bg-[#1A1E26] hover:bg-[#282E3A] border border-[#f2ca50]/50 hover:border-[#f2ca50] text-[#F4F1EA] font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-lg transition-all flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-lg text-[#f2ca50]">add_shopping_cart</span>
                      {config.btnAddToCart}
                    </button>
                  </>
                )}
              </div>

              {/* Freight Simulator */}
              {config.showProductFreightSimulator !== false && (
                <div className="pt-4 border-t border-[#282E3A] space-y-2.5">
                  <span className="text-xs font-['Space_Grotesk'] font-bold text-[#F4F1EA] uppercase flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#10B981]">local_shipping</span>
                    {config.productFreightTitle || 'Simulador de Frete e Entrega Segura'}
                  </span>
                  <form onSubmit={handleCalcFreight} className="flex gap-2">
                    <input
                      type="text"
                      maxLength={9}
                      value={cep}
                      onChange={(e) => setCep(e.target.value.replace(/\D/g, ''))}
                      placeholder={config.productFreightPlaceholder || 'Digite seu CEP (ex: 01310-100)'}
                      className="flex-1 bg-[#08090B] border border-[#282E3A] text-xs font-['Space_Grotesk'] text-[#F4F1EA] rounded px-3 py-2 focus:outline-none focus:border-[#f2ca50]"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 bg-[#1A1E26] hover:bg-[#282E3A] border border-[#282E3A] text-xs font-['Space_Grotesk'] font-semibold text-[#F4F1EA] rounded transition-colors"
                    >
                      {config.productFreightBtnText || 'Calcular'}
                    </button>
                  </form>
                  {freightResult && (
                    <p className="text-xs font-['Space_Grotesk'] text-[#10B981] bg-[#10B981]/10 p-2.5 rounded border border-[#10B981]/20">
                      {freightResult}
                    </p>
                  )}
                </div>
              )}

              {/* Trust Badges */}
              {config.showProductTrustBadges !== false && (
                <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                  <div className="p-3 bg-[#08090B] rounded border border-[#282E3A] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f2ca50] text-lg">shield</span>
                    <div>
                      <strong className="text-[#F4F1EA] block text-[11px]">
                        {config.productTrustBadge1Title || 'Seguro Total'}
                      </strong>
                      <span className="text-[10px]">
                        {config.productTrustBadge1Subtitle || "Apólice Lloyd's"}
                      </span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#08090B] rounded border border-[#282E3A] flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#10B981] text-lg">policy</span>
                    <div>
                      <strong className="text-[#F4F1EA] block text-[11px]">
                        {config.productTrustBadge2Title || 'Garantia Vitalícia'}
                      </strong>
                      <span className="text-[10px]">
                        {config.productTrustBadge2Subtitle || 'Autenticidade Forense'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Concierge VIP */}
              {config.showProductConcierge !== false && (
                <div className="p-4 bg-gradient-to-r from-[#1A1E26] to-[#12151B] border border-[#C59B27]/40 rounded-lg flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <span className="material-symbols-outlined text-[#f2ca50]">support_agent</span>
                    <div>
                      <h5 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk']">
                        {config.productConciergeTitle || 'Atendimento VIP & Concierge'}
                      </h5>
                      <p className="text-[11px] text-[#9CA3AF]">
                        {config.productConciergeSubtitle || 'Dúvidas sobre o produto ou agendamento de inspeção presencial.'}
                      </p>
                      {config.showProductConciergePhoneLine !== false && (
                        <span className="text-[10px] text-[#25D366] flex items-center gap-1 mt-0.5 font-['Space_Grotesk']">
                          <span className="material-symbols-outlined text-xs">phone</span>
                          {config.productConciergePhoneLabel || 'WhatsApp:'}{' '}
                          {config.productConciergePhone || config.contactPhone || '+55 (11) 99842-1970'}
                        </span>
                      )}
                    </div>
                  </div>
                  <a
                    href={conciergeWhatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-[#08090B] hover:bg-[#282E3A] border border-[#C59B27] hover:border-[#f2ca50] text-xs font-['Space_Grotesk'] font-bold text-[#f2ca50] rounded transition-all shrink-0 flex items-center gap-1.5 shadow-sm hover:shadow-[0_0_12px_rgba(242,202,80,0.25)]"
                    title={`Abrir conversa no WhatsApp com ${config.productConciergePhone || config.contactPhone || 'o Concierge'}`}
                  >
                    <span>{config.productConciergeBtnText || 'Falar Agora'}</span>
                    <span className="material-symbols-outlined text-sm text-[#25D366]">chat</span>
                  </a>
                </div>
              )}
            </div>

            {/* Product Specifications & Provenance Tabs */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg overflow-hidden">
              <div className="flex border-b border-[#282E3A] bg-[#1A1E26]">
                {[
                  { id: 'provenance', label: 'História & Proveniência' },
                  { id: 'specs', label: 'Ficha Técnica' },
                  { id: 'shipping', label: 'Envio & Garantia' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 py-3 text-xs font-['Space_Grotesk'] font-semibold text-center transition-colors ${
                      activeTab === tab.id
                        ? 'text-[#f2ca50] border-b-2 border-[#f2ca50] bg-[#12151B]'
                        : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              <div className="p-5 text-xs font-['Manrope'] leading-relaxed text-[#9CA3AF]">
                {activeTab === 'provenance' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-[#F4F1EA] font-['Space_Grotesk'] text-sm">
                      História da Peça Histórica
                    </h4>
                    <p>
                      {product.description}
                    </p>
                    <p>
                      Catalogado e autenticado sob laudos periciais com custódia de segurança {product.custodian} ({product.custodianFacility}).
                    </p>
                  </div>
                )}

                {activeTab === 'specs' && (
                  <div className="space-y-2 font-['Space_Grotesk']">
                    <div className="flex justify-between py-1.5 border-b border-[#282E3A]">
                      <span className="text-[#9CA3AF]">Ano Histórico:</span>
                      <span className="text-[#F4F1EA]">{product.year}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#282E3A]">
                      <span className="text-[#9CA3AF]">Classificação:</span>
                      <span className="text-[#F4F1EA]">{product.grade}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#282E3A]">
                      <span className="text-[#9CA3AF]">Método de Verificação:</span>
                      <span className="text-[#F4F1EA]">{product.verifiedMethod}</span>
                    </div>
                    <div className="flex justify-between py-1.5 border-b border-[#282E3A]">
                      <span className="text-[#9CA3AF]">Seguro Total:</span>
                      <span className="text-[#F4F1EA]">{product.insurancePolicy}</span>
                    </div>
                  </div>
                )}

                {activeTab === 'shipping' && (
                  <div className="space-y-3">
                    <h4 className="font-bold text-[#F4F1EA] font-['Space_Grotesk'] text-sm">
                      Protocolo de Envio e Proteção ao Comprador
                    </h4>
                    <p>
                      A entrega é realizada via transporte seguro especializado de alta segurança com cobertura integral de seguro da Lloyd&apos;s of London até a entrega e conferência em mãos do comprador.
                    </p>
                    <p>
                      Em conformidade com a legislação brasileira e o Código de Defesa do Consumidor, emitimos Nota Fiscal Eletrônica e Termo de Garantia Vitalícia de Autenticidade Registrado em Cartório de Títulos e Documentos.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* Modal de Zoom */}
      <ImageModal
        isOpen={modalData.isOpen}
        onClose={() => setModalData({ ...modalData, isOpen: false })}
        imageUrl={modalData.imageUrl}
        mediaType={modalData.mediaType}
        title={modalData.title}
        subtitle={modalData.subtitle}
      />

      {/* Rodapé Oficial */}
      <Footer />
    </div>
  );
}

export default function ProductPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#08090B] flex flex-col items-center justify-center gap-3 text-xs font-['Space_Grotesk'] text-[#f2ca50]">
          <span className="material-symbols-outlined text-4xl animate-spin">progress_activity</span>
          <span>Carregando Relíquia Esportiva...</span>
        </div>
      }
    >
      <ProductContent />
    </Suspense>
  );
}
