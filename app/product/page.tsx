'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RelayBar } from '@/components/RelayBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ImageModal } from '@/components/ImageModal';
import { RELIC_IMAGES } from '@/lib/relics-data';

export default function ProductPage() {
  const [activeTab, setActiveTab] = useState<'provenance' | 'specs' | 'transport'>('provenance');
  const [magnification, setMagnification] = useState<'1.0x' | '4.5x' | '8k'>('4.5x');
  const [lightFilter, setLightFilter] = useState<'normal' | 'uv' | 'raking'>('normal');

  // Interactive specimen angle views
  const specimenAngles = [
    {
      id: 'macro',
      label: 'Foco Macro #10',
      badge: 'MACRO 8K',
      url: RELIC_IMAGES.peleProductMacro,
      desc: 'Detalhe macro do número 10 e assinatura do Rei Pelé',
    },
    {
      id: 'front',
      label: 'Frente Canarinho #10',
      badge: 'VISTA TOTAL',
      url: RELIC_IMAGES.peleProductFullFront,
      desc: 'Visão panorâmica da camisa do Tricampeonato Mundial de 1970',
    },
    {
      id: 'signature',
      label: 'Autógrafo Caligráfico',
      badge: 'ASSINATURA',
      url: RELIC_IMAGES.peleProductSignature,
      desc: 'Varredura óptica do traço original em tinta nankin caligráfica',
    },
    {
      id: 'weave',
      label: 'Trama & Etiqueta 1970',
      badge: 'ETIQUETA',
      url: RELIC_IMAGES.peleProductFabricWeave,
      desc: 'Trama de algodão puro Athleta com densidade 180g/m²',
    },
    {
      id: 'coa',
      label: 'Lacre Físico COA-9801',
      badge: 'COA SEAL',
      url: RELIC_IMAGES.peleProductCoaDoc,
      desc: 'Certificado físico notarial com lacre inviolável e selo dourado',
    },
  ];

  const [activeAngle, setActiveAngle] = useState(specimenAngles[0]);
  const [bidValue, setBidValue] = useState(4900000);
  const [downloadingReport, setDownloadingReport] = useState(false);
  const [reportDownloaded, setReportDownloaded] = useState(false);
  const [showInspectionModal, setShowInspectionModal] = useState(false);
  const [inspectionSuccess, setInspectionSuccess] = useState(false);
  const [showConcierge, setShowConcierge] = useState(false);

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

  const handleIncrement = (amount: number) => {
    setBidValue((prev) => prev + amount);
  };

  const handleDownloadPdf = () => {
    setDownloadingReport(true);
    setTimeout(() => {
      setDownloadingReport(false);
      setReportDownloaded(true);
      setTimeout(() => setReportDownloaded(false), 4000);
    }, 1500);
  };

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
      <Navbar />

      {/* Breadcrumbs & Metadata Bar */}
      <div className="bg-[#12151B] border-b border-[#282E3A] py-3 px-4 sm:px-6 md:px-12">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3 text-xs font-['Space_Grotesk']">
          <nav aria-label="Trilha de Auditoria" className="flex items-center gap-2 text-[#9CA3AF]">
            <Link href="/" className="hover:text-[#E5C875] transition-colors">
              Início
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <Link href="/catalog" className="hover:text-[#E5C875] transition-colors">
              Futebol Histórico
            </Link>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-[#F4F1EA]">Copa de 1970 México</span>
            <span className="material-symbols-outlined text-xs">chevron_right</span>
            <span className="text-[#f2ca50] font-semibold">Lote Soberano #PEL-1970-MEX</span>
          </nav>

          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 bg-[#08090B] border border-[#10B981]/50 text-[#10B981] text-[11px] rounded font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              AUTENTICIDADE HISTÓRICA GRAU MÁXIMO
            </span>
            <span className="hidden sm:inline-flex items-center gap-1 text-[#9CA3AF]">
              <span className="material-symbols-outlined text-sm">schedule</span>
              FECHAMENTO DO ESCROW: 03D 14H 22M
            </span>
          </div>
        </div>
      </div>

      {/* MAIN VIEWPORT (2 COLUMNS) */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 sm:px-6 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: FORENSIC OPTICAL VIEWPORT & SPECIMEN GALLERY (7 Col) */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            {/* Viewport Box */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg relative overflow-hidden group shadow-2xl">
              {/* Top Viewport Header */}
              <div className="flex items-center justify-between px-4 py-2.5 bg-[#1A1E26] border-b border-[#282E3A]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f2ca50] text-base">
                    center_focus_strong
                  </span>
                  <span className="text-xs font-['Space_Grotesk'] text-[#F4F1EA] tracking-widest font-semibold uppercase">
                    INSPEÇÃO ÓPTICA FORENSE · RESOLUÇÃO 8K ULTRA-MACRO
                  </span>
                </div>
                <button
                  onClick={() => openImage(activeAngle.url, activeAngle.label, activeAngle.desc)}
                  className="px-2 py-0.5 text-[10px] font-['Space_Grotesk'] bg-[#08090B] border border-[#282E3A] hover:border-[#f2ca50] text-[#E5C875] rounded flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                  <span>Link Direto HTML</span>
                </button>
              </div>

              {/* Main Image with Macro Reticle Overlay */}
              <div className="relative w-full aspect-[4/3] bg-[#08090B] flex items-center justify-center overflow-hidden">
                <img
                  src={activeAngle.url}
                  alt={activeAngle.desc}
                  style={{
                    transform:
                      magnification === '1.0x'
                        ? 'scale(1)'
                        : magnification === '4.5x'
                        ? 'scale(1.35)'
                        : 'scale(1.85)',
                    filter:
                      lightFilter === 'uv'
                        ? 'hue-rotate(180deg) saturate(1.8) contrast(1.2)'
                        : lightFilter === 'raking'
                        ? 'contrast(1.4) brightness(0.9)'
                        : 'none',
                    transition: 'all 0.4s ease-out',
                  }}
                  className="w-full h-full object-cover select-none cursor-pointer"
                  onClick={() => openImage(activeAngle.url, activeAngle.label, activeAngle.desc)}
                />

                {/* Macro Reticle & Coordinates Overlay */}
                <div className="absolute inset-0 pointer-events-none p-4 sm:p-6 flex flex-col justify-between macro-reticle">
                  <div className="flex justify-between items-start">
                    <div className="bg-[#08090B]/85 backdrop-blur-md border border-[#282E3A] p-2 rounded text-[11px] font-['Space_Grotesk'] space-y-0.5">
                      <div className="text-[#E5C875]">COORD: 19°18&apos;10.4&quot;N / 99°09&apos;01.5&quot;W</div>
                      <div className="text-[#9CA3AF]">FOCO: TINTA NANKIN CALIGRÁFICA #10</div>
                      <div className="text-[#10B981] flex items-center gap-1">
                        <span className="material-symbols-outlined text-xs">check_circle</span>
                        SEM ADULTERAÇÃO DE PIGMENTO
                      </div>
                    </div>

                    <div className="bg-[#08090B]/85 backdrop-blur-md border border-[#282E3A] px-2.5 py-1 rounded flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-ping"></span>
                      <span className="text-xs font-['Space_Grotesk'] text-[#F4F1EA] font-semibold">
                        {magnification === '1.0x'
                          ? '1.0X PANORÂMICA'
                          : magnification === '4.5x'
                          ? '4.5X ÓPTICO CONVERGENTE'
                          : '8K ULTRA-MICROESPECTRO'}
                      </span>
                    </div>
                  </div>

                  {/* Center Forensic Reticle */}
                  <div className="self-center flex flex-col items-center opacity-40 group-hover:opacity-80 transition-opacity">
                    <div className="w-24 h-24 border border-dashed border-[#E5C875]/60 rounded-full flex items-center justify-center relative">
                      <div className="w-2 h-2 bg-[#f2ca50] rounded-full"></div>
                      <span className="absolute -top-3 text-[9px] font-['Space_Grotesk'] text-[#E5C875] bg-[#08090B] px-1 rounded">
                        TRAÇO ORIGINAL
                      </span>
                      <div className="absolute w-full h-[1px] bg-[#E5C875]/40"></div>
                      <div className="absolute h-full w-[1px] bg-[#E5C875]/40"></div>
                    </div>
                  </div>

                  {/* Bottom Tags */}
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-[#08090B]/90 border border-[#282E3A] text-[10px] font-['Space_Grotesk'] text-[#F4F1EA] rounded">
                        Fibra: 100% Algodão 1970
                      </span>
                      <span className="px-2 py-0.5 bg-[#08090B]/90 border border-[#282E3A] text-[10px] font-['Space_Grotesk'] text-[#E5C875] rounded">
                        Espectro de Tinta Nankin Original
                      </span>
                    </div>
                    <div className="px-2 py-0.5 bg-[#08090B]/90 border border-[#282E3A] text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] rounded">
                      DELTA-E: 0.04 (CALIBRADO)
                    </div>
                  </div>
                </div>
              </div>

              {/* Viewport Control Bar: Magnification and Lighting Filter Toggles */}
              <div className="p-3 sm:p-4 bg-[#12151B] border-t border-[#282E3A] flex flex-wrap items-center justify-between gap-3 text-xs font-['Space_Grotesk']">
                <div className="flex items-center gap-1.5">
                  <span className="text-[#9CA3AF] mr-1 uppercase">AMPLIAÇÃO:</span>
                  <button
                    onClick={() => setMagnification('1.0x')}
                    className={`px-3 py-1 rounded transition-colors ${
                      magnification === '1.0x'
                        ? 'bg-[#f2ca50] text-[#08090B] font-bold'
                        : 'bg-[#1A1E26] text-[#9CA3AF] hover:text-[#E5C875] border border-[#282E3A]'
                    }`}
                  >
                    1.0x Panorâmica
                  </button>
                  <button
                    onClick={() => setMagnification('4.5x')}
                    className={`px-3 py-1 rounded transition-colors ${
                      magnification === '4.5x'
                        ? 'bg-[#f2ca50] text-[#08090B] font-bold'
                        : 'bg-[#1A1E26] text-[#9CA3AF] hover:text-[#E5C875] border border-[#282E3A]'
                    }`}
                  >
                    4.5x Assinatura
                  </button>
                  <button
                    onClick={() => setMagnification('8k')}
                    className={`px-3 py-1 rounded transition-colors ${
                      magnification === '8k'
                        ? 'bg-[#f2ca50] text-[#08090B] font-bold'
                        : 'bg-[#1A1E26] text-[#9CA3AF] hover:text-[#E5C875] border border-[#282E3A]'
                    }`}
                  >
                    8K Microespectro
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => setLightFilter(lightFilter === 'uv' ? 'normal' : 'uv')}
                    className={`p-1.5 rounded border transition-colors ${
                      lightFilter === 'uv'
                        ? 'bg-[#10B981] text-[#08090B] border-[#10B981]'
                        : 'bg-[#1A1E26] text-[#9CA3AF] border-[#282E3A] hover:text-[#f2ca50]'
                    }`}
                    title="Luz UV Espectral"
                  >
                    <span className="material-symbols-outlined text-base">wb_iridescent</span>
                  </button>
                  <button
                    onClick={() => setLightFilter(lightFilter === 'raking' ? 'normal' : 'raking')}
                    className={`p-1.5 rounded border transition-colors ${
                      lightFilter === 'raking'
                        ? 'bg-[#E5C875] text-[#08090B] border-[#E5C875]'
                        : 'bg-[#1A1E26] text-[#9CA3AF] border-[#282E3A] hover:text-[#f2ca50]'
                    }`}
                    title="Iluminação Rasante"
                  >
                    <span className="material-symbols-outlined text-base">exposure</span>
                  </button>
                  <button
                    onClick={() => openImage(activeAngle.url, activeAngle.label, activeAngle.desc)}
                    className="p-1.5 rounded bg-[#1A1E26] border border-[#282E3A] text-[#9CA3AF] hover:text-[#f2ca50] transition-colors"
                    title="Modo Ecrã Completo 8K"
                  >
                    <span className="material-symbols-outlined text-base">fullscreen</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Specimen Angle Thumbnails */}
            <div>
              <div className="flex items-center justify-between mb-2 text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                <span>ÂNGULOS FORENSES DE INSPEÇÃO (CLIQUE PARA ALTERNAR):</span>
                <span className="text-[#E5C875] font-semibold">{activeAngle.label}</span>
              </div>

              <div className="grid grid-cols-5 gap-2 sm:gap-3">
                {specimenAngles.map((angle) => {
                  const isSelected = activeAngle.id === angle.id;
                  return (
                    <div
                      key={angle.id}
                      onClick={() => setActiveAngle(angle)}
                      className={`cursor-pointer bg-[#12151B] rounded p-1.5 transition-all group ${
                        isSelected
                          ? 'border-2 border-[#f2ca50] bg-[#1A1E26]'
                          : 'border border-[#282E3A] hover:border-[#C59B27]'
                      }`}
                    >
                      <div className="w-full aspect-square bg-[#08090B] rounded overflow-hidden relative">
                        <img
                          src={angle.url}
                          alt={angle.label}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-1 right-1 text-[8px] font-['Space_Grotesk'] bg-[#08090B]/90 text-[#E5C875] px-1 rounded">
                          {angle.badge}
                        </span>
                      </div>
                      <p className="text-[10px] font-['Space_Grotesk'] text-[#F4F1EA] truncate mt-1 text-center">
                        {angle.label}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Forensic Safeguard Status & Download PDF button */}
            <div className="p-4 bg-[#12151B] border border-[#282E3A] rounded-lg flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded bg-[#08090B] border border-[#282E3A] flex items-center justify-center text-[#E5C875] shrink-0">
                  <span className="material-symbols-outlined text-xl">enhanced_encryption</span>
                </div>
                <div>
                  <p className="text-xs font-['Space_Grotesk'] text-[#E5C875] font-bold">
                    REGISTRO DE SALVAGUARDA FORENSE ATIVO
                  </p>
                  <p className="text-xs font-['Manrope'] text-[#9CA3AF]">
                    Amostras de tecido micro-espectrais coincidem 100% com o padrão oficial da CBD de 21 de junho de 1970.
                  </p>
                </div>
              </div>

              <button
                onClick={handleDownloadPdf}
                disabled={downloadingReport}
                className="whitespace-nowrap px-4 py-2 bg-[#1A1E26] hover:bg-[#282a2d] border border-[#282E3A] hover:border-[#f2ca50] text-[#F4F1EA] text-xs font-['Space_Grotesk'] rounded transition-colors flex items-center gap-1.5 shrink-0"
              >
                <span className="material-symbols-outlined text-base text-[#C59B27]">
                  {downloadingReport ? 'sync' : reportDownloaded ? 'check_circle' : 'download'}
                </span>
                <span>
                  {downloadingReport
                    ? 'Gerando Laudo...'
                    : reportDownloaded
                    ? 'Laudo Baixado!'
                    : 'Baixar Relatório Forense (.PDF 48MB)'}
                </span>
              </button>
            </div>
          </section>

          {/* RIGHT COLUMN: ACQUISITION DOSSIER & ESCROW BID CARD (5 Col) */}
          <section className="lg:col-span-5 flex flex-col gap-6">
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-6 relative overflow-hidden shadow-2xl">
              {/* Subtle ambient light */}
              <div className="absolute -top-20 -right-20 w-44 h-44 bg-[#f2ca50]/5 rounded-full blur-3xl pointer-events-none"></div>

              {/* Badges */}
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-2.5 py-1 bg-[#08090B] border border-[#C59B27]/50 text-[#E5C875] text-[10px] font-['Space_Grotesk'] rounded flex items-center gap-1 font-semibold">
                  <span className="material-symbols-outlined text-xs">stars</span>
                  LOTE SOBERANO #001
                </span>
                <span className="px-2.5 py-1 bg-[#08090B] border border-[#10B981]/50 text-[#10B981] text-[10px] font-['Space_Grotesk'] rounded flex items-center gap-1 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  GRAU 9.8 ARCHIVAL
                </span>
                <span className="px-2.5 py-1 bg-[#1A1E26] border border-[#282E3A] text-[#F4F1EA] text-[10px] font-['Space_Grotesk'] rounded">
                  COA INVIOLÁVEL #COA-9801
                </span>
              </div>

              {/* Title */}
              <h1 className="text-xl sm:text-2xl font-['Playfair_Display'] font-bold text-[#F4F1EA] leading-tight mb-2.5">
                Edson Arantes do Nascimento (Pelé) — Manto Final da Copa de 1970 (Brasil 4 x 1 Itália)
              </h1>

              <p className="text-xs font-['Manrope'] text-[#9CA3AF] mb-5 leading-relaxed">
                Exemplar histórico utilizado no segundo tempo da consagração do Tricampeonato Mundial no Estádio Azteca. Apresenta numeração #10 aveludada original e dedicatória assinada na concentração.
              </p>

              {/* Cryptographic block */}
              <div className="bg-[#08090B] border border-[#282E3A] rounded p-3 mb-5 space-y-2 text-xs font-['Space_Grotesk']">
                <div className="flex items-center justify-between">
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#f2ca50]">token</span>
                    HASH BLOCKCHAIN SHA-256:
                  </span>
                  <span className="text-[#E5C875] font-mono truncate max-w-[180px]">
                    0x7f83b165...126d9069
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#10B981]">verified</span>
                    APÓLICE LLOYD&apos;S SYNDICATE:
                  </span>
                  <span className="text-[#F4F1EA] font-semibold">#LL-BR70-98402 (COBERTURA TOTAL)</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[#9CA3AF] flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#9CA3AF]">warehouse</span>
                    CUSTÓDIA FÍSICA:
                  </span>
                  <span className="text-[#9CA3AF]">Cofre Alta Segurança Genebra (Freeport)</span>
                </div>
              </div>

              {/* Valuation */}
              <div className="border-t border-b border-[#282E3A] py-4 mb-5">
                <div className="flex items-baseline justify-between mb-1">
                  <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] tracking-wider uppercase font-semibold">
                    Valor Fiduciário em Escrow
                  </span>
                  <span className="text-[10px] font-['Space_Grotesk'] text-[#10B981] font-bold uppercase">
                    RESERVA SUPERADA
                  </span>
                </div>

                <div className="flex items-baseline gap-3">
                  <span className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#f2ca50]">
                    R$ 4.850.000
                  </span>
                  <span className="font-['Space_Grotesk'] text-sm text-[#9CA3AF] font-normal">
                    (USD $1,000,000)
                  </span>
                </div>

                <div className="flex items-center gap-1.5 mt-2 text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                  <span className="material-symbols-outlined text-sm text-[#E5C875]">lock_clock</span>
                  <span>Garantia de custódia blindada e liquidação direta em Smart Contract</span>
                </div>
              </div>

              {/* Stepper increment */}
              <div className="space-y-4 mb-5">
                <div>
                  <div className="flex justify-between items-center text-xs font-['Space_Grotesk'] mb-1.5">
                    <label htmlFor="bid-input" className="text-[#F4F1EA] uppercase font-semibold">
                      DEFINIR LANCE QUALIFICADO (INCREMENTO MÍN. R$ 50.000)
                    </label>
                    <span className="text-[#E5C875]">TAXA PREMIUM: 3.5%</span>
                  </div>

                  <div className="flex rounded border border-[#282E3A] bg-[#08090B] focus-within:border-[#f2ca50]">
                    <span className="inline-flex items-center px-3.5 text-[#9CA3AF] font-['Space_Grotesk'] text-sm border-r border-[#282E3A]">
                      R$
                    </span>
                    <input
                      id="bid-input"
                      type="text"
                      value={bidValue.toLocaleString('pt-BR') + ',00'}
                      onChange={(e) => {
                        const numeric = Number(e.target.value.replace(/\D/g, ''));
                        if (!isNaN(numeric)) setBidValue(numeric);
                      }}
                      className="w-full bg-transparent border-none text-[#F4F1EA] font-['Space_Grotesk'] text-sm px-3 py-2.5 focus:outline-none"
                    />
                    <button
                      onClick={() => handleIncrement(50000)}
                      className="px-3 text-[#9CA3AF] hover:text-[#E5C875] font-['Space_Grotesk'] border-l border-[#282E3A] text-xs transition-colors"
                    >
                      +50K
                    </button>
                    <button
                      onClick={() => handleIncrement(100000)}
                      className="px-3 text-[#9CA3AF] hover:text-[#E5C875] font-['Space_Grotesk'] border-l border-[#282E3A] text-xs transition-colors"
                    >
                      +100K
                    </button>
                  </div>
                </div>

                {/* Primary Button */}
                <Link
                  href="/checkout"
                  className="w-full block text-center py-3.5 px-6 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-['Manrope'] font-bold text-xs uppercase tracking-wider rounded transition-all shadow-[0_0_25px_rgba(212,175,55,0.25)] flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-lg">security</span>
                  DAR LANCE EM ESCROW BLINDADO / ADQUIRIR CUSTÓDIA
                </Link>

                {/* Secondary Button */}
                <button
                  onClick={() => setShowInspectionModal(true)}
                  className="w-full py-2.5 px-4 bg-[#1A1E26] hover:bg-[#282a2d] border border-[#C59B27]/60 hover:border-[#f2ca50] text-[#F4F1EA] font-['Manrope'] font-semibold text-xs rounded transition-all flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-base text-[#E5C875]">
                    event_seat
                  </span>
                  Agendar Inspeção Presencial em Genebra / São Paulo
                </button>
              </div>

              <div className="pt-3 border-t border-[#282E3A] flex items-center justify-between text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#10B981] text-sm">verified_user</span>
                  <span>Custódia Brink&apos;s Global</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[#E5C875] text-sm">balance</span>
                  <span>Arbitragem CCI Paris</span>
                </div>
              </div>
            </div>

            {/* Concierge card */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#1A1E26] border border-[#282E3A] flex items-center justify-center text-[#f2ca50]">
                  <span className="material-symbols-outlined">support_agent</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-[#F4F1EA]">
                    Curador: Dr. Marcelo V. Soares
                  </p>
                  <p className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                    Mesa de Operações Fiduciárias
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowConcierge(true)}
                className="px-3 py-1.5 bg-[#08090B] border border-[#282E3A] hover:border-[#E5C875] text-[#E5C875] text-xs font-['Space_Grotesk'] rounded transition-colors"
              >
                Contatar Concierge
              </button>
            </div>
          </section>
        </div>

        {/* 5. TECHNICAL & FORENSIC DOSSIER TABS */}
        <section className="mt-12 bg-[#12151B] border border-[#282E3A] rounded-lg overflow-hidden">
          {/* Tab Header Buttons */}
          <div className="flex flex-wrap items-center border-b border-[#282E3A] bg-[#1A1E26] px-4 md:px-6">
            <button
              onClick={() => setActiveTab('provenance')}
              className={`py-3.5 px-5 text-xs font-['Space_Grotesk'] font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'provenance'
                  ? 'border-[#f2ca50] text-[#f2ca50]'
                  : 'border-transparent text-[#9CA3AF] hover:text-[#F4F1EA]'
              }`}
            >
              <span className="material-symbols-outlined text-base">history_edu</span>
              Laudo Pericial &amp; Proveniência
            </button>

            <button
              onClick={() => setActiveTab('specs')}
              className={`py-3.5 px-5 text-xs font-['Space_Grotesk'] font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'specs'
                  ? 'border-[#f2ca50] text-[#f2ca50]'
                  : 'border-transparent text-[#9CA3AF] hover:text-[#F4F1EA]'
              }`}
            >
              <span className="material-symbols-outlined text-base">biotech</span>
              Especificações Técnicas &amp; C14
            </button>

            <button
              onClick={() => setActiveTab('transport')}
              className={`py-3.5 px-5 text-xs font-['Space_Grotesk'] font-bold flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'transport'
                  ? 'border-[#f2ca50] text-[#f2ca50]'
                  : 'border-transparent text-[#9CA3AF] hover:text-[#F4F1EA]'
              }`}
            >
              <span className="material-symbols-outlined text-base">local_shipping</span>
              Garantias de Transporte Blindado
            </button>
          </div>

          {/* TAB 1: Provenance Timeline */}
          {activeTab === 'provenance' && (
            <div className="p-6 md:p-8 space-y-8 animate-fadeIn">
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#282E3A] gap-3">
                <div>
                  <h3 className="text-lg sm:text-xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
                    Linha do Tempo Ininterrupta de Custódia (1970 – Presente)
                  </h3>
                  <p className="text-xs font-['Manrope'] text-[#9CA3AF]">
                    Cadeia de custódia forense documentada por cartórios notariais e autenticação de manuscritos.
                  </p>
                </div>
                <span className="px-3 py-1 bg-[#08090B] border border-[#10B981] text-[#10B981] text-[10px] font-['Space_Grotesk'] font-bold rounded">
                  CADEIA DE CUSTÓDIA 100% AUDITADA
                </span>
              </div>

              <div className="relative pl-6 md:pl-10 space-y-6 before:content-[''] before:absolute before:left-2 md:before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#282E3A]">
                {/* Event 1 */}
                <div className="relative group">
                  <div className="absolute -left-[31px] md:-left-[39px] top-1 w-3.5 h-3.5 rounded-full bg-[#f2ca50] border-4 border-[#12151B]"></div>
                  <div className="bg-[#08090B] border border-[#282E3A] rounded p-4 group-hover:border-[#C59B27] transition-colors">
                    <div className="flex flex-wrap items-center justify-between text-xs font-['Space_Grotesk'] mb-1">
                      <span className="text-[#E5C875] font-bold">
                        21 DE JUNHO DE 1970 · CIDADE DO MÉXICO
                      </span>
                      <span className="text-[#9CA3AF]">ESTÁDIO AZTECA (FINAL DA COPA)</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#F4F1EA] mb-1">
                      Utilização no Jogo Oficial e Entrega Direta ao Roupeiro da CBD
                    </h4>
                    <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                      Manto utilizado no segundo tempo do histórico Brasil 4 x 1 Itália. Ao término da comemoração no gramado, o próprio camisa 10 assinou o manto na presença do corpo técnico e o entregou ao chefe de rouparia da delegação brasileira, Mário Américo / Almir de Almeida.
                    </p>
                  </div>
                </div>

                {/* Event 2 */}
                <div className="relative group">
                  <div className="absolute -left-[31px] md:-left-[39px] top-1 w-3.5 h-3.5 rounded-full bg-[#C59B27] border-4 border-[#12151B]"></div>
                  <div className="bg-[#08090B] border border-[#282E3A] rounded p-4 group-hover:border-[#C59B27] transition-colors">
                    <div className="flex flex-wrap items-center justify-between text-xs font-['Space_Grotesk'] mb-1">
                      <span className="text-[#E5C875] font-bold">
                        1970 A 2004 · RIO DE JANEIRO, BRASIL
                      </span>
                      <span className="text-[#9CA3AF]">ACERVO FAMILIAR PRIVADO</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#F4F1EA] mb-1">
                      Guarda Conservativa em Museu Particular do Roupeiro
                    </h4>
                    <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                      A relíquia permaneceu guardada em câmara escura sob umidade controlada pela família do auxiliar técnico, sem sofrer lavagens químicas abrasivas, mantendo os traços autênticos de transpiração, grama do Azteca e a integridade total da numeração de veludo.
                    </p>
                  </div>
                </div>

                {/* Event 3 */}
                <div className="relative group">
                  <div className="absolute -left-[31px] md:-left-[39px] top-1 w-3.5 h-3.5 rounded-full bg-[#10B981] border-4 border-[#12151B]"></div>
                  <div className="bg-[#08090B] border border-[#282E3A] rounded p-4 group-hover:border-[#10B981] transition-colors">
                    <div className="flex flex-wrap items-center justify-between text-xs font-['Space_Grotesk'] mb-1">
                      <span className="text-[#10B981] font-bold">
                        OUTUBRO DE 2023 · GENEBRA / SÃO PAULO
                      </span>
                      <span className="text-[#9CA3AF]">VAULT DIAMOND RELICS INTERNACIONAL</span>
                    </div>
                    <h4 className="text-sm font-bold text-[#F4F1EA] mb-1">
                      Aquisição Institucional &amp; Emissão do Laudo COA-9801
                    </h4>
                    <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                      Aquisição consolidada por sindicato fiduciário com laudo grafotécnico emitido pelo Instituto Forense Internacional de Zurique e submissão aos testes de fibra orgânica C14 e espectroscopia Raman. Registro imutável lavrado em Ledger SHA-256.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Tech Specs */}
          {activeTab === 'specs' && (
            <div className="p-6 md:p-8 space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-[#282E3A]">
                <h3 className="text-lg sm:text-xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
                  Ficha Técnica Laboratorial &amp; Conservação
                </h3>
                <p className="text-xs font-['Manrope'] text-[#9CA3AF]">
                  Resultados da espectrometria de massa, testes de datação radiocarbono e especificações de vitrine selada.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-['Space_Grotesk']">
                <div className="bg-[#08090B] border border-[#282E3A] p-4 rounded">
                  <span className="text-[10px] text-[#E5C875] uppercase font-bold">COMPOSIÇÃO TÊXTIL</span>
                  <p className="text-sm font-bold text-[#F4F1EA] mt-1 font-['Manrope']">
                    100% Algodão Mercerizado 1970
                  </p>
                  <p className="text-[#9CA3AF] mt-1 text-[11px] font-['Manrope']">
                    Trama tubular de época com densidade de 180g/m², manufatura Athleta clássica.
                  </p>
                </div>

                <div className="bg-[#08090B] border border-[#282E3A] p-4 rounded">
                  <span className="text-[10px] text-[#E5C875] uppercase font-bold">DATAÇÃO RADIOCARBONO (C14)</span>
                  <p className="text-sm font-bold text-[#F4F1EA] mt-1 font-['Manrope']">
                    Calibração: 1968 – 1971 d.C.
                  </p>
                  <p className="text-[#9CA3AF] mt-1 text-[11px] font-['Manrope']">
                    Nível de certeza 99.4% compatível com a colheita de algodão brasileira pré-1970.
                  </p>
                </div>

                <div className="bg-[#08090B] border border-[#282E3A] p-4 rounded">
                  <span className="text-[10px] text-[#E5C875] uppercase font-bold">PIGMENTO DA ASSINATURA</span>
                  <p className="text-sm font-bold text-[#F4F1EA] mt-1 font-['Manrope']">
                    Nankin com Negro de Fumo Histórico
                  </p>
                  <p className="text-[#9CA3AF] mt-1 text-[11px] font-['Manrope']">
                    Penetração capilar confirmada via microscopia confocal de varredura laser.
                  </p>
                </div>

                <div className="bg-[#08090B] border border-[#282E3A] p-4 rounded">
                  <span className="text-[10px] text-[#E5C875] uppercase font-bold">DIMENSÕES &amp; PESO EXATO</span>
                  <p className="text-sm font-bold text-[#F4F1EA] mt-1 font-['Manrope']">
                    71.5 cm x 53.0 cm · 214.2 g
                  </p>
                  <p className="text-[#9CA3AF] mt-1 text-[11px] font-['Manrope']">
                    Medição milimétrica a laser com tolerância de ±0.05 mm em atmosfera neutra.
                  </p>
                </div>

                <div className="bg-[#08090B] border border-[#282E3A] p-4 rounded">
                  <span className="text-[10px] text-[#E5C875] uppercase font-bold">CÂMARA DE ENCAPSULAMENTO</span>
                  <p className="text-sm font-bold text-[#F4F1EA] mt-1 font-['Manrope']">
                    Gás Inerte Argônio Puro (Ar)
                  </p>
                  <p className="text-[#9CA3AF] mt-1 text-[11px] font-['Manrope']">
                    Caixa de acrílico aeroespacial blindado antirreflexo com bloqueio UV 99.9%.
                  </p>
                </div>

                <div className="bg-[#08090B] border border-[#282E3A] p-4 rounded">
                  <span className="text-[10px] text-[#E5C875] uppercase font-bold">MICROCLIMA INTERNO</span>
                  <p className="text-sm font-bold text-[#F4F1EA] mt-1 font-['Manrope']">
                    19.5°C Constante / 48% UR
                  </p>
                  <p className="text-[#9CA3AF] mt-1 text-[11px] font-['Manrope']">
                    Monitoramento por telemetria IoT criptografada 24 horas ao dia com backup satelital.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Armored Transport */}
          {activeTab === 'transport' && (
            <div className="p-6 md:p-8 space-y-6 animate-fadeIn">
              <div className="pb-4 border-b border-[#282E3A]">
                <h3 className="text-lg sm:text-xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
                  Logística Tática Fiduciária Brink&apos;s Nível IV
                </h3>
                <p className="text-xs font-['Manrope'] text-[#9CA3AF]">
                  Protocolo de entrega segura &apos;Door-to-Vault&apos; com escolta armada e apólice global inclusa na arrematação.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="border border-[#282E3A] bg-[#08090B] p-5 rounded space-y-2.5">
                  <div className="w-10 h-10 rounded bg-[#1A1E26] flex items-center justify-center text-[#f2ca50]">
                    <span className="material-symbols-outlined text-2xl">shield</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#F4F1EA] font-['Manrope']">
                    Veículo Blindado Nível IV
                  </h4>
                  <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                    Transporte terrestre operado por comboio tático blindado Brink&apos;s Secure Logistics com suporte de rastreamento militar ativo e cabine estanque.
                  </p>
                </div>

                <div className="border border-[#282E3A] bg-[#08090B] p-5 rounded space-y-2.5">
                  <div className="w-10 h-10 rounded bg-[#1A1E26] flex items-center justify-center text-[#E5C875]">
                    <span className="material-symbols-outlined text-2xl">flight_takeoff</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#F4F1EA] font-['Manrope']">
                    Fretamento Aéreo Dedicado
                  </h4>
                  <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                    Para entregas internacionais (Zurique, Nova York, Londres, Dubai ou São Paulo), voo com cofre hermético a bordo e despachante alfandegário exclusivo.
                  </p>
                </div>

                <div className="border border-[#282E3A] bg-[#08090B] p-5 rounded space-y-2.5">
                  <div className="w-10 h-10 rounded bg-[#1A1E26] flex items-center justify-center text-[#10B981]">
                    <span className="material-symbols-outlined text-2xl">handshake</span>
                  </div>
                  <h4 className="text-sm font-bold text-[#F4F1EA] font-['Manrope']">
                    Entrega Luva-Branca Privada
                  </h4>
                  <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                    Transferência de custódia presencial conduzida pelo Curador-Chefe Diamond Relics diretamente no cofre ou residência do adquirente mediante biometria.
                  </p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Institutional Footer */}
      <Footer />

      {/* Lightbox Modal */}
      <ImageModal
        isOpen={modalData.isOpen}
        onClose={() => setModalData({ ...modalData, isOpen: false })}
        imageUrl={modalData.imageUrl}
        title={modalData.title}
        subtitle={modalData.subtitle}
      />

      {/* Inspection Booking Modal */}
      {showInspectionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#1A1E26] border border-[#f2ca50] rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#282E3A] pb-3">
              <h3 className="font-['Playfair_Display'] font-bold text-base text-[#F4F1EA]">
                Agendar Vistoria Presencial Privada
              </h3>
              <button
                onClick={() => {
                  setShowInspectionModal(false);
                  setInspectionSuccess(false);
                }}
                className="text-[#9CA3AF] hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {inspectionSuccess ? (
              <div className="text-center py-6 space-y-3">
                <span className="material-symbols-outlined text-4xl text-[#10B981]">
                  verified_user
                </span>
                <h4 className="font-bold text-[#F4F1EA]">Solicitação de Acesso Registrada</h4>
                <p className="text-xs text-[#9CA3AF]">
                  Protocolo fiduciário #VST-PEL-70 emitido. O protocolo de biometria para a bóveda será enviado ao seu procurador.
                </p>
                <button
                  onClick={() => {
                    setShowInspectionModal(false);
                    setInspectionSuccess(false);
                  }}
                  className="px-4 py-2 bg-[#f2ca50] text-[#08090B] font-bold text-xs rounded"
                >
                  Fechar
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setInspectionSuccess(true);
                }}
                className="space-y-3 text-xs font-['Space_Grotesk']"
              >
                <div>
                  <label className="block text-[#9CA3AF] mb-1">Local da Inspeção Óptica</label>
                  <select className="w-full bg-[#12151B] border border-[#282E3A] p-2 rounded text-[#F4F1EA]">
                    <option>Geneva Freeport (Suíça) - Bóveda #G-44</option>
                    <option>São Paulo Bandeirantes Safe Facility</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#9CA3AF] mb-1">Data Pretendida</label>
                  <input
                    type="date"
                    required
                    defaultValue="2026-09-20"
                    className="w-full bg-[#12151B] border border-[#282E3A] p-2 rounded text-[#F4F1EA]"
                  />
                </div>
                <div>
                  <label className="block text-[#9CA3AF] mb-1">Equipamento Requisitado</label>
                  <div className="space-y-1 text-[#F4F1EA]">
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="text-[#f2ca50]" />
                      <span>Microscópio Óptico Confocal Laser 8K</span>
                    </label>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" defaultChecked className="text-[#f2ca50]" />
                      <span>Câmara de Espectrometria UV-IR</span>
                    </label>
                  </div>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-bold uppercase rounded mt-2"
                >
                  Emitir Credencial Provisória
                </button>
              </form>
            )}
          </div>
        </div>
      )}

      {/* Concierge Drawer/Modal */}
      {showConcierge && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#1A1E26] border border-[#E5C875] rounded-lg max-w-sm w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#282E3A] pb-2.5">
              <span className="text-xs font-bold text-[#E5C875] font-['Space_Grotesk']">
                MESA DE OPERAÇÕES FIDUCIÁRIAS
              </span>
              <button onClick={() => setShowConcierge(false)} className="text-[#9CA3AF] hover:text-white">
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="text-center space-y-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#12151B] border border-[#f2ca50] flex items-center justify-center text-[#f2ca50] text-2xl">
                <span className="material-symbols-outlined text-2xl">support_agent</span>
              </div>
              <h4 className="font-bold text-sm text-[#F4F1EA]">Dr. Marcelo V. Soares</h4>
              <p className="text-xs text-[#9CA3AF]">
                Curador Sênior e Especialista em Memorabilia Esportiva da FIFA e CBD
              </p>
              <div className="p-3 bg-[#12151B] rounded border border-[#282E3A] text-left text-xs font-['Space_Grotesk'] space-y-1">
                <div>Canal Direto: +41 22 819 9002 (Genebra)</div>
                <div>Chave PGP: 0x9B44F128A</div>
                <div className="text-[#10B981]">Status: Disponível para chamada segura</div>
              </div>
            </div>
            <button
              onClick={() => setShowConcierge(false)}
              className="w-full py-2 bg-[#f2ca50] text-[#08090B] font-bold text-xs uppercase rounded"
            >
              Iniciar Conexão Segura
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
