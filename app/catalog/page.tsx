'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { RelayBar } from '@/components/RelayBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ImageModal } from '@/components/ImageModal';
import { RelicItem, CATALOG_RELICS } from '@/lib/relics-data';
import { getStoredProducts } from '@/lib/products-store';
import { getStoredSiteConfig, DEFAULT_SITE_CONFIG, SiteConfig } from '@/lib/site-config-store';

export default function CatalogPage() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [selectedSports, setSelectedSports] = useState<string[]>([
    'futebol',
    'f1',
    'basquete',
    'boxe',
  ]);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([]);
  const [selectedAvailability, setSelectedAvailability] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(10000000);
  const [sortBy, setSortBy] = useState<string>('highest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [allRelics, setAllRelics] = useState<RelicItem[]>(CATALOG_RELICS);

  useEffect(() => {
    setAllRelics(getStoredProducts());
    setConfig(getStoredSiteConfig());

    const handleProductsUpdate = () => setAllRelics(getStoredProducts());
    const handleConfigUpdate = () => setConfig(getStoredSiteConfig());

    window.addEventListener('diamond_products_updated', handleProductsUpdate);
    window.addEventListener('diamond_config_updated', handleConfigUpdate);

    return () => {
      window.removeEventListener('diamond_products_updated', handleProductsUpdate);
      window.removeEventListener('diamond_config_updated', handleConfigUpdate);
    };
  }, []);

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

  const toggleSport = (sport: string) => {
    setSelectedSports((prev) =>
      prev.includes(sport) ? prev.filter((s) => s !== sport) : [...prev, sport]
    );
  };

  const toggleAthlete = (athlete: string) => {
    setSelectedAthletes((prev) =>
      prev.includes(athlete) ? prev.filter((a) => a !== athlete) : [...prev, athlete]
    );
  };

  const availableAthletes = useMemo(() => {
    const set = new Set<string>();
    allRelics.forEach((r) => {
      if (r.athlete && r.athlete.trim()) set.add(r.athlete.trim());
    });
    return Array.from(set);
  }, [allRelics]);

  const resetFilters = () => {
    setSelectedSports(['futebol', 'f1', 'basquete', 'boxe']);
    setSelectedAthletes([]);
    setSelectedAvailability('all');
    setMaxPrice(10000000);
    setSearchTerm('');
  };

  const filteredRelics = useMemo(() => {
    return allRelics.filter((item) => {
      const matchesSport = selectedSports.length === 0 || selectedSports.includes(item.sport || '');
      const matchesAthlete =
        selectedAthletes.length === 0 ||
        selectedAthletes.some((a) =>
          (item.athlete || '').toLowerCase().includes(a.toLowerCase())
        );
      const matchesPrice = (Number(item.priceBRL) || 0) <= maxPrice;
      const matchesAvailability =
        selectedAvailability === 'all' || item.status === selectedAvailability;
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        searchTerm === '' ||
        (item.title || '').toLowerCase().includes(term) ||
        (item.athlete || '').toLowerCase().includes(term) ||
        (item.category || '').toLowerCase().includes(term) ||
        (item.sku || '').toLowerCase().includes(term);

      return matchesSport && matchesAthlete && matchesPrice && matchesAvailability && matchesSearch;
    }).sort((a, b) => {
      const priceA = Number(a.priceBRL) || 0;
      const priceB = Number(b.priceBRL) || 0;
      const yearA = Number(a.year) || 0;
      const yearB = Number(b.year) || 0;
      if (sortBy === 'highest') return priceB - priceA;
      if (sortBy === 'lowest') return priceA - priceB;
      if (sortBy === 'year_desc') return yearB - yearA;
      if (sortBy === 'year_asc') return yearA - yearB;
      return 0;
    });
  }, [allRelics, selectedSports, selectedAthletes, maxPrice, selectedAvailability, searchTerm, sortBy]);

  const openImage = (imageUrl: string, title: string, subtitle?: string) => {
    setModalData({
      isOpen: true,
      imageUrl,
      title,
      subtitle,
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B] text-[#e2e2e6] selection:bg-[#d4af37] selection:text-[#08090B]">
      {/* 1. Global Navigation Relay Bar */}
      <RelayBar />

      {/* Main Top Institutional Nav Bar */}
      <Navbar currentSearch={searchTerm} onSearchChange={setSearchTerm} />

      {/* Header Institucional do Catálogo */}
      <section className="bg-[#12151B] border-b border-[#282E3A] py-8 px-4 sm:px-6 lg:px-12 relative overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                <span className="text-xs font-['Space_Grotesk'] text-[#E5C875] tracking-widest uppercase font-semibold">
                  Loja Oficial • Venda Direta
                </span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-['Playfair_Display'] font-bold text-[#F4F1EA] tracking-tight">
                {config.catalogPageTitle || 'Catálogo de Relíquias Esportivas'}
              </h1>
              <p className="text-xs sm:text-sm font-['Manrope'] text-[#9CA3AF] mt-2 max-w-2xl leading-relaxed">
                {config.catalogPageSubtitle ||
                  'Peças históricas originais dos maiores atletas do mundo com laudos forenses, certificado vitalício de autenticidade e entrega especial segurada para todo o Brasil.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-[#08090B] px-4 py-2.5 rounded border border-[#282E3A] flex items-center gap-3">
                <span className="material-symbols-outlined text-[#f2ca50] text-xl">payments</span>
                <div>
                  <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] block uppercase">
                    Condição Especial
                  </span>
                  <span className="text-xs font-['Space_Grotesk'] text-[#10B981] font-bold">
                    5% OFF no PIX ou até 12x
                  </span>
                </div>
              </div>

              <div className="bg-[#08090B] px-4 py-2.5 rounded border border-[#282E3A] flex items-center gap-3">
                <span className="material-symbols-outlined text-[#10B981] text-xl">local_shipping</span>
                <div>
                  <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] block uppercase">
                    Envio Especial Segurado
                  </span>
                  <span className="text-xs font-['Space_Grotesk'] text-[#F4F1EA] font-semibold">
                    Seguro 100% Incluso
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Catalog Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Sidebar / Filters Column */}
          <aside className="lg:col-span-3 space-y-6">
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-6 sticky top-24">
              <div className="flex items-center justify-between pb-3 border-b border-[#282E3A]">
                <h2 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm text-[#f2ca50]">filter_alt</span>
                  Filtros da Loja
                </h2>
                <button
                  onClick={resetFilters}
                  className="text-[11px] text-[#9CA3AF] hover:text-[#E5C875] font-['Space_Grotesk'] transition-colors"
                >
                  Limpar Todos
                </button>
              </div>

              {/* Filtro por Esporte */}
              <div>
                <span className="text-xs font-semibold text-[#F4F1EA] font-['Space_Grotesk'] block mb-2.5 uppercase tracking-wide">
                  Modalidade Esportiva
                </span>
                <div className="space-y-2">
                  {[
                    { id: 'futebol', label: 'Futebol', icon: 'sports_soccer' },
                    { id: 'f1', label: 'Fórmula 1', icon: 'sports_motorsports' },
                    { id: 'basquete', label: 'Basquete (NBA)', icon: 'sports_basketball' },
                    { id: 'boxe', label: 'Boxe Histórico', icon: 'sports_mma' },
                  ].map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center justify-between text-xs font-['Manrope'] text-[#9CA3AF] hover:text-[#F4F1EA] cursor-pointer p-1.5 rounded hover:bg-[#1A1E26] transition-colors"
                    >
                      <span className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={selectedSports.includes(s.id)}
                          onChange={() => toggleSport(s.id)}
                          className="rounded border-[#282E3A] bg-[#08090B] text-[#f2ca50] focus:ring-0 focus:ring-offset-0"
                        />
                        <span className="material-symbols-outlined text-sm text-[#9CA3AF]">
                          {s.icon}
                        </span>
                        <span>{s.label}</span>
                      </span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtro por Atleta */}
              <div>
                <div className="flex justify-between items-center mb-2.5">
                  <span className="text-xs font-semibold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wide">
                    Lendas &amp; Atletas
                  </span>
                  {selectedAthletes.length > 0 && (
                    <button
                      onClick={() => setSelectedAthletes([])}
                      className="text-[10px] text-[#f2ca50] hover:underline"
                    >
                      Todos
                    </button>
                  )}
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                  {availableAthletes.map((athlete) => (
                    <label
                      key={athlete}
                      className="flex items-center gap-2 text-xs font-['Manrope'] text-[#9CA3AF] hover:text-[#F4F1EA] cursor-pointer p-1.5 rounded hover:bg-[#1A1E26] transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedAthletes.includes(athlete)}
                        onChange={() => toggleAthlete(athlete)}
                        className="rounded border-[#282E3A] bg-[#08090B] text-[#f2ca50] focus:ring-0 focus:ring-offset-0"
                      />
                      <span className="truncate">{athlete}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Filtro por Faixa de Preço em Reais */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wide">
                    Preço Máximo
                  </span>
                  <span className="text-xs font-['Space_Grotesk'] text-[#f2ca50] font-bold">
                    R$ {maxPrice.toLocaleString('pt-BR')}
                  </span>
                </div>
                <input
                  type="range"
                  min={1000000}
                  max={10000000}
                  step={250000}
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(Number(e.target.value))}
                  className="w-full accent-[#f2ca50] bg-[#08090B] h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] mt-1">
                  <span>R$ 1.000.000</span>
                  <span>R$ 10.000.000</span>
                </div>
              </div>

              {/* Disponibilidade */}
              <div>
                <span className="text-xs font-semibold text-[#F4F1EA] font-['Space_Grotesk'] block mb-2 uppercase tracking-wide">
                  Disponibilidade
                </span>
                <select
                  value={selectedAvailability}
                  onChange={(e) => setSelectedAvailability(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] text-xs font-['Space_Grotesk'] text-[#F4F1EA] rounded px-3 py-2 focus:outline-none focus:border-[#f2ca50]"
                >
                  <option value="all">Todos os Produtos</option>
                  <option value="available">Disponível para Compra Imediata</option>
                </select>
              </div>
            </div>
          </aside>

          {/* Catalog Products Column */}
          <div className="lg:col-span-9 space-y-6">
            {/* Top Toolbar */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-4 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                  Exibindo{' '}
                  <strong className="text-[#F4F1EA]">{filteredRelics.length}</strong> produtos
                  disponíveis
                </span>
              </div>

              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] hidden sm:inline">
                    Ordenar por:
                  </span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                    className="bg-[#08090B] border border-[#282E3A] text-xs font-['Space_Grotesk'] text-[#F4F1EA] rounded px-3 py-1.5 focus:outline-none focus:border-[#f2ca50]"
                  >
                    <option value="highest">Maior Preço (R$)</option>
                    <option value="lowest">Menor Preço (R$)</option>
                    <option value="year_desc">Ano Histórico (Mais Recente)</option>
                    <option value="year_asc">Ano Histórico (Mais Antigo)</option>
                  </select>
                </div>

                <div className="flex items-center border border-[#282E3A] rounded overflow-hidden">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-1.5 ${
                      viewMode === 'grid'
                        ? 'bg-[#1A1E26] text-[#f2ca50]'
                        : 'bg-[#08090B] text-[#9CA3AF]'
                    } hover:text-[#F4F1EA] transition-colors`}
                    title="Visualização em Grade"
                  >
                    <span className="material-symbols-outlined text-base">grid_view</span>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 ${
                      viewMode === 'list'
                        ? 'bg-[#1A1E26] text-[#f2ca50]'
                        : 'bg-[#08090B] text-[#9CA3AF]'
                    } hover:text-[#F4F1EA] transition-colors`}
                    title="Visualização em Lista"
                  >
                    <span className="material-symbols-outlined text-base">view_list</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Products Grid */}
            {filteredRelics.length === 0 ? (
              <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-12 text-center space-y-4">
                <span className="material-symbols-outlined text-5xl text-[#9CA3AF]">
                  inventory_2
                </span>
                <h3 className="text-lg font-bold text-[#F4F1EA] font-['Playfair_Display']">
                  Nenhum produto encontrado com os filtros selecionados
                </h3>
                <p className="text-xs text-[#9CA3AF] font-['Manrope'] max-w-md mx-auto">
                  Tente redefinir os filtros de preço, atleta ou esporte para visualizar outros produtos do catálogo.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-[#f2ca50] text-[#08090B] font-bold text-xs rounded uppercase font-['Space_Grotesk'] hover:bg-[#E5C875] transition-colors"
                >
                  Restaurar Filtros
                </button>
              </div>
            ) : (
              <div
                className={`grid gap-6 ${
                  viewMode === 'grid'
                    ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                    : 'grid-cols-1'
                }`}
              >
                {filteredRelics.map((relic) => (
                  <article
                    key={relic.id}
                    className="bg-[#12151B] border border-[#282E3A] hover:border-[#f2ca50]/70 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-[0_0_20px_rgba(242,202,80,0.12)] flex flex-col group"
                  >
                    {/* Imagem do Produto com Auto-Ajuste Sem Cortes */}
                    <div className="relative aspect-[4/3] bg-[#07090c] overflow-hidden flex items-center justify-center p-2.5 border-b border-[#282E3A]/60 select-none">
                      {/* Ambient Glow Backdrop */}
                      <div
                        className="absolute inset-0 bg-cover bg-center opacity-25 blur-xl scale-125 pointer-events-none transition-all duration-500"
                        style={{ backgroundImage: `url(${relic.imageUrl})` }}
                      />
                      <div className="absolute inset-0 bg-[#08090B]/55 pointer-events-none" />

                      {/* Imagem Real 100% Visível sem Cortes */}
                      <img
                        src={relic.imageUrl}
                        alt={relic.altText}
                        className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-[0_4px_16px_rgba(0,0,0,0.85)] select-none"
                      />

                      {/* Botão de Ampliação */}
                      <button
                        onClick={() => openImage(relic.imageUrl, relic.title, relic.sku)}
                        className="absolute top-3 right-3 p-1.5 bg-[#08090B]/80 hover:bg-[#f2ca50] hover:text-[#08090B] text-[#F4F1EA] rounded-full border border-[#282E3A] transition-all"
                        title="Ver foto em alta resolução"
                      >
                        <span className="material-symbols-outlined text-base">zoom_in</span>
                      </button>

                      {/* Badge de Disponibilidade */}
                      <div className="absolute top-3 left-3 flex flex-col gap-1">
                        {relic.status === 'sold' ? (
                          <span className="px-2.5 py-0.5 bg-red-950/90 border border-red-500 text-red-400 text-[10px] font-['Space_Grotesk'] font-bold rounded uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                            {config.btnSoldOut || 'Vendido'}
                          </span>
                        ) : (
                          <span className="px-2.5 py-0.5 bg-[#08090B]/90 border border-[#10B981] text-[#10B981] text-[10px] font-['Space_Grotesk'] font-bold rounded uppercase flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                            {relic.statusLabel}
                          </span>
                        )}
                      </div>

                      <div className="absolute bottom-2 left-3 right-3 flex justify-between items-end text-[11px] font-['Space_Grotesk']">
                        <span className="text-[#9CA3AF] bg-[#08090B]/80 px-2 py-0.5 rounded border border-[#282E3A]">
                          SKU: {relic.sku}
                        </span>
                        <div className="flex items-center gap-1.5">
                          {relic.gallery && relic.gallery.length > 1 && (
                            <span
                              className="text-[#E5C875] bg-[#08090B]/85 px-1.5 py-0.5 rounded border border-[#282E3A] flex items-center gap-1 text-[10px]"
                              title={`${relic.gallery.length} fotos e vídeos na galeria`}
                            >
                              <span className="material-symbols-outlined text-xs">
                                {relic.gallery.some((g) => g.type === 'video')
                                  ? 'videocam'
                                  : 'photo_library'}
                              </span>
                              {relic.gallery.length}
                            </span>
                          )}
                          <span className="text-[#f2ca50] bg-[#08090B]/80 px-2 py-0.5 rounded border border-[#282E3A]">
                            Ano {relic.year}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Conteúdo do Card */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-center text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] mb-1">
                          <span className="uppercase text-[#C59B27] font-semibold">
                            {relic.category}
                          </span>
                          <span className="text-[#10B981] text-[10px] flex items-center gap-0.5">
                            <span className="material-symbols-outlined text-xs">verified</span>
                            Certificado
                          </span>
                        </div>

                        <h3 className="text-base sm:text-lg font-['Playfair_Display'] font-bold text-[#F4F1EA] group-hover:text-[#E5C875] transition-colors leading-snug">
                          {relic.title}
                        </h3>

                        <p className="text-xs font-['Manrope'] text-[#9CA3AF] mt-1.5 line-clamp-2 leading-relaxed">
                          {relic.description}
                        </p>
                      </div>

                      {/* Preço em Reais e Ações de Compra */}
                      <div className="pt-3 border-t border-[#282E3A]">
                        <div className="mb-3">
                          <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] block uppercase">
                            Preço de Venda
                          </span>
                          <div className="flex items-baseline gap-2">
                            <span className="text-xl sm:text-2xl font-['Playfair_Display'] font-bold text-[#f2ca50]">
                              R$ {(Number(relic.priceBRL) || 0).toLocaleString('pt-BR')},00
                            </span>
                            <span className="text-[10px] font-['Space_Grotesk'] text-[#10B981] font-semibold">
                              (à vista no PIX)
                            </span>
                          </div>
                          <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] block mt-0.5">
                            ou {relic.installments || '12x sem juros'}
                          </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href={`/product?id=${relic.id}`}
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#1A1E26] border border-[#282E3A] hover:border-[#f2ca50] text-[#F4F1EA] text-xs font-['Manrope'] font-medium rounded transition-colors text-center"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            {config.btnViewDetails}
                          </Link>

                          {relic.status === 'sold' ? (
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
            )}
          </div>
        </div>
      </main>

      {/* Modal de Foto em Alta Definição */}
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
