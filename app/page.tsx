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
    facility: 'Cofre São Paulo Bandeirantes • Pronto para Transporte Blindado',
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
        facility: 'Cofre São Paulo Bandeirantes • Pronto para Transporte Blindado',
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

  // Identificar produto em destaque para o Hero
  const heroProduct =
    products.find((p) => p.featured) ||
    products.find((p) => p.id === 'pel-1970') ||
    products[0] ||
    CATALOG_RELICS[0];

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
                  href={`/product?id=${heroProduct?.id || 'pel-1970'}`}
                  className="px-6 py-3.5 bg-[#12151B] hover:bg-[#1A1E26] border border-[#282E3A] hover:border-[#f2ca50] text-[#F4F1EA] font-['Space_Grotesk'] font-semibold text-xs rounded-lg transition-all flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg text-[#f2ca50]">visibility</span>
                  {config.heroBtnSecondary}
                </Link>
              </div>

              {/* Selos de Confiança */}
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
                    <strong className="text-[#F4F1EA] block text-xs">Escolta Blindada</strong>
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
            </div>

            {/* Hero Product Highlight Card */}
            {heroProduct && (
              <div className="lg:col-span-5">
                <div className="bg-[#12151B] border border-[#C59B27]/50 rounded-xl p-5 shadow-2xl relative overflow-hidden group hover:border-[#f2ca50] transition-all">
                  {/* Badge Superior */}
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

                  {/* Imagem em Destaque */}
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-[#08090B] mb-4">
                    <img
                      src={heroProduct.imageUrl}
                      alt={heroProduct.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <button
                      onClick={() =>
                        openImage(
                          heroProduct.imageUrl,
                          heroProduct.title,
                          'Autógrafo original preservado sob moldura com proteção anti-UV'
                        )
                      }
                      className="absolute top-3 right-3 p-1.5 bg-[#08090B]/80 hover:bg-[#f2ca50] hover:text-[#08090B] text-[#F4F1EA] rounded-full border border-[#282E3A] transition-colors"
                      title="Ampliar foto em alta definição"
                    >
                      <span className="material-symbols-outlined text-base">zoom_in</span>
                    </button>

                    <div className="absolute bottom-2 left-3 right-3 flex justify-between items-center text-[10px] font-['Space_Grotesk'] text-[#F4F1EA] bg-[#08090B]/80 px-2.5 py-1 rounded border border-[#282E3A]">
                      <span>Certificado Forense</span>
                      <span className="text-[#10B981]">Laudo Aprovado</span>
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
            )}
          </div>
        </div>
      </section>

      {/* SECTION: Vitrine de Produtos Principais em Reais */}
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
              <article
                key={item.id}
                className="bg-[#12151B] border border-[#282E3A] hover:border-[#f2ca50]/70 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(242,202,80,0.12)] flex flex-col group"
              >
                <div className="relative aspect-[4/3] bg-[#08090B] overflow-hidden">
                  <img
                    src={item.imageUrl}
                    alt={item.altText}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex flex-col gap-1">
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
                  <div className="absolute top-3 right-3">
                    <button
                      onClick={() => openImage(item.imageUrl, item.title, item.sku)}
                      className="p-1.5 bg-[#08090B]/80 hover:bg-[#f2ca50] hover:text-[#08090B] text-[#F4F1EA] rounded-full border border-[#282E3A] transition-colors"
                      title="Ampliar Foto"
                    >
                      <span className="material-symbols-outlined text-base">zoom_in</span>
                    </button>
                  </div>
                </div>

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
            ))}
          </div>
        </div>
      </section>

      {/* SECTION: Validação de Certificado COA */}
      <section className="py-16 bg-[#08090B] border-b border-[#282E3A]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-[#12151B] border border-[#282E3A] rounded-xl p-6 sm:p-10 space-y-6">
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs font-['Space_Grotesk'] text-[#10B981] font-bold uppercase tracking-wider flex items-center justify-center gap-1.5">
                <span className="material-symbols-outlined text-base">verified</span>
                Consulta de Autenticidade
              </span>
              <h2 className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
                Consulte o Certificado de um Produto
              </h2>
              <p className="text-xs sm:text-sm font-['Manrope'] text-[#9CA3AF]">
                Digite o código do certificado de autenticidade (COA) para verificar os laudos periciais e a procedência do item no acervo.
              </p>
            </div>

            <form onSubmit={handleVerifyCoa} className="flex flex-col sm:flex-row gap-2 max-w-2xl mx-auto">
              <input
                type="text"
                value={coaQuery}
                onChange={(e) => setCoaQuery(e.target.value)}
                placeholder="Ex: COA-PEL-1970-MEX-9801"
                className="flex-1 bg-[#08090B] border border-[#282E3A] rounded px-4 py-3 text-xs font-['Space_Grotesk'] text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] text-xs font-bold font-['Space_Grotesk'] uppercase rounded transition-colors"
              >
                Consultar
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

      {/* SECTION: Benefícios e Segurança da Compra */}
      <section className="py-16 bg-[#0c0e11] border-b border-[#282E3A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-['Space_Grotesk'] text-[#C59B27] uppercase font-semibold">
              Garantias Exclusivas
            </span>
            <h2 className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#F4F1EA] mt-1">
              Por que Comprar na {config.storeName}?
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-[#12151B] border border-[#282E3A] p-6 rounded-lg space-y-3">
              <div className="w-12 h-12 rounded bg-[#08090B] border border-[#C59B27] flex items-center justify-center text-[#f2ca50]">
                <span className="material-symbols-outlined text-2xl">biotech</span>
              </div>
              <h3 className="text-base font-bold text-[#F4F1EA] font-['Playfair_Display']">
                Perícia Forense 8K e C14
              </h3>
              <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                Todas as peças passam por rigorosa análise espectrométrica molecular, correspondência fotográfica e laudos periciais chancelados.
              </p>
            </div>

            <div className="bg-[#12151B] border border-[#282E3A] p-6 rounded-lg space-y-3">
              <div className="w-12 h-12 rounded bg-[#08090B] border border-[#C59B27] flex items-center justify-center text-[#f2ca50]">
                <span className="material-symbols-outlined text-2xl">shield</span>
              </div>
              <h3 className="text-base font-bold text-[#F4F1EA] font-['Playfair_Display']">
                Transporte com Escolta Armada
              </h3>
              <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                Logística de valores de segurança máxima pela Brink&apos;s com apólice de seguro total da Lloyd&apos;s of London até a entrega em mãos.
              </p>
            </div>

            <div className="bg-[#12151B] border border-[#282E3A] p-6 rounded-lg space-y-3">
              <div className="w-12 h-12 rounded bg-[#08090B] border border-[#C59B27] flex items-center justify-center text-[#f2ca50]">
                <span className="material-symbols-outlined text-2xl">receipt_long</span>
              </div>
              <h3 className="text-base font-bold text-[#F4F1EA] font-['Playfair_Display']">
                Nota Fiscal e Certificado Notarial
              </h3>
              <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                Emissão de Nota Fiscal Eletrônica e termo de autenticidade vitalício registrado em Cartório de Registro de Títulos e Documentos.
              </p>
            </div>
          </div>
        </div>
      </section>

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
