'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RelayBar } from '@/components/RelayBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ImageModal } from '@/components/ImageModal';
import { RELIC_IMAGES, RelicItem, CATALOG_RELICS } from '@/lib/relics-data';
import { getStoredProducts } from '@/lib/products-store';
import { getStoredSiteConfig, DEFAULT_SITE_CONFIG, SiteConfig } from '@/lib/site-config-store';

// Componente individual de Card da Vitrine com Auto-Ajuste sem cortes e navegação de imagens
interface ShowcaseCardProps {
  item: RelicItem;
  config: SiteConfig;
  openImage: (imageUrl: string, title: string, subtitle?: string) => void;
}

function ShowcaseCard({ item, config, openImage }: ShowcaseCardProps) {
  const [cardImgIndex, setCardImgIndex] = useState(0);
  const [isCardHovered, setIsCardHovered] = useState(false);

  // Reúne todas as imagens cadastradas da peça
  const cardImages: string[] = [];
  if (item.imageUrl) cardImages.push(item.imageUrl);
  if (item.gallery && item.gallery.length > 0) {
    item.gallery.forEach((g) => {
      if (g.url && (g.type !== 'video' || !g.type) && !cardImages.includes(g.url)) {
        cardImages.push(g.url);
      }
    });
  }
  if (cardImages.length === 0 && item.imageUrl) cardImages.push(item.imageUrl);

  // Carrossel automático opcional para itens em destaque na vitrine
  useEffect(() => {
    if (!item.featured || !config.featuredAutoPlay || cardImages.length <= 1 || isCardHovered) return;
    const intervalMs = Math.max(2, config.featuredIntervalSeconds || 4) * 1000;
    const timer = setInterval(() => {
      setCardImgIndex((prev) => (prev + 1) % cardImages.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [item.featured, config.featuredAutoPlay, config.featuredIntervalSeconds, isCardHovered, cardImages.length]);

  const currentImg = cardImages[cardImgIndex % cardImages.length] || item.imageUrl;

  return (
    <article className="bg-[#12151B] border border-[#282E3A] hover:border-[#f2ca50]/70 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(242,202,80,0.12)] flex flex-col group">
      {/* Container de Imagem com Auto-Ajuste Sem Cortes e Espaçamento Seguro */}
      <div
        className="relative aspect-[4/3] bg-[#07090c] overflow-hidden flex items-center justify-center p-4 sm:p-5 border-b border-[#282E3A]/60 group/cardimg select-none"
        onMouseEnter={() => setIsCardHovered(true)}
        onMouseLeave={() => setIsCardHovered(false)}
      >
        {/* Ambient Glow Backdrop para efeito luxuoso sem barras pretas secas */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-25 blur-xl scale-125 pointer-events-none transition-all duration-500"
          style={{ backgroundImage: `url(${currentImg})` }}
        />
        <div className="absolute inset-0 bg-[#08090B]/55 pointer-events-none" />

        {/* Imagem real com 100% da peça visível, sem cortes */}
        <img
          key={currentImg}
          src={currentImg}
          alt={item.altText}
          className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] select-none"
        />

        {/* Badges superiores com z-20 */}
        <div className="absolute top-2.5 left-2.5 z-20 flex flex-col gap-1 pointer-events-none">
          {item.status === 'sold' ? (
            <span className="px-2 py-0.5 bg-red-950/90 border border-red-500 text-red-400 text-[10px] font-['Space_Grotesk'] font-bold rounded uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
              {config.btnSoldOut || 'Vendido'}
            </span>
          ) : (
            <span className="px-2 py-0.5 bg-[#08090B]/90 border border-[#10B981] text-[#10B981] text-[10px] font-['Space_Grotesk'] font-bold rounded uppercase">
              {item.statusLabel}
            </span>
          )}

          {item.featured && (
            <span className="px-2 py-0.5 bg-[#f2ca50]/20 border border-[#f2ca50] text-[#f2ca50] text-[9px] font-['Space_Grotesk'] font-bold rounded uppercase flex items-center gap-0.5 shadow-sm">
              <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                star
              </span>
              Destaque
            </span>
          )}
        </div>

        {/* Botão de Ampliação */}
        <div className="absolute top-3 right-3 z-20">
          <button
            onClick={() => openImage(currentImg, item.title, item.sku)}
            className="p-1.5 bg-[#08090B]/85 hover:bg-[#f2ca50] hover:text-[#08090B] text-[#F4F1EA] rounded-full border border-[#282E3A] transition-colors shadow-md backdrop-blur-sm"
            title="Ampliar Foto"
          >
            <span className="material-symbols-outlined text-base">zoom_in</span>
          </button>
        </div>

        {/* Controles de Navegação de Imagens se tiver mais de uma foto */}
        {cardImages.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCardImgIndex((prev) => (prev - 1 + cardImages.length) % cardImages.length);
              }}
              className="absolute left-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#08090B]/85 hover:bg-[#f2ca50] text-[#F4F1EA] hover:text-[#08090B] border border-[#282E3A] flex items-center justify-center transition-all opacity-0 group-hover/cardimg:opacity-100 shadow-lg backdrop-blur-sm"
              title="Foto anterior"
            >
              <span className="material-symbols-outlined text-base">chevron_left</span>
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setCardImgIndex((prev) => (prev + 1) % cardImages.length);
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 z-20 w-7 h-7 rounded-full bg-[#08090B]/85 hover:bg-[#f2ca50] text-[#F4F1EA] hover:text-[#08090B] border border-[#282E3A] flex items-center justify-center transition-all opacity-0 group-hover/cardimg:opacity-100 shadow-lg backdrop-blur-sm"
              title="Próxima foto"
            >
              <span className="material-symbols-outlined text-base">chevron_right</span>
            </button>

            {/* Bolinhas / Dots no rodapé da foto */}
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1 bg-[#08090B]/85 px-2 py-0.5 rounded-full border border-[#282E3A] backdrop-blur-sm">
              {cardImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setCardImgIndex(idx);
                  }}
                  className={`transition-all rounded-full ${
                    idx === cardImgIndex % cardImages.length
                      ? 'w-3.5 h-1 bg-[#f2ca50]'
                      : 'w-1 h-1 bg-white/40 hover:bg-white/80'
                  }`}
                  title={`Foto ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Detalhes do Produto */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex justify-between items-center text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] mb-1">
            <span className="uppercase text-[#C59B27] font-semibold">{item.category}</span>
            <span className="text-[#F4F1EA]">{item.year}</span>
          </div>

          <h3 className="text-base font-['Playfair_Display'] font-bold text-[#F4F1EA] group-hover:text-[#E5C875] transition-colors leading-snug">
            {item.title}
          </h3>

          <p className="text-xs font-['Manrope'] text-[#9CA3AF] mt-1.5 line-clamp-2">
            {item.description}
          </p>

          {/* Faixa de SKU e Quantidade de Fotos */}
          <div className="flex items-center justify-between text-[11px] font-['Space_Grotesk'] pt-2 text-[#9CA3AF]">
            <span className="bg-[#08090B] border border-[#282E3A] px-2 py-0.5 rounded text-[10px]">
              SKU: {item.sku}
            </span>
            {cardImages.length > 1 && (
              <span className="text-[#E5C875] text-[10px] flex items-center gap-1 font-semibold">
                <span className="material-symbols-outlined text-xs">photo_library</span>
                {cardImages.length} fotos
              </span>
            )}
          </div>
        </div>

        <div className="pt-3 border-t border-[#282E3A]">
          <div className="mb-3">
            <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] block uppercase">
              Preço em Reais
            </span>
            <span className="text-xl font-['Playfair_Display'] font-bold text-[#f2ca50]">
              R$ {(Number(item?.priceBRL) || 0).toLocaleString('pt-BR')},00
            </span>
            <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] block mt-0.5">
              {item?.installments || '12x sem juros'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href={`/product?id=${item.id}`}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#1A1E26] border border-[#282E3A] hover:border-[#f2ca50] text-[#F4F1EA] text-xs font-['Manrope'] font-medium rounded transition-colors text-center"
            >
              <span className="material-symbols-outlined text-sm">visibility</span>
              {config.btnViewDetails}
            </Link>

            {item.status === 'sold' ? (
              <span className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#1A1E26] border border-red-900/40 text-red-400/80 text-xs font-['Manrope'] font-bold uppercase rounded text-center cursor-not-allowed select-none">
                <span className="material-symbols-outlined text-sm">lock</span>
                {config.btnSoldOut || 'Vendido'}
              </span>
            ) : (
              <Link
                href="/checkout"
                className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] text-xs font-['Manrope'] font-bold uppercase rounded transition-colors text-center shadow-sm"
              >
                <span className="material-symbols-outlined text-sm">shopping_cart</span>
                {config.btnBuyNow}
              </Link>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}

export default function HomePage() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [products, setProducts] = useState<RelicItem[]>(CATALOG_RELICS);

  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
    subtitle: '',
  });

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

  const [coaQuery, setCoaQuery] = useState('COA-PEL-1970-MEX-9801');
  const [searchResult, setSearchResult] = useState<null | {
    found: boolean;
    title: string;
    status: string;
    facility: string;
    policy: string;
    sku: string;
  }>({
    found: true,
    title: 'Camisa Oficial Usada por Pelé na Final da Copa de 1970',
    status: 'PRODUTO AUTÊNTICO • EM ESTOQUE',
    facility: 'Cofre São Paulo Bandeirantes • Pronto para Envio Especializado',
    policy: "Apólice Lloyd's of London R$ 30.000.000,00 (Cobertura 100%)",
    sku: 'PROD-1970-MEX-10',
  });

  const handleVerifyCoa = (e: React.FormEvent) => {
    e.preventDefault();
    if (!coaQuery.trim()) return;

    if (
      coaQuery.toLowerCase().includes('pel') ||
      coaQuery.toLowerCase().includes('1970') ||
      coaQuery.toLowerCase().includes('9801')
    ) {
      setSearchResult({
        found: true,
        title: 'Camisa Oficial Usada por Pelé na Final da Copa de 1970',
        status: 'PRODUTO AUTÊNTICO • EM ESTOQUE',
        facility: 'Cofre São Paulo Bandeirantes • Pronto para Envio Especializado',
        policy: "Apólice Lloyd's of London R$ 30.000.000,00 (Cobertura 100%)",
        sku: 'PROD-1970-MEX-10',
      });
    } else if (coaQuery.toLowerCase().includes('sen') || coaQuery.toLowerCase().includes('1991')) {
      setSearchResult({
        found: true,
        title: 'Capacete Bell GP3 McLaren 1991 Ayrton Senna Interlagos',
        status: 'PRODUTO AUTÊNTICO • EM ESTOQUE',
        facility: 'Cofre Diamante São Paulo • Certificado FIA Heritage',
        policy: "Apólice Lloyd's of London R$ 15.000.000,00",
        sku: 'PROD-F1-SENNA-91',
      });
    } else {
      setSearchResult({
        found: true,
        title: `Certificado Registrado: #${coaQuery.toUpperCase()}`,
        status: 'AUTENTICIDADE CONFIRMADA EM CARTÓRIO',
        facility: 'Centro Seguro Logístico Diamond Relics São Paulo',
        policy: "Apólice All-Risks Lloyd's of London Ativa",
        sku: 'PROD-REG-VALID',
      });
    }
  };

  const openImage = (imageUrl: string, title: string, subtitle?: string) => {
    setModalData({
      isOpen: true,
      imageUrl,
      title,
      subtitle,
    });
  };

  // Identificar produtos em destaque para o Hero
  const featuredList = products.filter((p) => p.featured);
  const heroFeaturedProducts =
    config.heroDisplayMode === 'vitrine'
      ? products.length > 0
        ? products
        : CATALOG_RELICS
      : featuredList.length > 0
      ? featuredList
      : [products.find((p) => p.id === 'pel-1970') || products[0] || CATALOG_RELICS[0]];

  const [selectedHeroProdIndex, setSelectedHeroProdIndex] = useState(0);

  // Se o administrador selecionou um produto fixo no painel, respeitar a escolha
  const adminChosenProduct = config.heroSelectedProductId
    ? products.find((p) => p.id === config.heroSelectedProductId)
    : null;

  const heroProduct =
    adminChosenProduct ||
    heroFeaturedProducts[selectedHeroProdIndex % heroFeaturedProducts.length] ||
    heroFeaturedProducts[0];

  // Reúne todas as imagens da peça em destaque ativa
  const allHeroImages: string[] = [];
  if (heroProduct?.imageUrl) {
    allHeroImages.push(heroProduct.imageUrl);
  }
  if (heroProduct?.gallery && heroProduct.gallery.length > 0) {
    heroProduct.gallery.forEach((g) => {
      if (g.url && (g.type !== 'video' || !g.type) && !allHeroImages.includes(g.url)) {
        allHeroImages.push(g.url);
      }
    });
  }
  if (allHeroImages.length === 0 && heroProduct?.imageUrl) {
    allHeroImages.push(heroProduct.imageUrl);
  }

  const [heroImgIndex, setHeroImgIndex] = useState(0);
  const [isHeroHovered, setIsHeroHovered] = useState(false);

  // Reseta índice da imagem ao trocar de produto em destaque
  useEffect(() => {
    setHeroImgIndex(0);
  }, [heroProduct?.id]);

  // Carrossel Automático com controle de tempo configurável pelo CMS
  useEffect(() => {
    if (!config.featuredAutoPlay || allHeroImages.length <= 1 || isHeroHovered) return;
    const intervalMs = Math.max(2, config.featuredIntervalSeconds || 4) * 1000;
    const timer = setInterval(() => {
      setHeroImgIndex((prev) => (prev + 1) % allHeroImages.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [
    config.featuredAutoPlay,
    config.featuredIntervalSeconds,
    isHeroHovered,
    allHeroImages.length,
    heroProduct?.id,
  ]);

  const currentHeroImageUrl =
    allHeroImages[heroImgIndex % allHeroImages.length] || heroProduct?.imageUrl || '';

  const featuredProducts =
    products.filter((p) => p.featured).length > 0
      ? products.filter((p) => p.featured)
      : products.slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B] text-[#e2e2e6] selection:bg-[#d4af37] selection:text-[#08090B]">
      {/* 1. Global Navigation Relay Bar */}
      <RelayBar />

      {/* Top Main Institutional Nav Bar */}
      <Navbar />

      {/* HERO SECTION */}
      {config.showHeroSection !== false && (
        <section className="relative pt-10 pb-16 md:pt-16 md:pb-24 overflow-hidden border-b border-[#282E3A]/70">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
              {/* Hero Text */}
              <div className="lg:col-span-7 space-y-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#12151B] border border-[#C59B27]/40 rounded-full text-xs font-['Space_Grotesk'] text-[#E5C875]">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                  <span>{config.heroTagline}</span>
                </div>

                <h1 className="text-3xl sm:text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#F4F1EA] tracking-tight leading-[1.15]">
                  {config.heroTitle}
                </h1>

                <p className="text-sm sm:text-base font-['Manrope'] text-[#9CA3AF] max-w-2xl leading-relaxed">
                  {config.heroSubtitle}
                </p>

                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <Link
                    href="/catalog"
                    className="px-6 py-3.5 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-['Space_Grotesk'] font-bold text-xs uppercase tracking-wider rounded-lg transition-all shadow-[0_0_20px_rgba(242,202,80,0.25)] flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg">storefront</span>
                    {config.heroBtnPrimary}
                  </Link>

                  <Link
                    href={
                      config.heroDisplayMode === 'custom_image'
                        ? config.heroCustomBtnLink || '/catalog'
                        : config.heroDisplayMode === 'logo'
                        ? '/catalog'
                        : `/product?id=${heroProduct?.id || 'pel-1970'}`
                    }
                    className="px-6 py-3.5 bg-[#12151B] hover:bg-[#1A1E26] border border-[#282E3A] hover:border-[#f2ca50] text-[#F4F1EA] font-['Space_Grotesk'] font-semibold text-xs rounded-lg transition-all flex items-center gap-2"
                  >
                    <span className="material-symbols-outlined text-lg text-[#f2ca50]">visibility</span>
                    {config.heroBtnSecondary}
                  </Link>
                </div>

                {/* Selos de Confiança */}
                {config.showHeroTrustBadges !== false && (
                  <div className="pt-4 border-t border-[#282E3A] grid grid-cols-3 gap-4 text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#10B981] text-xl">verified</span>
                      <div>
                        <strong className="text-[#F4F1EA] block text-xs">100% Autêntico</strong>
                        <span className="text-[10px]">Laudo Pericial Forense</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#f2ca50] text-xl">local_shipping</span>
                      <div>
                        <strong className="text-[#F4F1EA] block text-xs">Entrega Segura</strong>
                        <span className="text-[10px]">Seguro Total Lloyd&apos;s</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#E5C875] text-xl">payments</span>
                      <div>
                        <strong className="text-[#F4F1EA] block text-xs">Pagamento em R$</strong>
                        <span className="text-[10px]">PIX 5% OFF ou até 12x</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

            {/* HERO HIGHLIGHT (Modos: Logotipo em Tamanho Maior conforme Imagem 2 | Imagem Personalizada | Produto com Carrossel) */}
            {config.heroDisplayMode === 'logo' ? (
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 select-none animate-fadeIn">
                <div className="relative flex flex-col items-center justify-center group w-full max-w-[460px]">
                  {/* Glow Dourado Ambiente de Fundo */}
                  <div className="absolute -inset-6 bg-[#f2ca50]/10 rounded-full blur-3xl pointer-events-none group-hover:bg-[#f2ca50]/20 transition-all duration-700" />

                  {/* Logotipo da Empresa em Tamanho Maior (conforme segunda imagem) */}
                  <img
                    src={config.heroCustomImageUrl || '/diamond-relics-logo.png'}
                    alt="Diamond Relics"
                    className="relative z-10 w-full max-w-[340px] sm:max-w-[400px] md:max-w-[450px] h-auto object-contain drop-shadow-[0_15px_40px_rgba(0,0,0,0.9)] filter hover:scale-105 transition-transform duration-500 cursor-pointer"
                    onClick={() =>
                      openImage(
                        config.heroCustomImageUrl || '/diamond-relics-logo.png',
                        config.storeName || 'Diamond Relics',
                        'Brasão Oficial da Loja • Relíquias Esportivas Originais'
                      )
                    }
                    title="Clique para ampliar"
                  />

                  {/* Identificador Oficial do Instagram abaixo do logotipo */}
                  {config.heroCustomInstagramHandle?.trim() && (
                    <div className="relative z-10 mt-6 flex items-center justify-center gap-2.5 px-4 py-1.5 rounded-full bg-[#12151B]/80 border border-[#282E3A] shadow-xl backdrop-blur-md">
                      <svg
                        className="w-4 h-4 text-[#f2ca50] shrink-0"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                      </svg>
                      <span className="text-xs font-['Space_Grotesk'] text-[#F4F1EA] font-medium tracking-wide">
                        {config.heroCustomInstagramHandle}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ) : config.heroDisplayMode === 'custom_image' ? (
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-8 select-none animate-fadeIn">
                <div className="relative flex flex-col items-center justify-center group w-full max-w-[460px]">
                  <div className="absolute -inset-6 bg-[#f2ca50]/10 rounded-full blur-3xl pointer-events-none" />
                  <img
                    src={config.heroCustomImageUrl || '/diamond-relics-logo.png'}
                    alt={config.heroCustomTitle || 'Destaque'}
                    className="relative z-10 w-full max-w-[440px] h-auto max-h-[440px] object-contain drop-shadow-[0_15px_40px_rgba(0,0,0,0.9)] filter hover:scale-105 transition-transform duration-500 rounded-xl cursor-pointer"
                    onClick={() =>
                      openImage(
                        config.heroCustomImageUrl || '/diamond-relics-logo.png',
                        config.heroCustomTitle || 'Destaque',
                        config.heroCustomSubtitle
                      )
                    }
                  />
                  {config.heroCustomSubtitle && (
                    <p className="relative z-10 mt-4 text-xs font-['Space_Grotesk'] text-[#9CA3AF] text-center">
                      {config.heroCustomSubtitle}
                    </p>
                  )}
                </div>
              </div>
            ) : heroProduct ? (
              <div className="lg:col-span-5">
                <div className="bg-[#12151B] border border-[#C59B27]/50 rounded-xl p-5 shadow-2xl relative overflow-hidden group hover:border-[#f2ca50] transition-all">
                  {/* Seletor de Destaque caso haja mais de um produto destacado */}
                  {heroFeaturedProducts.length > 1 && (
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-[#282E3A] text-xs font-['Space_Grotesk']">
                      <span className="text-[10px] text-[#f2ca50] uppercase font-bold flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs text-[#f2ca50]" style={{ fontVariationSettings: "'FILL' 1" }}>
                          star
                        </span>
                        {config.heroDisplayMode === 'vitrine'
                          ? `Vitrine ${selectedHeroProdIndex + 1} de ${heroFeaturedProducts.length}`
                          : `Destaque ${selectedHeroProdIndex + 1} de ${heroFeaturedProducts.length}`}
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedHeroProdIndex(
                              (prev) => (prev - 1 + heroFeaturedProducts.length) % heroFeaturedProducts.length
                            )
                          }
                          className="w-6 h-6 rounded bg-[#08090B] border border-[#282E3A] hover:border-[#f2ca50] text-[#9CA3AF] hover:text-[#f2ca50] flex items-center justify-center transition-colors"
                          title="Peça em destaque anterior"
                        >
                          <span className="material-symbols-outlined text-sm">chevron_left</span>
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setSelectedHeroProdIndex((prev) => (prev + 1) % heroFeaturedProducts.length)
                          }
                          className="w-6 h-6 rounded bg-[#08090B] border border-[#282E3A] hover:border-[#f2ca50] text-[#9CA3AF] hover:text-[#f2ca50] flex items-center justify-center transition-colors"
                          title="Próxima peça em destaque"
                        >
                          <span className="material-symbols-outlined text-sm">chevron_right</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Badge Superior e SKU */}
                  <div className="flex justify-between items-center mb-3 text-xs font-['Space_Grotesk']">
                    {heroProduct.status === 'sold' ? (
                      <span className="px-2.5 py-0.5 bg-red-950/90 border border-red-500 text-red-400 font-bold rounded uppercase flex items-center gap-1 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                        {config.btnSoldOut || 'Vendido'}
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 bg-[#08090B] border border-[#10B981] text-[#10B981] font-bold rounded uppercase flex items-center gap-1 text-[10px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                        {heroProduct.statusLabel}
                      </span>
                    )}
                    <span className="text-[#9CA3AF] text-[11px]">SKU: {heroProduct.sku}</span>
                  </div>

                  {/* Imagem em Destaque com Auto-Ajuste Sem Cortes e Navegação entre Imagens */}
                  <div
                    className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#07090c] border border-[#282E3A]/80 mb-4 flex items-center justify-center p-2.5 group/heroimg select-none"
                    onMouseEnter={() => setIsHeroHovered(true)}
                    onMouseLeave={() => setIsHeroHovered(false)}
                  >
                    {/* Ambient Glow Backdrop sutil para ambientação de luxo */}
                    <div
                      className="absolute inset-0 bg-cover bg-center opacity-30 blur-xl scale-125 pointer-events-none transition-all duration-700"
                      style={{ backgroundImage: `url(${currentHeroImageUrl})` }}
                    />
                    <div className="absolute inset-0 bg-[#08090B]/60 pointer-events-none" />

                    {/* Imagem Real 100% Visível sem Cortes */}
                    <img
                      key={currentHeroImageUrl}
                      src={currentHeroImageUrl}
                      alt={heroProduct.title}
                      className="relative z-10 max-h-full max-w-full object-contain transition-all duration-300 drop-shadow-[0_8px_20px_rgba(0,0,0,0.9)] animate-fadeIn"
                    />

                    {/* Botões de Navegação Manual Esquerda / Direita */}
                    {allHeroImages.length > 1 && (
                      <>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHeroImgIndex(
                              (prev) => (prev - 1 + allHeroImages.length) % allHeroImages.length
                            );
                          }}
                          className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#08090B]/85 hover:bg-[#f2ca50] text-[#F4F1EA] hover:text-[#08090B] border border-[#282E3A] hover:border-[#f2ca50] flex items-center justify-center transition-all shadow-xl backdrop-blur-sm"
                          title="Foto anterior da peça"
                        >
                          <span className="material-symbols-outlined text-lg">chevron_left</span>
                        </button>

                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setHeroImgIndex((prev) => (prev + 1) % allHeroImages.length);
                          }}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 rounded-full bg-[#08090B]/85 hover:bg-[#f2ca50] text-[#F4F1EA] hover:text-[#08090B] border border-[#282E3A] hover:border-[#f2ca50] flex items-center justify-center transition-all shadow-xl backdrop-blur-sm"
                          title="Próxima foto da peça"
                        >
                          <span className="material-symbols-outlined text-lg">chevron_right</span>
                        </button>

                        {/* Indicadores de Bolinhas (Dots) */}
                        <div className="absolute bottom-9 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 bg-[#08090B]/85 px-2.5 py-1 rounded-full border border-[#282E3A] backdrop-blur-sm shadow-lg">
                          {allHeroImages.map((_, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setHeroImgIndex(idx);
                              }}
                              className={`transition-all rounded-full ${
                                idx === heroImgIndex % allHeroImages.length
                                  ? 'w-5 h-1.5 bg-[#f2ca50]'
                                  : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/80'
                              }`}
                              title={`Ir para foto ${idx + 1}`}
                            />
                          ))}
                        </div>
                      </>
                    )}

                    {/* Botão de Ampliação com Lupa */}
                    <button
                      onClick={() =>
                        openImage(
                          currentHeroImageUrl,
                          heroProduct.title,
                          'Autógrafo original preservado sob moldura com proteção anti-UV'
                        )
                      }
                      className="absolute top-3 right-3 z-20 p-1.5 bg-[#08090B]/85 hover:bg-[#f2ca50] hover:text-[#08090B] text-[#F4F1EA] rounded-full border border-[#282E3A] transition-colors shadow-md backdrop-blur-sm"
                      title="Ampliar foto em alta definição"
                    >
                      <span className="material-symbols-outlined text-base">zoom_in</span>
                    </button>

                    {/* Badge Inferior de Laudo & Contador de Fotos */}
                    <div className="absolute bottom-2 left-3 right-3 z-20 flex justify-between items-center text-[10px] font-['Space_Grotesk'] text-[#F4F1EA] bg-[#08090B]/85 px-2.5 py-1 rounded border border-[#282E3A] backdrop-blur-sm">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[#9CA3AF]">Certificado Forense</span>
                        <span className="text-[#10B981] font-bold">• Laudo Aprovado</span>
                      </div>
                      {allHeroImages.length > 1 && (
                        <span className="text-[#f2ca50] font-semibold flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">photo_library</span>
                          Foto {(heroImgIndex % allHeroImages.length) + 1} de {allHeroImages.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Preço e Botão de Compra */}
                  <div className="space-y-3">
                    <div>
                      <span className="text-[11px] font-['Space_Grotesk'] text-[#C59B27] uppercase font-semibold">
                        {heroProduct.athlete}
                      </span>
                      <h3 className="text-xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
                        {heroProduct.title}
                      </h3>
                    </div>

                    <div className="p-3.5 bg-[#08090B] border border-[#282E3A] rounded-lg flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
                          Preço à Vista no PIX (5% OFF)
                        </span>
                        <span className="text-xl font-['Playfair_Display'] font-bold text-[#f2ca50]">
                          R$ {((Number(heroProduct?.priceBRL) || 0) * 0.95).toLocaleString('pt-BR')},00
                        </span>
                        <span className="font-['Space_Grotesk'] text-[11px] text-[#9CA3AF] block mt-0.5">
                          {heroProduct?.installments || '12x sem juros'}
                        </span>
                      </div>

                      {heroProduct?.status === 'sold' ? (
                        <span className="px-4 py-2.5 bg-[#1A1E26] border border-red-900/50 text-red-400 font-bold text-xs uppercase font-['Space_Grotesk'] rounded cursor-not-allowed">
                          {config.btnSoldOut || 'Vendido'}
                        </span>
                      ) : (
                        <Link
                          href={`/product?id=${heroProduct?.id || 'pel-1970'}`}
                          className="px-4 py-2.5 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] text-xs font-['Space_Grotesk'] uppercase font-bold rounded-md transition-colors flex items-center gap-1 shadow-sm shrink-0"
                        >
                          {config.btnBuyNow}
                          <span className="material-symbols-outlined text-sm">arrow_forward</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </section>
      )}

      {/* SECTION: Vitrine de Produtos Principais em Reais */}
      {config.showVitrineSection !== false && (
        <section className="py-16 bg-[#0c0e11] border-b border-[#282E3A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
              <div>
                <span className="text-xs font-['Space_Grotesk'] text-[#C59B27] tracking-widest uppercase block mb-1 font-semibold">
                  {config.showcaseBadge}
                </span>
                <h2 className="text-2xl sm:text-4xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
                  {config.showcaseTitle}
                </h2>
              </div>

              <Link
                href="/catalog"
                className="text-xs font-['Space_Grotesk'] text-[#f2ca50] hover:text-[#E5C875] flex items-center gap-1 font-semibold"
              >
                Ver Catálogo Completo
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProducts.map((item) => (
                <ShowcaseCard
                  key={item.id}
                  item={item}
                  config={config}
                  openImage={openImage}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* SECTION: Validação de Certificado COA */}
      {config.showCoaSection !== false && (
        <section className="py-16 bg-[#08090B] border-b border-[#282E3A]">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-[#12151B] border border-[#282E3A] rounded-xl p-6 sm:p-10 space-y-6">
              <div className="text-center max-w-2xl mx-auto space-y-2">
                <span className="text-xs font-['Space_Grotesk'] text-[#10B981] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-base">verified</span>
                  {config.coaBadge || 'Consulta de Autenticidade'}
                </span>
                <h2 className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
                  {config.coaTitle || 'Consulte o Certificado de um Produto'}
                </h2>
                <p className="text-xs sm:text-sm font-['Manrope'] text-[#9CA3AF]">
                  {config.coaSubtitle ||
                    'Digite o código do certificado de autenticidade (COA) para verificar os laudos periciais e a procedência do item no acervo.'}
                </p>
              </div>

              <form onSubmit={handleVerifyCoa} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
                <input
                  type="text"
                  value={coaQuery}
                  onChange={(e) => setCoaQuery(e.target.value)}
                  placeholder={config.coaPlaceholder || 'Ex: COA-PEL-1970-MEX-9801'}
                  className="flex-1 bg-[#08090B] border border-[#282E3A] rounded px-4 py-3 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
                <button
                  type="submit"
                  className="px-6 py-3 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] text-xs font-bold font-['Space_Grotesk'] uppercase rounded transition-colors"
                >
                  {config.coaBtnText || 'Consultar'}
                </button>
              </form>

              {searchResult && (
                <div className="bg-[#08090B] border border-[#10B981]/40 rounded-lg p-5 max-w-2xl mx-auto space-y-3 animate-fadeIn text-xs font-['Space_Grotesk']">
                  <div className="flex items-center justify-between pb-2 border-b border-[#282E3A]">
                    <span className="text-[#10B981] font-bold flex items-center gap-1">
                      <span className="material-symbols-outlined text-sm">check_circle</span>
                      {searchResult.status}
                    </span>
                    <span className="text-[#9CA3AF]">SKU: {searchResult.sku}</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#F4F1EA]">{searchResult.title}</h4>
                  <p className="text-[#9CA3AF]">Localização: {searchResult.facility}</p>
                  <p className="text-[#E5C875]">Seguro: {searchResult.policy}</p>
                </div>
              )}
            </div>
          </div>
        </section>
      )}

      {/* SECTION: Benefícios e Segurança da Compra */}
      {config.showBenefitsSection !== false && (
        <section className="py-16 bg-[#0c0e11] border-b border-[#282E3A]">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs font-['Space_Grotesk'] text-[#C59B27] uppercase font-semibold">
                {config.benefitsBadge || 'Garantias Exclusivas'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#F4F1EA] mt-1">
                {config.benefitsTitle || `Por que Comprar na ${config.storeName}?`}
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-[#12151B] border border-[#282E3A] p-6 rounded-lg space-y-3">
                <div className="w-12 h-12 rounded bg-[#08090B] border border-[#C59B27] flex items-center justify-center text-[#f2ca50]">
                  <span className="material-symbols-outlined text-2xl">
                    {config.benefit1Icon || 'biotech'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F4F1EA] font-['Playfair_Display']">
                  {config.benefit1Title || 'Perícia Forense 8K e C14'}
                </h3>
                <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                  {config.benefit1Desc ||
                    'Todas as peças passam por rigorosa análise espectrométrica molecular, correspondência fotográfica e laudos periciais chancelados.'}
                </p>
              </div>

              <div className="bg-[#12151B] border border-[#282E3A] p-6 rounded-lg space-y-3">
                <div className="w-12 h-12 rounded bg-[#08090B] border border-[#C59B27] flex items-center justify-center text-[#f2ca50]">
                  <span className="material-symbols-outlined text-2xl">
                    {config.benefit2Icon || 'shield'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F4F1EA] font-['Playfair_Display']">
                  {config.benefit2Title || 'Transporte Especial Segurado'}
                </h3>
                <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                  {config.benefit2Desc ||
                    "Logística de alta segurança com rastreamento contínuo e apólice de seguro total da Lloyd's of London até a entrega em mãos."}
                </p>
              </div>

              <div className="bg-[#12151B] border border-[#282E3A] p-6 rounded-lg space-y-3">
                <div className="w-12 h-12 rounded bg-[#08090B] border border-[#C59B27] flex items-center justify-center text-[#f2ca50]">
                  <span className="material-symbols-outlined text-2xl">
                    {config.benefit3Icon || 'receipt_long'}
                  </span>
                </div>
                <h3 className="text-base font-bold text-[#F4F1EA] font-['Playfair_Display']">
                  {config.benefit3Title || 'Nota Fiscal e Certificado Notarial'}
                </h3>
                <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                  {config.benefit3Desc ||
                    'Emissão de Nota Fiscal Eletrônica e termo de autenticidade vitalício registrado em Cartório de Registro de Títulos e Documentos.'}
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Modal de Zoom de Imagens */}
      <ImageModal
        isOpen={modalData.isOpen}
        onClose={() => setModalData({ ...modalData, isOpen: false })}
        imageUrl={modalData.imageUrl}
        title={modalData.title}
        subtitle={modalData.subtitle}
      />

      {/* Rodapé Oficial */}
      <Footer />
    </div>
  );
}
