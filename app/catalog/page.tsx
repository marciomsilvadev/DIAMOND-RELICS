'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { RelayBar } from '@/components/RelayBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ImageModal } from '@/components/ImageModal';
import { CATALOG_RELICS, RelicItem } from '@/lib/relics-data';

export default function CatalogPage() {
  const [selectedSports, setSelectedSports] = useState<string[]>([
    'futebol',
    'f1',
    'basquete',
    'boxe',
  ]);
  const [selectedAthletes, setSelectedAthletes] = useState<string[]>([
    'Pelé',
    'Ayrton Senna',
    'Michael Jordan',
    'Muhammad Ali',
  ]);
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [maxPrice, setMaxPrice] = useState<number>(20000000);
  const [sortBy, setSortBy] = useState<string>('highest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState<string>('');

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

  const resetFilters = () => {
    setSelectedSports(['futebol', 'f1', 'basquete', 'boxe']);
    setSelectedAthletes(['Pelé', 'Ayrton Senna', 'Michael Jordan', 'Muhammad Ali']);
    setSelectedStatus('all');
    setMaxPrice(20000000);
    setSearchTerm('');
  };

  const filteredRelics = useMemo(() => {
    return CATALOG_RELICS.filter((item) => {
      const matchesSport = selectedSports.includes(item.sport);
      const matchesAthlete = selectedAthletes.some((a) =>
        item.athlete.toLowerCase().includes(a.toLowerCase())
      );
      const matchesPrice = item.valuationBRL <= maxPrice;
      const matchesStatus =
        selectedStatus === 'all' ||
        (selectedStatus === 'active_bid' && item.status === 'active_bid') ||
        (selectedStatus === 'direct_buy' && item.status === 'direct_buy') ||
        (selectedStatus === 'private_treaty' && item.status === 'private_treaty');

      const matchesSearch =
        searchTerm === '' ||
        item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.athlete.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.lotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.category.toLowerCase().includes(searchTerm.toLowerCase());

      return matchesSport && matchesAthlete && matchesPrice && matchesStatus && matchesSearch;
    }).sort((a, b) => {
      if (sortBy === 'highest') return b.valuationBRL - a.valuationBRL;
      if (sortBy === 'lowest') return a.valuationBRL - b.valuationBRL;
      if (sortBy === 'chronological') return a.year - b.year;
      return 0;
    });
  }, [selectedSports, selectedAthletes, maxPrice, selectedStatus, searchTerm, sortBy]);

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
      {/* 1. Simulation Relay Bar */}
      <RelayBar />

      {/* Main Top Nav Bar */}
      <Navbar currentSearch={searchTerm} onSearchChange={setSearchTerm} />

      {/* PRESTIGE HERO BANNER */}
      <section className="border-b border-[#282E3A] bg-gradient-to-b from-[#08090B] via-[#12151B] to-[#08090B] relative overflow-hidden">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#f2ca50]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-10 relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6">
            <div className="max-w-3xl">
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="px-2.5 py-1 bg-[#12151B] border border-[#C59B27]/40 rounded text-[11px] font-['Space_Grotesk'] text-[#E5C875] uppercase tracking-wider font-semibold">
                  Bunker Suíço • Custódia Nível VI
                </span>
                <span className="text-xs font-['Space_Grotesk'] text-[#10B981] flex items-center gap-1 font-medium">
                  <span className="material-symbols-outlined text-sm">verified</span>
                  Protocolo COA Físico-Digital
                </span>
              </div>

              <h1 className="text-3xl sm:text-5xl font-['Playfair_Display'] font-bold text-[#F4F1EA] mb-3 tracking-tight">
                Diamond Relics Sovereign Provenance
              </h1>

              <p className="text-xs sm:text-sm font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                Acervo curatorial de memorabilia histórica, relíquias esportivas de categoria museológica e contratos de custódia fiduciária autenticados por espectrometria de massa, radiocarbono e auditoria forense SHA-256.
              </p>
            </div>

            {/* Global Vault Actions */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <Link
                href="/checkout"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#12151B] border border-[#C59B27]/60 text-[#F4F1EA] text-xs font-['Manrope'] font-semibold rounded hover:border-[#f2ca50] hover:bg-[#1A1E26] transition-all"
              >
                <span className="material-symbols-outlined text-[#E5C875] text-base">
                  enhanced_encryption
                </span>
                Escrow Blindado
              </Link>

              <Link
                href="/admin"
                className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#f2ca50] text-[#08090B] font-['Manrope'] text-xs font-bold uppercase tracking-wider rounded hover:bg-[#E5C875] transition-all shadow-[0_0_20px_rgba(212,175,55,0.25)]"
              >
                <span className="material-symbols-outlined text-base">lock_open</span>
                Acesso ao Cofre
              </Link>
            </div>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#282E3A]">
            <div>
              <div className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                TOTAL SOB CUSTÓDIA
              </div>
              <div className="text-lg font-['Manrope'] text-[#E5C875] font-bold">
                R$ 184.750.000,00
              </div>
              <div className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                US$ 36.95M Fiduciário
              </div>
            </div>

            <div>
              <div className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                LOTES ATIVOS EM VITRINE
              </div>
              <div className="text-lg font-['Manrope'] text-[#F4F1EA] font-bold">
                48 Relíquias
              </div>
              <div className="text-[11px] font-['Space_Grotesk'] text-[#10B981]">
                100% Validado COA 8K
              </div>
            </div>

            <div>
              <div className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                LOCALIZAÇÃO PRIMÁRIA
              </div>
              <div className="text-lg font-['Manrope'] text-[#F4F1EA] font-bold">
                Zurique • Freeport
              </div>
              <div className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                Atm. Inerte Nitrogênio
              </div>
            </div>

            <div>
              <div className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                CONTRATOS DE ESCROW
              </div>
              <div className="text-lg font-['Manrope'] text-[#F59E0B] font-bold">
                14 Em Liquidação
              </div>
              <div className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                Garantia Bancária Tier 1
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION HEADER: Acervo Geral & Lotes + Controls */}
      <div className="border-b border-[#282E3A] bg-[#12151B]/80 sticky top-[57px] z-30 backdrop-blur-md">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-3.5 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-['Playfair_Display'] font-bold text-[#F4F1EA] flex items-center gap-2.5">
              Acervo Geral &amp; Lotes em Custódia Fiduciária
              <span className="text-xs font-['Space_Grotesk'] font-normal text-[#E5C875] bg-[#1A1E26] px-2.5 py-0.5 rounded border border-[#282E3A]">
                {filteredRelics.length} Exibidos (de 48)
              </span>
            </h2>
            <p className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
              R$ 184M sob salvaguarda fiduciária e monitoramento de laser espectral.
            </p>
          </div>

          {/* Sorting & View Controls */}
          <div className="flex items-center gap-3 w-full md:w-auto">
            <label
              htmlFor="sortSelect"
              className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] whitespace-nowrap hidden sm:inline"
            >
              ORDENAR POR:
            </label>
            <select
              id="sortSelect"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="w-full md:w-56 bg-[#12151B] border border-[#282E3A] text-xs font-['Space_Grotesk'] text-[#F4F1EA] rounded px-3 py-1.5 focus:outline-none focus:border-[#f2ca50] cursor-pointer"
            >
              <option value="highest">Maior Valor em Escrow</option>
              <option value="lowest">Menor Valor em Escrow</option>
              <option value="chronological">Datação Cronológica</option>
            </select>

            <div className="hidden sm:flex border border-[#282E3A] rounded overflow-hidden">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 transition-colors ${
                  viewMode === 'grid' ? 'bg-[#1A1E26] text-[#E5C875]' : 'bg-[#12151B] text-[#9CA3AF]'
                }`}
                title="Grade de Vitrine"
              >
                <span className="material-symbols-outlined text-sm">grid_view</span>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1.5 transition-colors ${
                  viewMode === 'list' ? 'bg-[#1A1E26] text-[#E5C875]' : 'bg-[#12151B] text-[#9CA3AF]'
                }`}
                title="Lista Forense"
              >
                <span className="material-symbols-outlined text-sm">view_agenda</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT: SIDEBAR FILTERS (LEFT) + ARTIFACT PRODUCT GRID (RIGHT) */}
      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 py-8 flex-1 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 4. FACETED FILTERS SIDEBAR */}
          <aside className="lg:col-span-3 space-y-5 bg-[#12151B] p-5 border border-[#282E3A] rounded-lg">
            <div className="flex items-center justify-between pb-3 border-b border-[#282E3A]">
              <span className="text-sm font-['Manrope'] font-bold text-[#F4F1EA] flex items-center gap-2">
                <span className="material-symbols-outlined text-[#E5C875] text-base">tune</span>
                Filtros do Cofre
              </span>
              <button
                onClick={resetFilters}
                className="text-xs font-['Space_Grotesk'] text-[#C59B27] hover:text-[#E5C875] transition-colors"
              >
                Resetar
              </button>
            </div>

            {/* Facet: Esporte Histórico */}
            <div>
              <h3 className="text-xs font-['Space_Grotesk'] text-[#E5C875] uppercase mb-2.5 flex justify-between items-center font-semibold">
                <span>Esporte &amp; Modalidade</span>
                <span className="text-[#9CA3AF] font-normal">4 Cat.</span>
              </h3>
              <div className="space-y-2 text-xs font-['Manrope']">
                {[
                  { id: 'futebol', label: 'Futebol Histórico', count: '(24)' },
                  { id: 'f1', label: 'Automobilismo / F1', count: '(11)' },
                  { id: 'basquete', label: 'Basquete NBA', count: '(8)' },
                  { id: 'boxe', label: 'Tênis & Boxe Clássico', count: '(5)' },
                ].map((s) => (
                  <label
                    key={s.id}
                    className="flex items-center justify-between group cursor-pointer text-[#F4F1EA] hover:text-[#E5C875]"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedSports.includes(s.id)}
                        onChange={() => toggleSport(s.id)}
                        className="rounded bg-[#12151B] border-[#594A2B] text-[#f2ca50] focus:ring-0 cursor-pointer"
                      />
                      <span>{s.label}</span>
                    </span>
                    <span className="font-['Space_Grotesk'] text-[#9CA3AF] text-[11px]">
                      {s.count}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-[#282E3A]" />

            {/* Facet: Atletas Lendários */}
            <div>
              <h3 className="text-xs font-['Space_Grotesk'] text-[#E5C875] uppercase mb-2.5 font-semibold">
                Atletas Lendários
              </h3>
              <div className="space-y-2 text-xs font-['Manrope']">
                {[
                  { name: 'Pelé', badge: 'REI' },
                  { name: 'Ayrton Senna', count: '(6)' },
                  { name: 'Michael Jordan', count: '(4)' },
                  { name: 'Muhammad Ali', count: '(2)' },
                ].map((ath) => (
                  <label
                    key={ath.name}
                    className="flex items-center justify-between group cursor-pointer text-[#F4F1EA] hover:text-[#E5C875]"
                  >
                    <span className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={selectedAthletes.includes(ath.name)}
                        onChange={() => toggleAthlete(ath.name)}
                        className="rounded bg-[#12151B] border-[#594A2B] text-[#f2ca50] focus:ring-0 cursor-pointer"
                      />
                      <span>{ath.name}</span>
                    </span>
                    {ath.badge ? (
                      <span className="text-[10px] font-['Space_Grotesk'] text-[#E5C875] bg-[#1A1E26] px-1.5 py-0.5 border border-[#282E3A] rounded">
                        {ath.badge}
                      </span>
                    ) : (
                      <span className="font-['Space_Grotesk'] text-[#9CA3AF] text-[11px]">
                        {ath.count}
                      </span>
                    )}
                  </label>
                ))}
              </div>
            </div>

            <hr className="border-[#282E3A]" />

            {/* Facet: Status de Negociação */}
            <div>
              <h3 className="text-xs font-['Space_Grotesk'] text-[#E5C875] uppercase mb-2.5 font-semibold">
                Status de Negociação
              </h3>
              <div className="space-y-2 text-xs font-['Manrope']">
                <label className="flex items-center justify-between cursor-pointer text-[#F4F1EA] hover:text-[#E5C875]">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      checked={selectedStatus === 'all'}
                      onChange={() => setSelectedStatus('all')}
                      className="bg-[#12151B] border-[#594A2B] text-[#f2ca50] focus:ring-0"
                    />
                    <span>Todos os Lotes</span>
                  </span>
                </label>
                <label className="flex items-center justify-between cursor-pointer text-[#F4F1EA] hover:text-[#E5C875]">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      checked={selectedStatus === 'active_bid'}
                      onChange={() => setSelectedStatus('active_bid')}
                      className="bg-[#12151B] border-[#594A2B] text-[#f2ca50] focus:ring-0"
                    />
                    <span>Lance Ativo / Fiduciário</span>
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping"></span>
                </label>
                <label className="flex items-center justify-between cursor-pointer text-[#F4F1EA] hover:text-[#E5C875]">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      checked={selectedStatus === 'direct_buy'}
                      onChange={() => setSelectedStatus('direct_buy')}
                      className="bg-[#12151B] border-[#594A2B] text-[#f2ca50] focus:ring-0"
                    />
                    <span>Compra Direta em Escrow</span>
                  </span>
                  <span className="material-symbols-outlined text-xs text-[#9CA3AF]">bolt</span>
                </label>
                <label className="flex items-center justify-between cursor-pointer text-[#F4F1EA] hover:text-[#E5C875]">
                  <span className="flex items-center gap-2">
                    <input
                      type="radio"
                      name="status"
                      checked={selectedStatus === 'private_treaty'}
                      onChange={() => setSelectedStatus('private_treaty')}
                      className="bg-[#12151B] border-[#594A2B] text-[#f2ca50] focus:ring-0"
                    />
                    <span>Sob Tratado Privado</span>
                  </span>
                  <span className="material-symbols-outlined text-xs text-[#9CA3AF]">lock</span>
                </label>
              </div>
            </div>

            <hr className="border-[#282E3A]" />

            {/* Facet: Faixa de Valor */}
            <div>
              <div className="flex justify-between items-center mb-2 text-xs">
                <h3 className="font-['Space_Grotesk'] text-[#E5C875] uppercase font-semibold">
                  Faixa de Valor
                </h3>
                <span className="font-['Space_Grotesk'] text-[#E5C875]">
                  Até R$ {(maxPrice / 1000000).toFixed(1)}M
                </span>
              </div>
              <input
                type="range"
                min="500000"
                max="20000000"
                step="250000"
                value={maxPrice}
                onChange={(e) => setMaxPrice(Number(e.target.value))}
                className="w-full accent-[#f2ca50] bg-[#1A1E26] h-1.5 rounded cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] mt-1.5">
                <span>R$ 500k</span>
                <span>R$ 10M</span>
                <span>R$ 20M+</span>
              </div>

              {/* Fast Tier Buttons */}
              <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-['Space_Grotesk']">
                <button
                  onClick={() => setMaxPrice(2500000)}
                  className="px-2 py-1 bg-[#1A1E26] hover:bg-[#282E3A] text-[#9CA3AF] hover:text-[#E5C875] border border-[#282E3A] rounded text-center transition-colors text-[11px]"
                >
                  Até R$ 2.5M
                </button>
                <button
                  onClick={() => setMaxPrice(20000000)}
                  className="px-2 py-1 bg-[#1A1E26] hover:bg-[#282E3A] text-[#E5C875] border border-[#f2ca50]/40 rounded text-center transition-colors text-[11px]"
                >
                  High-Value &gt; R$ 4M
                </button>
              </div>
            </div>

            {/* Escrow Protection Badge */}
            <div className="p-3 bg-[#1A1E26] border border-[#282E3A] rounded text-xs space-y-1">
              <div className="flex items-center gap-1.5 text-[#E5C875] font-bold">
                <span className="material-symbols-outlined text-sm">gavel</span>
                Custódia Segura Garantida
              </div>
              <p className="text-[#9CA3AF] text-[11px] leading-relaxed">
                Liquidação fiduciária com retenção bancária e laudo de transferência cartorial suíço.
              </p>
            </div>
          </aside>

          {/* 5. ARTIFACT SHOWCASE (RIGHT - 9 Columns) */}
          <section className="lg:col-span-9 space-y-6">
            {filteredRelics.length === 0 ? (
              <div className="p-12 text-center bg-[#12151B] border border-[#282E3A] rounded-lg space-y-3">
                <span className="material-symbols-outlined text-4xl text-[#C59B27]">
                  filter_alt_off
                </span>
                <h3 className="text-lg font-bold text-[#F4F1EA]">Nenhum lote corresponde aos filtros</h3>
                <p className="text-xs text-[#9CA3AF]">
                  Experimente redefinir os filtros de esporte, atleta ou ampliar a faixa de preço fiduciário.
                </p>
                <button
                  onClick={resetFilters}
                  className="px-4 py-2 bg-[#f2ca50] text-[#08090B] font-bold text-xs rounded uppercase tracking-wider"
                >
                  Resetar Filtros
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
                    className={`bg-[#12151B] border border-[#282E3A] hover:border-[#f2ca50]/70 transition-all duration-300 rounded overflow-hidden flex flex-col group shadow-lg hover:shadow-[0_16px_40px_-4px_rgba(212,175,55,0.15)] relative ${
                      viewMode === 'list' ? 'sm:flex-row' : ''
                    }`}
                  >
                    {/* Image bay */}
                    <div
                      className={`relative bg-[#08090B] overflow-hidden ${
                        viewMode === 'list' ? 'sm:w-72 aspect-[4/3] sm:aspect-auto' : 'aspect-[4/5]'
                      }`}
                    >
                      <img
                        src={relic.imageUrl}
                        alt={relic.altText}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 cursor-pointer"
                        onClick={() => openImage(relic.imageUrl, relic.title, relic.category)}
                      />

                      {/* Direct HTML image link action button */}
                      <button
                        onClick={() => openImage(relic.imageUrl, relic.title, relic.category)}
                        className="absolute top-2.5 right-2.5 bg-[#08090B]/90 hover:bg-[#1A1E26] border border-[#282E3A] hover:border-[#f2ca50] text-[#E5C875] text-[10px] font-['Space_Grotesk'] px-2 py-1 rounded flex items-center gap-1 transition-colors"
                        title="Ver Imagem Original Direta em HTML"
                      >
                        <span className="material-symbols-outlined text-xs">open_in_new</span>
                        <span>Link Direto</span>
                      </button>

                      {/* Badges Overlay */}
                      <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
                        <span className="px-2 py-0.5 bg-[#08090B]/90 backdrop-blur-md border border-[#10B981]/60 text-[#10B981] text-[10px] font-['Space_Grotesk'] font-bold rounded flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs">verified</span>
                          {relic.grade}
                        </span>
                        <span className="px-2 py-0.5 bg-[#12151B]/90 border border-[#282E3A] text-[#E5C875] text-[10px] font-['Space_Grotesk'] rounded">
                          {relic.lotNumber}
                        </span>
                      </div>

                      <div className="absolute bottom-2.5 right-2.5">
                        <span
                          className={`px-2 py-0.5 bg-[#08090B]/90 border rounded text-[10px] font-['Space_Grotesk'] flex items-center gap-1 ${
                            relic.status === 'active_bid'
                              ? 'border-[#F59E0B]/60 text-[#F59E0B]'
                              : relic.status === 'direct_buy'
                              ? 'border-[#282E3A] text-[#F4F1EA]'
                              : 'border-[#C59B27]/50 text-[#E5C875]'
                          }`}
                        >
                          {relic.status === 'active_bid' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#F59E0B] animate-ping"></span>
                          )}
                          {relic.statusLabel}
                        </span>
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                      <div>
                        <div className="flex justify-between items-center text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] mb-1">
                          <span className="uppercase">{relic.category}</span>
                          <span className="text-[#10B981] text-[10px]">{relic.verifiedMethod}</span>
                        </div>

                        <h3 className="text-base sm:text-lg font-['Playfair_Display'] font-bold text-[#F4F1EA] group-hover:text-[#E5C875] transition-colors leading-snug">
                          {relic.title}
                        </h3>

                        <p className="text-xs font-['Manrope'] text-[#9CA3AF] mt-1.5 line-clamp-2 leading-relaxed">
                          {relic.description}
                        </p>
                      </div>

                      {/* Valuation & Actions */}
                      <div className="pt-3 border-t border-[#282E3A]">
                        <div className="flex justify-between items-baseline mb-3">
                          <div>
                            <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] block uppercase">
                              VALOR EM ESCROW
                            </span>
                            <span className="text-base sm:text-lg font-['Playfair_Display'] font-bold text-[#E5C875]">
                              R$ {relic.valuationBRL.toLocaleString('pt-BR')}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] block uppercase">
                              EQUIV. USD
                            </span>
                            <span className="text-xs font-['Space_Grotesk'] text-[#F4F1EA]">
                              $ {relic.valuationUSD.toLocaleString('en-US')}
                            </span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                          <Link
                            href="/product"
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#1A1E26] border border-[#282E3A] hover:border-[#f2ca50] text-[#F4F1EA] text-xs font-['Manrope'] font-medium rounded transition-colors text-center"
                          >
                            <span className="material-symbols-outlined text-sm">visibility</span>
                            Inspecionar
                          </Link>

                          <Link
                            href="/checkout"
                            className="inline-flex items-center justify-center gap-1 px-3 py-2 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] text-xs font-['Manrope'] font-bold uppercase rounded transition-colors text-center shadow-sm"
                          >
                            {relic.status === 'active_bid'
                              ? 'Dar Lance'
                              : relic.status === 'direct_buy'
                              ? 'Comprar'
                              : 'Proposta'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            )}

            {/* Catalog Pagination */}
            <div className="pt-6 border-t border-[#282E3A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-['Space_Grotesk']">
              <div className="text-[#9CA3AF]">
                EXIBINDO {filteredRelics.length} DE 48 RELÍQUIAS • CARGA CRIPTOGRÁFICA NÓ #04
              </div>
              <div className="flex items-center gap-1.5">
                <button
                  disabled
                  className="px-3 py-1.5 bg-[#12151B] border border-[#282E3A] text-[#9CA3AF] rounded opacity-50 cursor-not-allowed"
                >
                  Anterior
                </button>
                <span className="px-3 py-1.5 bg-[#1A1E26] border border-[#f2ca50]/50 text-[#E5C875] font-bold rounded">
                  1
                </span>
                <button className="px-3 py-1.5 bg-[#12151B] border border-[#282E3A] text-[#F4F1EA] hover:border-[#f2ca50] rounded">
                  2
                </button>
                <button className="px-3 py-1.5 bg-[#12151B] border border-[#282E3A] text-[#F4F1EA] hover:border-[#f2ca50] rounded">
                  3
                </button>
                <button className="px-3 py-1.5 bg-[#12151B] border border-[#282E3A] text-[#F4F1EA] hover:text-[#E5C875] rounded">
                  Próximo
                </button>
              </div>
            </div>
          </section>
        </div>
      </main>

      {/* 6. FORENSIC PROTOCOLS & CUSTODY NODES BANNER */}
      <section className="border-t border-[#282E3A] bg-[#12151B] py-8">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-4 p-4 bg-[#08090B] border border-[#282E3A] rounded">
            <div className="p-2.5 bg-[#1A1E26] border border-[#C59B27]/30 rounded text-[#E5C875]">
              <span className="material-symbols-outlined text-xl">biotech</span>
            </div>
            <div>
              <h4 className="text-sm font-['Manrope'] font-bold text-[#F4F1EA] mb-1">
                Espectrometria &amp; DNA Forense
              </h4>
              <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                Cada fibra e material têxtil passa por varredura isotópica multiespectral com laudo imutável indexado ao registro do cofre.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-[#08090B] border border-[#282E3A] rounded">
            <div className="p-2.5 bg-[#1A1E26] border border-[#C59B27]/30 rounded text-[#E5C875]">
              <span className="material-symbols-outlined text-xl">account_balance</span>
            </div>
            <div>
              <h4 className="text-sm font-['Manrope'] font-bold text-[#F4F1EA] mb-1">
                Escrow Fiduciário Blindado
              </h4>
              <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                Valores são retidos em conta de liquidação bancária na Suíça até a entrega e vistoria pericial física presencial.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 bg-[#08090B] border border-[#282E3A] rounded">
            <div className="p-2.5 bg-[#1A1E26] border border-[#C59B27]/30 rounded text-[#E5C875]">
              <span className="material-symbols-outlined text-xl">local_shipping</span>
            </div>
            <div>
              <h4 className="text-sm font-['Manrope'] font-bold text-[#F4F1EA] mb-1">
                Remessa Blindada Segurada
              </h4>
              <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                Transporte internacional em caixa térmica com atmosfera modificada de argônio e escolta armada homologada Lloyd&apos;s of London.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Institutional Footer */}
      <Footer />

      {/* Direct Image Lightbox Modal */}
      <ImageModal
        isOpen={modalData.isOpen}
        onClose={() => setModalData({ ...modalData, isOpen: false })}
        imageUrl={modalData.imageUrl}
        title={modalData.title}
        subtitle={modalData.subtitle}
      />
    </div>
  );
}
