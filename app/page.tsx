'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RelayBar } from '@/components/RelayBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ImageModal } from '@/components/ImageModal';
import { RELIC_IMAGES } from '@/lib/relics-data';

export default function HomePage() {
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

  const [coaQuery, setCoaQuery] = useState('COA-PEL-1970-MEX-9801');
  const [searchResult, setSearchResult] = useState<null | {
    found: boolean;
    title: string;
    status: string;
    facility: string;
    policy: string;
    hash: string;
  }>({
    found: true,
    title: 'Edson Arantes do Nascimento (Pelé) 1970 Match-Worn Shirt',
    status: 'CUSTODIADO NO COFRE SUÍÇO',
    facility: 'Geneva Freeport Safe Deposit Box 84 • Nó Ativo: Zurich Core-01',
    policy: "Lloyd's Syndicate #842 UK (Cobertura Integral)",
    hash: '7d1f893e38fa09e1c49830ef89a12c8b74f3014a51e6d30294b05a76e4c',
  });

  const [showConciergeModal, setShowConciergeModal] = useState(false);
  const [conciergeSuccess, setConciergeSuccess] = useState(false);

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
        title: 'Edson Arantes do Nascimento (Pelé) 1970 Match-Worn Shirt',
        status: 'CUSTODIADO NO COFRE SUÍÇO',
        facility: 'Geneva Freeport Safe Deposit Box 84 • Nó Ativo: Zurich Core-01',
        policy: "Lloyd's Syndicate #842 UK (Cobertura Integral)",
        hash: '7d1f893e38fa09e1c49830ef89a12c8b74f3014a51e6d30294b05a76e4c',
      });
    } else if (coaQuery.toLowerCase().includes('sen') || coaQuery.toLowerCase().includes('1991')) {
      setSearchResult({
        found: true,
        title: 'Ayrton Senna 1991 McLaren Bell GP3 Helmet Interlagos',
        status: 'CUSTÓDIA CONFIRMADA',
        facility: 'Vault São Paulo Bandeirantes Facility',
        policy: "Lloyd's Syndicate #SEN-9104 (Validação FIA)",
        hash: '4f81c9a0912dfbc78e019a823dcbe9102948bcda819273461028394012bc0a19',
      });
    } else {
      setSearchResult({
        found: true,
        title: `Lote Registrado no Ledger: #${coaQuery.toUpperCase()}`,
        status: 'HASH VERIFICADO IMUTÁVEL',
        facility: 'Swiss Freeport Vault Node Primário',
        policy: "Apólice All-Risks Lloyd's of London Ativa",
        hash: 'a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0',
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

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B] text-[#e2e2e6] selection:bg-[#d4af37] selection:text-[#08090B]">
      {/* 1. Global Navigation Relay Bar */}
      <RelayBar />

      {/* Top Main Institutional Nav Bar */}
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-10 pb-20 md:pt-16 md:pb-28 overflow-hidden border-b border-[#282E3A]/70 micro-grid">
        {/* Radial Gold Ambient Glow */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[450px] bg-[#f2ca50]/5 rounded-full blur-[130px] pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          {/* Archival Meta Ribbon */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 bg-[#12151B] border border-[#282E3A] rounded mb-6 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-[#10B981] animate-ping"></span>
            <span className="text-xs font-['Space_Grotesk'] text-[#E5C875] tracking-widest uppercase">
              Acervo Fiduciário &amp; Registro Criptográfico Soberano
            </span>
            <span className="text-[#282E3A]">|</span>
            <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
              GENEVA FREEPORT NODE 09-LX
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Hero Left Column */}
            <div className="lg:col-span-7 flex flex-col gap-6">
              <h1 className="text-3xl sm:text-5xl lg:text-6xl font-['Playfair_Display'] font-bold text-[#F4F1EA] leading-[1.12] tracking-tight">
                Relíquias Soberanas da História Esportiva Mundial
              </h1>

              <p className="text-base sm:text-lg font-['Manrope'] text-[#9CA3AF] max-w-2xl leading-relaxed">
                Custódia fiduciária, espectrometria molecular de fibras e datação isotópica de memorabilia lendária. Cada peça é blindada sob protocolos bancários suíços e apólices syndicadas do Lloyd&apos;s de Londres.
              </p>

              {/* Verification Specs Bar */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#282E3A]/70">
                <div>
                  <span className="block font-['Space_Grotesk'] text-[#C59B27] text-lg sm:text-xl font-bold">
                    8K Macro
                  </span>
                  <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase">
                    Espectroscopia UV
                  </span>
                </div>
                <div>
                  <span className="block font-['Space_Grotesk'] text-[#C59B27] text-lg sm:text-xl font-bold">
                    Grau 9.8
                  </span>
                  <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase">
                    COA Archival Level
                  </span>
                </div>
                <div>
                  <span className="block font-['Space_Grotesk'] text-[#C59B27] text-lg sm:text-xl font-bold">
                    100% Blindado
                  </span>
                  <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase">
                    Seguro Lloyd&apos;s UK
                  </span>
                </div>
              </div>

              {/* Primary CTAs */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <Link
                  href="/product"
                  className="px-6 sm:px-7 py-3.5 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-['Manrope'] font-bold text-sm tracking-wider uppercase transition-all duration-200 shadow-[0_0_25px_rgba(212,175,55,0.3)] flex items-center gap-2.5 rounded"
                >
                  <span className="material-symbols-outlined text-lg">search</span>
                  Inspecionar Lote Pelé 1970
                </Link>

                <Link
                  href="/catalog"
                  className="px-6 sm:px-7 py-3.5 bg-[#12151B] border border-[#594A2B] hover:border-[#f2ca50] text-[#F4F1EA] hover:text-[#f2ca50] font-['Manrope'] font-semibold text-sm transition-all duration-200 flex items-center gap-2 rounded"
                >
                  <span className="material-symbols-outlined text-lg">inventory_2</span>
                  Explorar Catálogo Privado
                </Link>
              </div>

              {/* Micro Forensic Status */}
              <div className="flex items-center gap-3 font-['Space_Grotesk'] text-xs text-[#9CA3AF] pt-2">
                <span className="text-[#10B981] flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">lock_open</span>
                  SHA-256 Ledger
                </span>
                <span className="font-mono text-[11px]">7d1f893e...38fa09e1</span>
                <span>•</span>
                <span className="text-[#C59B27]">Armored Escrow Ready</span>
              </div>
            </div>

            {/* Hero Right Column: Master Lot Holographic Bay */}
            <div className="lg:col-span-5">
              <div className="relative bg-[#1A1E26] border border-[#f2ca50]/30 p-5 sm:p-6 rounded-lg gold-glow group">
                <div className="flex justify-between items-center pb-3 border-b border-[#282E3A]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#10B981]/15 border border-[#10B981]/40 text-[#10B981] text-[11px] font-['Space_Grotesk'] font-bold rounded uppercase">
                      COA GRAU 9.8
                    </span>
                    <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase">
                      LOTE SOBERANO #001
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#F59E0B] font-['Space_Grotesk'] text-xs">
                    <span className="w-2 h-2 rounded-full bg-[#F59E0B] animate-pulse"></span>
                    LANCE ATIVO
                  </div>
                </div>

                {/* Item Artifact Photo Display with Museum Vignette */}
                <div className="relative aspect-square my-4 overflow-hidden border border-[#282E3A] bg-[#08090B] rounded">
                  <img
                    src={RELIC_IMAGES.homeHeroPele}
                    alt="Manto Final Copa 1970 Autografado por Pelé"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 cursor-pointer"
                    onClick={() =>
                      openImage(
                        RELIC_IMAGES.homeHeroPele,
                        'Manto Pelé Copa 1970',
                        'Camisa Final Azteca 1970 sob iluminação de preservação museológica'
                      )
                    }
                  />

                  {/* Direct link button on top right of the image */}
                  <button
                    onClick={() =>
                      openImage(
                        RELIC_IMAGES.homeHeroPele,
                        'Manto Pelé Copa 1970',
                        'Camisa Final Azteca 1970'
                      )
                    }
                    className="absolute top-2.5 right-2.5 bg-[#08090B]/90 hover:bg-[#1A1E26] border border-[#282E3A] hover:border-[#f2ca50] text-[#E5C875] text-[10px] font-['Space_Grotesk'] px-2 py-1 rounded flex items-center gap-1 transition-colors"
                    title="Ver Imagem Original Direta em HTML"
                  >
                    <span className="material-symbols-outlined text-xs">open_in_new</span>
                    <span>Link Direto</span>
                  </button>

                  <div className="absolute bottom-3 left-3 right-3 p-2.5 bg-[#08090B]/90 border border-[#282E3A] backdrop-blur-sm flex justify-between items-end rounded">
                    <div>
                      <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
                        Datação Radiológica
                      </span>
                      <span className="font-['Space_Grotesk'] text-[#E5C875] text-xs font-semibold">
                        Junho 1970 • Cidade do México
                      </span>
                    </div>
                    <span className="px-2 py-0.5 bg-[#12151B] border border-[#f2ca50]/40 text-[#f2ca50] text-[10px] font-['Space_Grotesk'] rounded">
                      8K INSPECTION ON
                    </span>
                  </div>
                </div>

                {/* Artifact Meta & Bid Counter */}
                <div className="space-y-3">
                  <div>
                    <p className="text-[11px] font-['Space_Grotesk'] text-[#C59B27] uppercase tracking-wider font-semibold">
                      Edson Arantes do Nascimento
                    </p>
                    <h3 className="text-xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
                      Manto Final Copa 1970 Autografado
                    </h3>
                  </div>

                  <div className="p-3 bg-[#12151B] border border-[#282E3A] rounded flex items-center justify-between">
                    <div>
                      <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
                        Reserva de Escrow
                      </span>
                      <span className="text-lg font-['Playfair_Display'] font-bold text-[#f2ca50]">
                        R$ 4.850.000
                      </span>
                      <span className="font-['Space_Grotesk'] text-xs text-[#9CA3AF] ml-1.5">
                        (USD $1,000,000+)
                      </span>
                    </div>

                    <Link
                      href="/product"
                      className="px-4 py-2 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] text-xs font-['Space_Grotesk'] uppercase font-bold rounded transition-colors flex items-center gap-1 shadow-sm"
                    >
                      Detalhes
                      <span className="material-symbols-outlined text-sm">arrow_forward</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 2: TRUST & INSTITUTIONAL SECURITY INFRASTRUCTURE */}
      <section className="py-20 bg-[#0c0e11] border-b border-[#282E3A]" id="custody">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <span className="text-xs font-['Space_Grotesk'] text-[#C59B27] tracking-widest uppercase block mb-2 font-semibold">
              Protocolo de Confiança Institucional
            </span>
            <h2 className="text-2xl sm:text-4xl font-['Playfair_Display'] font-bold text-[#F4F1EA] mb-4">
              Infraestrutura de Autenticação Soberana
            </h2>
            <p className="text-sm font-['Manrope'] text-[#9CA3AF] leading-relaxed">
              Cada relicário é submetido a rigorosos exames forenses com certificação tripartite antes da inclusão no cofre fiduciário descentralizado.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Pillar 1 */}
            <div className="bg-[#12151B] p-6 sm:p-8 border border-[#282E3A] hover:border-[#f2ca50]/50 transition-all duration-300 rounded relative group">
              <div className="w-12 h-12 border border-[#f2ca50]/30 bg-[#08090B] rounded flex items-center justify-center text-[#f2ca50] mb-5 group-hover:border-[#f2ca50] transition-colors">
                <span className="material-symbols-outlined text-2xl">biotech</span>
              </div>
              <span className="text-[11px] font-['Space_Grotesk'] text-[#C59B27] tracking-widest uppercase block mb-1.5 font-semibold">
                Análise Laboratorial
              </span>
              <h3 className="text-lg font-['Manrope'] font-bold text-[#F4F1EA] mb-2.5">
                Microespectrometria &amp; Prova Forense 8K
              </h3>
              <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed mb-4">
                Escaneamento micro-óptico não destrutivo de urdidura têxtil, resíduos de pigmento de época e caligrafia molecular com datação por decaimento de carbono-14.
              </p>
              <div className="text-xs font-['Space_Grotesk'] text-[#10B981] flex items-center gap-1.5 pt-3 border-t border-[#282E3A]">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Resolução de 0.02 mícrons
              </div>
            </div>

            {/* Pillar 2 */}
            <div className="bg-[#12151B] p-6 sm:p-8 border border-[#282E3A] hover:border-[#f2ca50]/50 transition-all duration-300 rounded relative group">
              <div className="w-12 h-12 border border-[#f2ca50]/30 bg-[#08090B] rounded flex items-center justify-center text-[#f2ca50] mb-5 group-hover:border-[#f2ca50] transition-colors">
                <span className="material-symbols-outlined text-2xl">account_balance</span>
              </div>
              <span className="text-[11px] font-['Space_Grotesk'] text-[#C59B27] tracking-widest uppercase block mb-1.5 font-semibold">
                Custódia Fiduciária
              </span>
              <h3 className="text-lg font-['Manrope'] font-bold text-[#F4F1EA] mb-2.5">
                Escrow em Genebra &amp; Zurique
              </h3>
              <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed mb-4">
                Contratos custodiados em zonas francas soberanas (Swiss Freeport) com liquidação condicionada exclusivamente ao laudo físico assinado pelo custodiante.
              </p>
              <div className="text-xs font-['Space_Grotesk'] text-[#10B981] flex items-center gap-1.5 pt-3 border-t border-[#282E3A]">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Jurisdição Financeira Suíça
              </div>
            </div>

            {/* Pillar 3 */}
            <div className="bg-[#12151B] p-6 sm:p-8 border border-[#282E3A] hover:border-[#f2ca50]/50 transition-all duration-300 rounded relative group">
              <div className="w-12 h-12 border border-[#f2ca50]/30 bg-[#08090B] rounded flex items-center justify-center text-[#f2ca50] mb-5 group-hover:border-[#f2ca50] transition-colors">
                <span className="material-symbols-outlined text-2xl">local_shipping</span>
              </div>
              <span className="text-[11px] font-['Space_Grotesk'] text-[#C59B27] tracking-widest uppercase block mb-1.5 font-semibold">
                Logística Segurada
              </span>
              <h3 className="text-lg font-['Manrope'] font-bold text-[#F4F1EA] mb-2.5">
                Transporte Tático Blindado Brink&apos;s Nível IV
              </h3>
              <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed mb-4">
                Movimentação global em blindagem com escolta dedicada, controle de atmosfera inerte (gás argônio) e apólice integral respaldada pelos syndicates do Lloyd&apos;s de Londres.
              </p>
              <div className="text-xs font-['Space_Grotesk'] text-[#10B981] flex items-center gap-1.5 pt-3 border-t border-[#282E3A]">
                <span className="material-symbols-outlined text-sm">check_circle</span>
                Seguro Nominal até US$ 50M
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 3: FEATURED MASTER LOT HIGHLIGHT (PELÉ 1970 DETAILED BAY) */}
      <section className="py-20 bg-[#08090B] border-b border-[#282E3A] relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-[#594A2B]/60 bg-[#12151B] p-6 sm:p-10 rounded-lg relative overflow-hidden">
            {/* Background Watermark */}
            <div className="absolute -right-8 -bottom-10 opacity-5 pointer-events-none select-none text-[260px] font-['Playfair_Display'] text-[#f2ca50] leading-none">
              10
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
              {/* Left Details */}
              <div className="lg:col-span-7 space-y-5">
                <div className="flex flex-wrap items-center gap-2.5">
                  <span className="px-3 py-1 bg-[#C59B27]/20 border border-[#C59B27] text-[#E5C875] text-[11px] font-['Space_Grotesk'] uppercase tracking-wider font-semibold rounded">
                    MASTER LOT EXCLUSIVO
                  </span>
                  <span className="px-2.5 py-1 bg-[#1e2023] border border-[#282E3A] text-[#9CA3AF] font-['Space_Grotesk'] text-xs rounded">
                    ID: #RELIC-PEL-1970-MEX
                  </span>
                </div>

                <div>
                  <h2 className="text-2xl sm:text-4xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
                    Edson Arantes do Nascimento (Pelé)
                  </h2>
                  <p className="text-base font-serif italic text-[#C59B27] mt-1">
                    Camisa Oficial da Final da Copa de 1970 (Brasil 4 x 1 Itália)
                  </p>
                </div>

                <p className="text-xs sm:text-sm font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                  Utilizada no histórico Estádio Azteca em 21 de junho de 1970. Manto autografado pelo Rei Pelé com dedicatória manuscrita autêntica de época. Tecido Athleta original com etiqueta numerada, traços de suor mineralizados preservados e certificação espectral com concordância cromática de transmissão da FIFA Archives.
                </p>

                {/* Technical Provenance Table Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 bg-[#08090B] border border-[#282E3A] rounded text-xs">
                  <div>
                    <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
                      Classificação
                    </span>
                    <span className="text-[#F4F1EA] font-semibold">Grau 9.8 Archival</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
                      Datação Fio
                    </span>
                    <span className="text-[#F4F1EA] font-semibold">Algodão 1970 C14</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
                      Custodiante Atual
                    </span>
                    <span className="text-[#F4F1EA] font-semibold">Geneva Vault Box 84</span>
                  </div>
                  <div>
                    <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
                      Apólice Lloyd&apos;s
                    </span>
                    <span className="text-[#F4F1EA] font-semibold">LL-BR70-98402</span>
                  </div>
                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
                      Blockchain SHA-256 Ledger Hash
                    </span>
                    <span className="font-['Space_Grotesk'] text-xs text-[#f2ca50] truncate block">
                      c49830ef89a12c8b74f3014a51e6d30294b...
                    </span>
                  </div>
                </div>

                {/* Valuation & Action CTAs */}
                <div className="pt-2 flex flex-wrap items-center gap-6">
                  <div>
                    <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
                      Valor de Reserva Escrow
                    </span>
                    <span className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#f2ca50]">
                      R$ 4.850.000
                    </span>
                    <span className="font-['Space_Grotesk'] text-xs text-[#9CA3AF] ml-2">
                      USD $1,000,000+
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      href="/product"
                      className="px-5 py-3 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-['Manrope'] uppercase font-bold text-xs rounded transition-all shadow-md flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base">search</span>
                      Inspecionar em 8K
                    </Link>

                    <Link
                      href="/checkout"
                      className="px-5 py-3 bg-[#1A1E26] border border-[#594A2B] hover:border-[#f2ca50] text-[#F4F1EA] font-['Manrope'] font-semibold text-xs rounded transition-colors flex items-center gap-2"
                    >
                      <span className="material-symbols-outlined text-base text-[#E5C875]">
                        gavel
                      </span>
                      Dar Lance em Escrow
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Viewport Card */}
              <div className="lg:col-span-5">
                <div className="relative border border-[#282E3A] bg-[#08090B] p-4 rounded-lg">
                  <div className="aspect-[4/5] relative overflow-hidden bg-[#0c0e11] rounded">
                    <img
                      src={RELIC_IMAGES.homeMasterBay}
                      alt="Pelé 1970 Manto Detalhe Magnificado"
                      className="w-full h-full object-cover cursor-pointer"
                      onClick={() =>
                        openImage(
                          RELIC_IMAGES.homeMasterBay,
                          'Assinatura e Colarinho Pelé 1970',
                          'Microscopia de varredura laser 4.5X'
                        )
                      }
                    />

                    {/* Direct image link action */}
                    <button
                      onClick={() =>
                        openImage(
                          RELIC_IMAGES.homeMasterBay,
                          'Assinatura e Colarinho Pelé 1970',
                          'Microscopia de varredura laser 4.5X'
                        )
                      }
                      className="absolute top-2.5 left-2.5 bg-[#08090B]/90 hover:bg-[#1A1E26] border border-[#282E3A] hover:border-[#f2ca50] text-[#E5C875] text-[10px] font-['Space_Grotesk'] px-2 py-1 rounded flex items-center gap-1 transition-colors"
                      title="Abrir Imagem em Alta Resolução"
                    >
                      <span className="material-symbols-outlined text-xs">open_in_new</span>
                      <span>Link Direto HTML</span>
                    </button>

                    {/* Macro Reticle Overlay */}
                    <div className="absolute inset-0 border border-[#f2ca50]/20 pointer-events-none flex items-center justify-center">
                      <div className="w-24 h-24 border border-[#E5C875]/60 rounded-full flex items-center justify-center">
                        <div className="w-1.5 h-1.5 bg-[#f2ca50] rounded-full"></div>
                      </div>
                    </div>

                    <div className="absolute top-3 right-3 px-2 py-1 bg-[#08090B]/90 border border-[#282E3A] text-[11px] font-['Space_Grotesk'] text-[#E5C875] rounded">
                      MAGNIFICAÇÃO: 4.5X
                    </div>

                    <div className="absolute bottom-3 left-3 px-3 py-1 bg-[#08090B]/90 border border-[#282E3A] text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] rounded">
                      FIBRA: 100% ALGODÃO BRASILEIRO 1970
                    </div>
                  </div>

                  <div className="mt-3 flex justify-between items-center text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                    <span>Selo Físico Holográfico Inviolável</span>
                    <span className="text-[#10B981] font-semibold">VERIFICADO #COA-9801</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: CURATED EXHIBITIONS & HISTORIC DROPS */}
      <section className="py-20 bg-[#111317] border-b border-[#282E3A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div>
              <span className="text-xs font-['Space_Grotesk'] text-[#C59B27] tracking-widest uppercase block mb-1 font-semibold">
                Acervos de Colecionadores Globais
              </span>
              <h2 className="text-2xl sm:text-4xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
                Salas Temáticas &amp; Drops de Prestígio
              </h2>
            </div>
            <Link
              href="/catalog"
              className="text-[#f2ca50] hover:text-[#E5C875] text-xs font-['Space_Grotesk'] uppercase tracking-wider flex items-center gap-1.5 transition-colors font-semibold"
            >
              Ver Todos os 48 Lotes Disponíveis
              <span className="material-symbols-outlined text-base">arrow_forward</span>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
            {/* Drop Card 1 */}
            <div className="bg-[#12151B] border border-[#282E3A] hover:border-[#f2ca50]/50 transition-all duration-300 rounded flex flex-col group overflow-hidden">
              <div className="aspect-[4/3] relative overflow-hidden bg-[#08090B] border-b border-[#282E3A]">
                <img
                  src={RELIC_IMAGES.homeDrop1Armband}
                  alt="Copa de 1970 Manto e Capitania"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() =>
                    openImage(
                      RELIC_IMAGES.homeDrop1Armband,
                      'Copa de 1970: Manto e Capitania',
                      'Braçadeira de Carlos Alberto e medalha de Pelé'
                    )
                  }
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#08090B]/90 border border-[#282E3A] text-[10px] font-['Space_Grotesk'] text-[#E5C875] rounded">
                  COPA DE 1970
                </span>
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#F59E0B]/15 border border-[#F59E0B] text-[#F59E0B] text-[10px] font-['Space_Grotesk'] rounded">
                  3 LOTES ATIVOS
                </span>

                <button
                  onClick={() =>
                    openImage(
                      RELIC_IMAGES.homeDrop1Armband,
                      'Copa de 1970: Manto e Capitania',
                      'Braçadeira de Carlos Alberto'
                    )
                  }
                  className="absolute bottom-2 right-2 bg-[#08090B]/90 text-[10px] font-['Space_Grotesk'] text-[#E5C875] px-2 py-1 rounded border border-[#282E3A] flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                  Link Direto
                </button>
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block mb-1">
                    Manto Canarinho &amp; Capitania
                  </span>
                  <h3 className="text-base font-['Manrope'] font-bold text-[#F4F1EA] mb-2 group-hover:text-[#f2ca50] transition-colors">
                    Copa de 1970: A Seleção de Todos os Tempos
                  </h3>
                  <p className="text-xs font-['Manrope'] text-[#9CA3AF] line-clamp-2 leading-relaxed">
                    Acervo autografado incluindo camisa de Pelé, braçadeira de capitão de Carlos Alberto Torres e flâmula oficial da partida contra a Inglaterra.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#282E3A] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
                      Abertura
                    </span>
                    <span className="font-['Space_Grotesk'] text-sm text-[#f2ca50] font-bold">
                      R$ 1.200.000+
                    </span>
                  </div>
                  <Link
                    href="/catalog"
                    className="text-xs font-['Space_Grotesk'] text-[#F4F1EA] hover:text-[#f2ca50] uppercase font-semibold flex items-center gap-1"
                  >
                    Consultar
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Drop Card 2 */}
            <div className="bg-[#12151B] border border-[#282E3A] hover:border-[#f2ca50]/50 transition-all duration-300 rounded flex flex-col group overflow-hidden">
              <div className="aspect-[4/3] relative overflow-hidden bg-[#08090B] border-b border-[#282E3A]">
                <img
                  src={RELIC_IMAGES.homeDrop2Helmet}
                  alt="Ayrton Senna Capacete Bell 1991"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() =>
                    openImage(
                      RELIC_IMAGES.homeDrop2Helmet,
                      'Ayrton Senna: Capacete McLaren 1991',
                      'Pintura original Sid Special Paint'
                    )
                  }
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#08090B]/90 border border-[#282E3A] text-[10px] font-['Space_Grotesk'] text-[#E5C875] rounded">
                  AUTOMOBILISMO
                </span>
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#10B981]/15 border border-[#10B981] text-[#10B981] text-[10px] font-['Space_Grotesk'] rounded">
                  CERTIFICADO BELL
                </span>

                <button
                  onClick={() =>
                    openImage(
                      RELIC_IMAGES.homeDrop2Helmet,
                      'Ayrton Senna: Capacete McLaren 1991',
                      'Pintura original Sid Special Paint'
                    )
                  }
                  className="absolute bottom-2 right-2 bg-[#08090B]/90 text-[10px] font-['Space_Grotesk'] text-[#E5C875] px-2 py-1 rounded border border-[#282E3A] flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                  Link Direto
                </button>
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block mb-1">
                    A Era de Ouro do Motorsport
                  </span>
                  <h3 className="text-base font-['Manrope'] font-bold text-[#F4F1EA] mb-2 group-hover:text-[#f2ca50] transition-colors">
                    Ayrton Senna: Macacões &amp; Capacetes de Vitória
                  </h3>
                  <p className="text-xs font-['Manrope'] text-[#9CA3AF] line-clamp-2 leading-relaxed">
                    Capacete Bell GP3 original McLaren-Honda 1991 e macacão anti-chama Nomex autografado do GP do Brasil de 1993 em Interlagos.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#282E3A] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
                      Abertura
                    </span>
                    <span className="font-['Space_Grotesk'] text-sm text-[#f2ca50] font-bold">
                      R$ 2.450.000+
                    </span>
                  </div>
                  <Link
                    href="/catalog"
                    className="text-xs font-['Space_Grotesk'] text-[#F4F1EA] hover:text-[#f2ca50] uppercase font-semibold flex items-center gap-1"
                  >
                    Consultar
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </Link>
                </div>
              </div>
            </div>

            {/* Drop Card 3 */}
            <div className="bg-[#12151B] border border-[#282E3A] hover:border-[#f2ca50]/50 transition-all duration-300 rounded flex flex-col group overflow-hidden">
              <div className="aspect-[4/3] relative overflow-hidden bg-[#08090B] border-b border-[#282E3A]">
                <img
                  src={RELIC_IMAGES.homeDrop3Jordan}
                  alt="Michael Jordan 1998 Finals Jersey"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() =>
                    openImage(
                      RELIC_IMAGES.homeDrop3Jordan,
                      'Michael Jordan 1998 Finals Jersey',
                      'Chicago Bulls The Last Dance Game 2'
                    )
                  }
                />
                <span className="absolute top-3 left-3 px-2 py-0.5 bg-[#08090B]/90 border border-[#282E3A] text-[10px] font-['Space_Grotesk'] text-[#E5C875] rounded">
                  NBA HISTORIC
                </span>
                <span className="absolute top-3 right-3 px-2 py-0.5 bg-[#F59E0B]/15 border border-[#F59E0B] text-[#F59E0B] text-[10px] font-['Space_Grotesk'] rounded">
                  LAST DANCE
                </span>

                <button
                  onClick={() =>
                    openImage(
                      RELIC_IMAGES.homeDrop3Jordan,
                      'Michael Jordan 1998 Finals Jersey',
                      'Chicago Bulls The Last Dance Game 2'
                    )
                  }
                  className="absolute bottom-2 right-2 bg-[#08090B]/90 text-[10px] font-['Space_Grotesk'] text-[#E5C875] px-2 py-1 rounded border border-[#282E3A] flex items-center gap-1"
                >
                  <span className="material-symbols-outlined text-xs">open_in_new</span>
                  Link Direto
                </button>
              </div>

              <div className="p-5 flex-grow flex flex-col justify-between space-y-4">
                <div>
                  <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block mb-1">
                    The Last Dance Series
                  </span>
                  <h3 className="text-base font-['Manrope'] font-bold text-[#F4F1EA] mb-2 group-hover:text-[#f2ca50] transition-colors">
                    Michael Jordan: Jogo das Finais de 1998
                  </h3>
                  <p className="text-xs font-['Manrope'] text-[#9CA3AF] line-clamp-2 leading-relaxed">
                    Camisa do Jogo 2 das Finais da NBA de 1998 pelo Chicago Bulls, acompanhada de carta de proveniência de rouparia oficial e exame fotomapeado MeiGray.
                  </p>
                </div>

                <div className="pt-4 border-t border-[#282E3A] flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
                      Abertura
                    </span>
                    <span className="font-['Space_Grotesk'] text-sm text-[#f2ca50] font-bold">
                      R$ 5.900.000+
                    </span>
                  </div>
                  <Link
                    href="/catalog"
                    className="text-xs font-['Space_Grotesk'] text-[#F4F1EA] hover:text-[#f2ca50] uppercase font-semibold flex items-center gap-1"
                  >
                    Consultar
                    <span className="material-symbols-outlined text-sm">chevron_right</span>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: INSTITUTIONAL COA REGISTRY & VIP CONCIERGE */}
      <section className="py-20 bg-[#0c0e11] border-b border-[#282E3A]" id="vault-registry">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left: Searchable COA */}
            <div className="lg:col-span-7 bg-[#12151B] border border-[#282E3A] p-6 sm:p-8 rounded-lg">
              <span className="text-[11px] font-['Space_Grotesk'] text-[#10B981] tracking-widest uppercase block mb-1.5 font-semibold">
                Validação Instantânea de Autenticidade
              </span>
              <h2 className="text-xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#F4F1EA] mb-3">
                Portal do Registro Público de Proveniência
              </h2>
              <p className="text-xs font-['Manrope'] text-[#9CA3AF] mb-5 leading-relaxed">
                Insira o identificador alfanumérico do selo de segurança holográfico, o hash SHA-256 ou o código do cofre suíço para conferir a cadeia de custódia ininterrupta.
              </p>

              <form onSubmit={handleVerifyCoa} className="space-y-4">
                <div>
                  <label
                    htmlFor="coa-hash-input"
                    className="block text-xs font-['Space_Grotesk'] text-[#9CA3AF] uppercase mb-1.5"
                  >
                    Identificador Holográfico ou Hash SHA-256
                  </label>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <div className="relative flex-grow">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-lg">
                        qr_code_scanner
                      </span>
                      <input
                        id="coa-hash-input"
                        type="text"
                        value={coaQuery}
                        onChange={(e) => setCoaQuery(e.target.value)}
                        placeholder="Ex: COA-PEL-1970-MEX-9801 ou SEN-1991"
                        className="w-full bg-[#08090B] border border-[#282E3A] focus:border-[#f2ca50] text-[#F4F1EA] pl-10 pr-3 py-2.5 text-xs font-['Space_Grotesk'] rounded focus:outline-none"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-5 py-2.5 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] text-xs font-['Space_Grotesk'] uppercase font-bold rounded transition-colors flex items-center justify-center gap-1.5 shrink-0"
                    >
                      <span className="material-symbols-outlined text-base">verified_user</span>
                      Verificar
                    </button>
                  </div>
                </div>

                {/* Real-time simulated ledger feedback */}
                {searchResult && (
                  <div className="p-3.5 bg-[#08090B] border border-[#10B981]/50 rounded text-xs font-['Space_Grotesk'] space-y-1.5 animate-fadeIn">
                    <div className="flex items-center justify-between text-[#10B981] font-bold">
                      <span className="flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        Registro Localizado no Ledger Soberano
                      </span>
                      <span className="text-[10px] uppercase bg-[#10B981]/15 px-2 py-0.5 rounded border border-[#10B981]/30">
                        {searchResult.status}
                      </span>
                    </div>
                    <p className="text-[#F4F1EA] font-semibold">{searchResult.title}</p>
                    <p className="text-[#9CA3AF] text-[11px]">{searchResult.facility}</p>
                    <p className="text-[#C59B27] text-[11px] font-mono truncate">
                      Hash SHA-256: {searchResult.hash}
                    </p>
                  </div>
                )}
              </form>

              <div className="pt-4 mt-4 border-t border-[#282E3A] flex items-center justify-between text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                <span>Sincronização Ativa com Geneva Vaults</span>
                <span className="text-[#f2ca50]">Tempo de Resposta: 18ms</span>
              </div>
            </div>

            {/* Right: VIP Concierge & Private Treaty Box */}
            <div className="lg:col-span-5 bg-[#1A1E26] border border-[#594A2B] p-6 sm:p-8 rounded-lg space-y-5">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 border border-[#f2ca50]/40 bg-[#12151B] rounded flex items-center justify-center text-[#f2ca50]">
                  <span className="material-symbols-outlined text-xl">room_service</span>
                </div>
                <div>
                  <h3 className="text-base font-['Manrope'] font-bold text-[#F4F1EA]">
                    Mesa de Tratado Privado
                  </h3>
                  <span className="text-[10px] font-['Space_Grotesk'] text-[#C59B27] uppercase font-semibold">
                    High-Net-Worth Advisory
                  </span>
                </div>
              </div>

              <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                Atendimento confidencial para transações institucionais, aquisições confidenciais off-market e consignação de relíquias de valor superior a R$ 1.000.000.
              </p>

              <ul className="space-y-2 text-xs font-['Manrope'] text-[#F4F1EA]">
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#10B981]">check</span>
                  Auditoria e due diligence in-loco em Genebra ou São Paulo
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#10B981]">check</span>
                  Estruturação fiduciária via Blind Trust ou Fundação
                </li>
                <li className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-sm text-[#10B981]">check</span>
                  Seguro de trânsito internacional Lloyd&apos;s de valor integral
                </li>
              </ul>

              <div className="pt-2">
                <button
                  onClick={() => setShowConciergeModal(true)}
                  className="w-full py-3 bg-[#12151B] border border-[#f2ca50] text-[#f2ca50] hover:bg-[#f2ca50] hover:text-[#08090B] font-['Manrope'] text-xs text-center block uppercase tracking-wider transition-all font-bold rounded"
                >
                  Agendar Sessão no Cofre Privado
                </button>
              </div>
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

      {/* Concierge Appointment Modal */}
      {showConciergeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#1A1E26] border border-[#C59B27] rounded-lg max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-[#282E3A] pb-3">
              <div className="flex items-center gap-2 text-[#f2ca50]">
                <span className="material-symbols-outlined">verified</span>
                <h3 className="font-['Manrope'] font-bold text-sm text-[#F4F1EA]">
                  Agendamento no Cofre Privado
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowConciergeModal(false);
                  setConciergeSuccess(false);
                }}
                className="text-[#9CA3AF] hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>

            {conciergeSuccess ? (
              <div className="text-center py-6 space-y-3">
                <span className="material-symbols-outlined text-4xl text-[#10B981]">
                  check_circle
                </span>
                <h4 className="font-bold text-[#F4F1EA]">Sessão Agendada com Sucesso</h4>
                <p className="text-xs text-[#9CA3AF]">
                  Nosso Curador Executivo entrará em contato confidencial por canal seguro criptografado nas próximas 2 horas.
                </p>
                <button
                  onClick={() => {
                    setShowConciergeModal(false);
                    setConciergeSuccess(false);
                  }}
                  className="mt-3 px-4 py-2 bg-[#f2ca50] text-[#08090B] font-bold text-xs rounded"
                >
                  Concluir
                </button>
              </div>
            ) : (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setConciergeSuccess(true);
                }}
                className="space-y-3 text-xs font-['Space_Grotesk']"
              >
                <div>
                  <label className="block text-[#9CA3AF] mb-1">Nome / Family Office</label>
                  <input
                    required
                    type="text"
                    defaultValue="Dr. Arnaldo Silva"
                    className="w-full bg-[#12151B] border border-[#282E3A] p-2 rounded text-[#F4F1EA]"
                  />
                </div>
                <div>
                  <label className="block text-[#9CA3AF] mb-1">Local da Inspeção</label>
                  <select className="w-full bg-[#12151B] border border-[#282E3A] p-2 rounded text-[#F4F1EA]">
                    <option>Geneva Freeport (Suíça) - Box 84</option>
                    <option>São Paulo Safe Facility (Bandeirantes)</option>
                    <option>Zurich FreeVault Core</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#9CA3AF] mb-1">Relíquia de Interesse</label>
                  <select className="w-full bg-[#12151B] border border-[#282E3A] p-2 rounded text-[#F4F1EA]">
                    <option>Lote #001 — Manto Pelé Copa 1970 (R$ 4.850.000)</option>
                    <option>Lote #002 — Capacete Ayrton Senna 1991 (R$ 2.450.000)</option>
                    <option>Lote #003 — Regata Michael Jordan 1998 (R$ 5.900.000)</option>
                    <option>Acervo Geral / Carteira Institucional</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-[#f2ca50] text-[#08090B] font-bold uppercase rounded hover:bg-[#E5C875] transition-colors mt-2"
                >
                  Confirmar Solicitação Confidencial
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
