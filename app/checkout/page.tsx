'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RelayBar } from '@/components/RelayBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ImageModal } from '@/components/ImageModal';
import { RELIC_IMAGES } from '@/lib/relics-data';

export default function CheckoutPage() {
  const [custodyOption, setCustodyOption] = useState<'A' | 'B'>('A');
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'crypto' | 'lc'>('pix');
  const [agreedTerms, setAgreedTerms] = useState(true);

  const [buyerName, setBuyerName] = useState('Rothschild-Heritage Global Sports Assets LLC');
  const [buyerDoc, setBuyerDoc] = useState('CH-660.1.928.019-3');
  const [buyerReg, setBuyerReg] = useState('SEC CIK #0001894210');

  const [showDeedModal, setShowDeedModal] = useState(false);
  const [isGeneratingDeed, setIsGeneratingDeed] = useState(false);
  const [showEscrowOfficerChat, setShowEscrowOfficerChat] = useState(false);

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

  const handleConfirmEscrow = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedTerms) {
      alert('Por favor, confirme a concordância com os Termos de Custódia Fiduciária.');
      return;
    }

    setIsGeneratingDeed(true);
    setTimeout(() => {
      setIsGeneratingDeed(false);
      setShowDeedModal(true);
    }, 1200);
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

      {/* 2. HEADER OFICIAL & SEGURANÇA CRIPTOGRÁFICA */}
      <section className="w-full bg-[#12151B] border-b border-[#282E3A] py-4 px-4 sm:px-6 relative overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded bg-[#08090B] border border-[#C59B27]/40 flex items-center justify-center text-[#f2ca50] shadow-[0_0_15px_rgba(212,175,55,0.15)] shrink-0">
              <span className="material-symbols-outlined text-2xl">shield_lock</span>
            </div>
            <div>
              <h1 className="text-lg sm:text-2xl font-['Playfair_Display'] font-bold text-[#F4F1EA] tracking-tight">
                Checkout Seguro &amp; Liquidação Fiduciária em Escrow
              </h1>
              <p className="text-[11px] sm:text-xs font-['Space_Grotesk'] text-[#E5C875] flex items-center gap-2 mt-0.5">
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                Sessão Criptografada SSL 256-bit TLS 1.3 | Escrow Fiduciário Ativo
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-xs font-['Space_Grotesk']">
            <div className="bg-[#08090B] px-3 py-1.5 rounded border border-[#282E3A] flex items-center gap-1.5">
              <span className="text-[#9CA3AF]">SESSION ID:</span>
              <span className="text-[#F4F1EA] font-semibold">DRX-8842-CHCK</span>
            </div>
            <div className="bg-[#08090B] px-3 py-1.5 rounded border border-[#282E3A] hidden sm:flex items-center gap-1.5">
              <span className="text-[#9CA3AF]">ESCROW CONTRACT:</span>
              <span className="text-[#10B981] font-semibold">0x9F4b...38A1</span>
            </div>
          </div>
        </div>
      </section>

      {/* 3. STEPPER DE CHECKOUT */}
      <section className="w-full bg-[#08090B] border-b border-[#282E3A] py-5 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 relative">
            {/* Step 1 */}
            <div className="flex items-center gap-3 p-3 rounded bg-[#12151B] border border-[#282E3A]">
              <div className="w-7 h-7 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981] flex items-center justify-center text-xs font-['Space_Grotesk'] font-bold">
                <span className="material-symbols-outlined text-sm">check</span>
              </div>
              <div>
                <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] block">
                  PASSO 01
                </span>
                <span className="text-xs font-['Manrope'] text-[#F4F1EA] font-semibold">
                  1. Identificação Notarial &amp; KYC
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3 p-3 rounded bg-[#12151B] border border-[#282E3A]">
              <div className="w-7 h-7 rounded-full bg-[#10B981]/20 text-[#10B981] border border-[#10B981] flex items-center justify-center text-xs font-['Space_Grotesk'] font-bold">
                <span className="material-symbols-outlined text-sm">check</span>
              </div>
              <div>
                <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] block">
                  PASSO 02
                </span>
                <span className="text-xs font-['Manrope'] text-[#F4F1EA] font-semibold">
                  2. Custódia &amp; Logística Blindada
                </span>
              </div>
            </div>

            {/* Step 3 (Active) */}
            <div className="flex items-center gap-3 p-3 rounded bg-[#1A1E26] border-2 border-[#f2ca50] shadow-[0_4px_20px_rgba(212,175,55,0.15)]">
              <div className="w-7 h-7 rounded-full bg-[#f2ca50] text-[#08090B] font-bold flex items-center justify-center text-xs font-['Space_Grotesk']">
                03
              </div>
              <div>
                <span className="text-[10px] font-['Space_Grotesk'] text-[#E5C875] font-bold block tracking-wider">
                  EM ANDAMENTO
                </span>
                <span className="text-xs font-['Manrope'] text-[#f2ca50] font-bold">
                  3. Liquidação &amp; Depósito Escrow
                </span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-center gap-3 p-3 rounded bg-[#12151B]/50 border border-[#282E3A] opacity-70">
              <div className="w-7 h-7 rounded-full bg-[#12151B] text-[#9CA3AF] border border-[#282E3A] flex items-center justify-center text-xs font-['Space_Grotesk']">
                04
              </div>
              <div>
                <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] block">
                  FINALIZAÇÃO
                </span>
                <span className="text-xs font-['Manrope'] text-[#9CA3AF]">
                  4. Emissão de Escritura Digital
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. CONTEÚDO PRINCIPAL (LAYOUT 2 COLUNAS) */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 py-8">
        <form onSubmit={handleConfirmEscrow} className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* COLUNA PRINCIPAL (Esquerda - 7/12) Formulário de Execução Fiduciária */}
          <section className="lg:col-span-7 flex flex-col gap-6">
            {/* Bloco A: Titularidade & Registro Notarial */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-6 shadow-xl relative">
              <div className="flex items-center justify-between border-b border-[#282E3A] pb-3 mb-4">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f2ca50] text-xl">account_balance</span>
                  <h2 className="text-base font-['Manrope'] font-bold text-[#F4F1EA]">
                    1. Titularidade &amp; Registro Notarial
                  </h2>
                </div>
                <span className="text-[10px] font-['Space_Grotesk'] text-[#10B981] bg-[#10B981]/10 border border-[#10B981]/30 px-2 py-0.5 rounded font-bold">
                  KYC COMPLIANT
                </span>
              </div>

              <div className="space-y-4 text-xs font-['Space_Grotesk']">
                <div>
                  <label htmlFor="buyer-name" className="block text-[#9CA3AF] mb-1 uppercase font-semibold">
                    NOME COMPLETO OU RAZÃO SOCIAL (FAMILY OFFICE / FUNDO)
                  </label>
                  <input
                    id="buyer-name"
                    type="text"
                    value={buyerName}
                    onChange={(e) => setBuyerName(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] focus:border-[#E5C875] rounded px-3 py-2 text-[#F4F1EA] text-xs focus:outline-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="buyer-doc" className="block text-[#9CA3AF] mb-1 uppercase font-semibold">
                      CNPJ / PASSPORT IDENTIFIER
                    </label>
                    <input
                      id="buyer-doc"
                      type="text"
                      value={buyerDoc}
                      onChange={(e) => setBuyerDoc(e.target.value)}
                      className="w-full bg-[#08090B] border border-[#282E3A] focus:border-[#E5C875] rounded px-3 py-2 text-[#F4F1EA] text-xs focus:outline-none"
                    />
                  </div>
                  <div>
                    <label htmlFor="buyer-reg" className="block text-[#9CA3AF] mb-1 uppercase font-semibold">
                      REGISTRO CVM / SEC / FINMA (OPCIONAL)
                    </label>
                    <input
                      id="buyer-reg"
                      type="text"
                      value={buyerReg}
                      onChange={(e) => setBuyerReg(e.target.value)}
                      className="w-full bg-[#08090B] border border-[#282E3A] focus:border-[#E5C875] rounded px-3 py-2 text-[#F4F1EA] text-xs focus:outline-none"
                    />
                  </div>
                </div>

                <div className="bg-[#08090B] p-3 rounded border border-[#282E3A] flex items-center justify-between text-[#9CA3AF]">
                  <span className="flex items-center gap-1.5 text-xs">
                    <span className="material-symbols-outlined text-[#10B981] text-base">verified</span>
                    Custodiante Habilitado via Protocolo Notarial Suíço
                  </span>
                  <span className="text-[11px] text-[#C59B27] font-mono">VERIFIED CERT #9948</span>
                </div>
              </div>
            </div>

            {/* Bloco B: Escolha de Custódia e Blindagem */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-6 shadow-xl">
              <div className="flex items-center gap-2 border-b border-[#282E3A] pb-3 mb-4">
                <span className="material-symbols-outlined text-[#f2ca50] text-xl">warehouse</span>
                <h2 className="text-base font-['Manrope'] font-bold text-[#F4F1EA]">
                  2. Protocolo de Custódia Física &amp; Transporte Blindado
                </h2>
              </div>

              <div className="space-y-3.5">
                {/* Option A */}
                <label
                  onClick={() => setCustodyOption('A')}
                  className={`block cursor-pointer p-4 rounded border transition-all ${
                    custodyOption === 'A'
                      ? 'border-2 border-[#f2ca50] bg-[#1A1E26]'
                      : 'border-[#282E3A] bg-[#08090B] hover:border-[#C59B27]/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="custody-type"
                      checked={custodyOption === 'A'}
                      onChange={() => setCustodyOption('A')}
                      className="mt-1 text-[#f2ca50] focus:ring-0 bg-[#08090B] border-[#282E3A]"
                    />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-sm font-['Manrope'] font-bold text-[#F4F1EA]">
                          Opção A: Cofre de Alta Segurança (Geneva Freeport Box 84 - Suíça)
                        </span>
                        <span className="text-[10px] font-['Space_Grotesk'] bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/30 px-2 py-0.5 rounded font-bold">
                          TAXA ZERO 1º ANO
                        </span>
                      </div>
                      <p className="text-xs font-['Manrope'] text-[#9CA3AF] mt-1.5 leading-relaxed">
                        Depósito aduaneiro internacional isento de tributação intermediária. Temperatura controlada (18°C ± 0.5°C), umidade relativa 50%, câmara anóxica com proteção contra incêndio por gás inerte Novec 1230.
                      </p>
                      <div className="flex items-center gap-3 mt-2.5 text-xs font-['Space_Grotesk'] text-[#E5C875]">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">lock</span>
                          Bóveda Subterrânea Nível 5
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
                          Inspeção Trimestral Registrada
                        </span>
                      </div>
                    </div>
                  </div>
                </label>

                {/* Option B */}
                <label
                  onClick={() => setCustodyOption('B')}
                  className={`block cursor-pointer p-4 rounded border transition-all ${
                    custodyOption === 'B'
                      ? 'border-2 border-[#f2ca50] bg-[#1A1E26]'
                      : 'border-[#282E3A] bg-[#08090B] hover:border-[#C59B27]/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="radio"
                      name="custody-type"
                      checked={custodyOption === 'B'}
                      onChange={() => setCustodyOption('B')}
                      className="mt-1 text-[#f2ca50] focus:ring-0 bg-[#08090B] border-[#282E3A]"
                    />
                    <div className="flex-grow">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <span className="text-sm font-['Manrope'] font-bold text-[#F4F1EA]">
                          Opção B: Remessa Tática Blindada Internacional (Brink’s Global Nível IV)
                        </span>
                        <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] border border-[#282E3A] px-2 py-0.5 rounded">
                          SOB CONSULTA
                        </span>
                      </div>
                      <p className="text-xs font-['Manrope'] text-[#9CA3AF] mt-1.5 leading-relaxed">
                        Transporte terrestre em blindagem Nível IV acompanhado de escolta armada dedicada, seguido de frete aéreo fretado com mala diplomática lacrada com telemetria GPS/temperatura em tempo real.
                      </p>
                      <div className="flex items-center gap-3 mt-2.5 text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">shield</span>
                          Escolta Tática Bilingue
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-sm">sensors</span>
                          Rastreamento Criptografado
                        </span>
                      </div>
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* Bloco C: Método de Liquidação Fiduciária em Escrow */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-6 shadow-xl">
              <div className="flex items-center gap-2 border-b border-[#282E3A] pb-3 mb-4">
                <span className="material-symbols-outlined text-[#f2ca50] text-xl">payments</span>
                <h2 className="text-base font-['Manrope'] font-bold text-[#F4F1EA]">
                  3. Modalidade de Liquidação Fiduciária em Escrow
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
                <div
                  onClick={() => setPaymentMethod('pix')}
                  className={`cursor-pointer p-3.5 rounded border transition-all flex flex-col justify-between ${
                    paymentMethod === 'pix'
                      ? 'border-[#f2ca50] bg-[#1A1E26]'
                      : 'border-[#282E3A] bg-[#08090B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-[#E5C875]">account_balance</span>
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981]"></span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#F4F1EA]">TED / PIX Alto Valor</h3>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">Banco Central do Brasil (STR/SPB)</p>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('crypto')}
                  className={`cursor-pointer p-3.5 rounded border transition-all flex flex-col justify-between ${
                    paymentMethod === 'crypto'
                      ? 'border-[#f2ca50] bg-[#1A1E26]'
                      : 'border-[#282E3A] bg-[#08090B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-[#E5C875]">currency_bitcoin</span>
                    <span className="text-[10px] font-['Space_Grotesk'] text-[#f2ca50]">ERC-20</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#F4F1EA]">Escrow Cripto (USDT/USDC)</h3>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">Smart Contract Auditado Time-lock</p>
                  </div>
                </div>

                <div
                  onClick={() => setPaymentMethod('lc')}
                  className={`cursor-pointer p-3.5 rounded border transition-all flex flex-col justify-between ${
                    paymentMethod === 'lc'
                      ? 'border-[#f2ca50] bg-[#1A1E26]'
                      : 'border-[#282E3A] bg-[#08090B]'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="material-symbols-outlined text-[#E5C875]">history_edu</span>
                    <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF]">SBLC / LC</span>
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-[#F4F1EA]">Carta de Crédito Notarial</h3>
                    <p className="text-[11px] text-[#9CA3AF] mt-0.5">Garantia Bancária Irrevogável</p>
                  </div>
                </div>
              </div>

              {/* Escrow Bank Instructions Box */}
              <div className="bg-[#08090B] p-4 rounded border border-[#282E3A] text-xs font-['Space_Grotesk'] space-y-2">
                <div className="flex justify-between items-center pb-2 border-b border-[#282E3A]">
                  <span className="text-[#9CA3AF]">CONTA ESCROW JUDICIAL FIDUCIÁRIA</span>
                  <span className="text-[#10B981] font-bold">AGUARDANDO DEPÓSITO AUTORIZADO</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <div>
                    <span className="text-[#9CA3AF] block">Instituição Fiduciária:</span>
                    <span className="text-[#F4F1EA] font-semibold">
                      Banco BTG Pactual S.A. / Escrow Trust
                    </span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] block">Agência / Conta Escrow:</span>
                    <span className="text-[#F4F1EA] font-semibold">
                      Ag 0001 / CC 992810-7 (Bloqueio Fiduciário)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bloco D: Termos e Ação de Confirmação */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-6 shadow-xl space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreedTerms}
                  onChange={(e) => setAgreedTerms(e.target.checked)}
                  className="mt-1 w-4 h-4 rounded bg-[#08090B] border-[#C59B27] text-[#f2ca50] focus:ring-0"
                />
                <span className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
                  Declaro que li e concordo integralmente com os{' '}
                  <span className="text-[#F4F1EA] font-medium underline">Termos de Custódia Fiduciária</span>,
                  a apólice de Seguro de Trânsito e Permanência da{' '}
                  <strong className="text-[#E5C875]">Lloyd&apos;s of London</strong> e a cláusula de irrevogabilidade
                  da escritura de posse do Lote #001 autenticado pela Diamond Relics Archive.
                </span>
              </label>

              <button
                type="submit"
                disabled={isGeneratingDeed}
                className="w-full py-4 px-6 rounded bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-['Manrope'] font-bold text-xs uppercase tracking-wider transition-all shadow-[0_0_25px_rgba(212,175,55,0.35)] flex items-center justify-center gap-2"
              >
                <span className="material-symbols-outlined text-xl font-bold">
                  {isGeneratingDeed ? 'sync' : 'verified'}
                </span>
                <span>
                  {isGeneratingDeed
                    ? 'Autenticando com Zurich Core-01...'
                    : 'Confirmar Depósito em Escrow & Gerar Escritura (R$ 4.850.000)'}
                </span>
              </button>

              <p className="text-center text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                Protocolo de liquidação em conformidade com as diretrizes do Banco Central do Brasil e Swiss Freeport Custody Act.
              </p>
            </div>
          </section>

          {/* COLUNA LATERAL (Direita - 5/12) Resumo do Lote, Discriminação e Selos de Auditoria */}
          <section className="lg:col-span-5 flex flex-col gap-6 sticky top-20">
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-6 shadow-2xl relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-[#282E3A] pb-3 mb-4">
                <span className="text-xs font-['Space_Grotesk'] text-[#E5C875] tracking-widest uppercase font-semibold">
                  LOTE HISTÓRICO #001
                </span>
                <span className="inline-flex items-center gap-1 text-[10px] font-['Space_Grotesk'] bg-[#10B981]/15 text-[#10B981] border border-[#10B981]/30 px-2 py-0.5 rounded font-bold">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  GRAU 9.8 COA MUSEU
                </span>
              </div>

              {/* Miniatura e Detalhes da Relíquia */}
              <div className="flex gap-4 items-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded bg-[#08090B] border border-[#282E3A] overflow-hidden relative shrink-0">
                  <img
                    src={RELIC_IMAGES.peleJerseyCase}
                    alt="Manto Pelé 1970 no cofre com vidro anti-reflexo"
                    className="w-full h-full object-cover cursor-pointer"
                    onClick={() =>
                      openImage(
                        RELIC_IMAGES.peleJerseyCase,
                        'Manto Pelé 1970 — Vitrine de Custódia',
                        'Cofre subterrâneo com iluminação anti-degradação óptica'
                      )
                    }
                  />

                  {/* Direct HTML image link */}
                  <button
                    type="button"
                    onClick={() =>
                      openImage(
                        RELIC_IMAGES.peleJerseyCase,
                        'Manto Pelé 1970 — Vitrine de Custódia',
                        'Cofre subterrâneo com iluminação anti-degradação óptica'
                      )
                    }
                    className="absolute top-1 right-1 bg-[#08090B]/90 hover:bg-[#1A1E26] text-[#E5C875] p-1 rounded border border-[#282E3A]"
                    title="Ver Imagem Original Direta em HTML"
                  >
                    <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                  </button>

                  <span className="absolute bottom-1 left-1 text-[8px] font-['Space_Grotesk'] bg-[#08090B]/90 text-[#E5C875] px-1 rounded border border-[#282E3A]">
                    1970 FINAL
                  </span>
                </div>

                <div>
                  <span className="text-[10px] font-['Space_Grotesk'] text-[#E5C875] font-semibold">
                    EDSON ARANTES DO NASCIMENTO (PELÉ)
                  </span>
                  <h3 className="text-sm sm:text-base font-['Playfair_Display'] font-bold text-[#F4F1EA] leading-tight mt-0.5">
                    Manto Sagrado da Final Copa do Mundo 1970 (México)
                  </h3>
                  <p className="text-xs font-['Manrope'] text-[#9CA3AF] mt-1 line-clamp-2">
                    Manto amarelo autografado após o Tri no Estádio Azteca. Proveniência ininterrupta atestada por laudo microscópico e espectrometria.
                  </p>
                </div>
              </div>

              {/* Hash SHA-256 Verificado */}
              <div className="mt-4 p-2.5 rounded bg-[#08090B] border border-[#282E3A] text-xs font-['Space_Grotesk']">
                <div className="flex items-center justify-between text-[11px] text-[#9CA3AF] mb-1">
                  <span>HASH SHA-256 DO CERTIFICADO</span>
                  <span className="text-[#10B981] flex items-center gap-1 font-semibold">
                    <span className="material-symbols-outlined text-xs">check_circle</span> VÁLIDO
                  </span>
                </div>
                <code className="text-xs text-[#E5C875] break-all block font-mono">
                  e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
                </code>
              </div>

              {/* Discriminação de Custos */}
              <div className="mt-5 border-t border-[#282E3A] pt-4 space-y-2.5 text-xs font-['Space_Grotesk']">
                <div className="flex justify-between items-center text-[#9CA3AF]">
                  <span>Valor de Arrematação da Relíquia:</span>
                  <span className="text-[#F4F1EA] font-semibold">R$ 4.850.000,00</span>
                </div>
                <div className="flex justify-between items-center text-[#9CA3AF]">
                  <span className="flex items-center gap-1">
                    Seguro de Trânsito Integral Lloyd&apos;s (110%):
                    <span className="material-symbols-outlined text-xs text-[#E5C875]">info</span>
                  </span>
                  <span className="text-[#10B981] font-bold">INCLUSO</span>
                </div>
                <div className="flex justify-between items-center text-[#9CA3AF]">
                  <span className="flex items-center gap-1">
                    Custódia Fiduciária 12 Meses (Geneva Freeport):
                    <span className="material-symbols-outlined text-xs text-[#E5C875]">info</span>
                  </span>
                  <span className="text-[#10B981] font-bold">CORTESIA EXCLUSIVA</span>
                </div>
                <div className="flex justify-between items-center text-[#9CA3AF]">
                  <span>Taxas de Escrituração Notarial &amp; Blockchain:</span>
                  <span className="text-[#10B981] font-bold">INCLUSO</span>
                </div>

                {/* Total */}
                <div className="border-t border-[#282E3A] pt-3.5 mt-2 flex justify-between items-baseline">
                  <div>
                    <span className="text-sm font-['Manrope'] font-bold text-[#F4F1EA] block">
                      TOTAL DA LIQUIDAÇÃO:
                    </span>
                    <span className="text-[11px] text-[#9CA3AF]">Escrow sob custódia garantida</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-['Playfair_Display'] font-bold text-[#f2ca50]">
                      R$ 4.850.000,00
                    </span>
                    <span className="block text-xs text-[#E5C875] font-mono">
                      ≈ USD 970.000,00
                    </span>
                  </div>
                </div>
              </div>

              {/* Chancela Institucional & Selos de Auditoria */}
              <div className="mt-5 pt-4 border-t border-[#282E3A]">
                <span className="text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] block mb-2.5 uppercase tracking-wider font-semibold">
                  Chancela Institucional &amp; Selos de Auditoria
                </span>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-center text-xs font-['Space_Grotesk']">
                  <div className="p-2 rounded bg-[#08090B] border border-[#282E3A]">
                    <span className="material-symbols-outlined text-[#f2ca50] text-lg block mb-0.5">security</span>
                    <span className="text-[10px] font-bold text-[#F4F1EA] block">LLOYD&apos;S</span>
                    <span className="text-[9px] text-[#9CA3AF] block">Apólice Especial</span>
                  </div>
                  <div className="p-2 rounded bg-[#08090B] border border-[#282E3A]">
                    <span className="material-symbols-outlined text-[#f2ca50] text-lg block mb-0.5">domain</span>
                    <span className="text-[10px] font-bold text-[#F4F1EA] block">SWISS FREEPORT</span>
                    <span className="text-[9px] text-[#9CA3AF] block">Box 84 Geneva</span>
                  </div>
                  <div className="p-2 rounded bg-[#08090B] border border-[#282E3A]">
                    <span className="material-symbols-outlined text-[#f2ca50] text-lg block mb-0.5">local_shipping</span>
                    <span className="text-[10px] font-bold text-[#F4F1EA] block">BRINK&apos;S</span>
                    <span className="text-[9px] text-[#9CA3AF] block">Nível IV Blindado</span>
                  </div>
                  <div className="p-2 rounded bg-[#08090B] border border-[#282E3A]">
                    <span className="material-symbols-outlined text-[#f2ca50] text-lg block mb-0.5">fingerprint</span>
                    <span className="text-[10px] font-bold text-[#F4F1EA] block">CERTISIGN</span>
                    <span className="text-[9px] text-[#9CA3AF] block">ICP-Brasil Notarial</span>
                  </div>
                  <div className="p-2 rounded bg-[#08090B] border border-[#282E3A] col-span-2">
                    <span className="material-symbols-outlined text-[#10B981] text-lg block mb-0.5">biotech</span>
                    <span className="text-[10px] font-bold text-[#F4F1EA] block">LAUDO FORENSE VALIDADO</span>
                    <span className="text-[9px] text-[#9CA3AF] block">Espectrometria &amp; Fios Algodão 1970</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Box Suporte Concierge Private Banking */}
            <div className="bg-[#12151B] border border-[#282E3A] p-4 rounded-lg flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-[#08090B] border border-[#C59B27]/40 flex items-center justify-center text-[#E5C875]">
                  <span className="material-symbols-outlined text-lg">support_agent</span>
                </div>
                <div>
                  <span className="text-xs font-['Manrope'] font-bold text-[#F4F1EA] block">
                    Oficial de Escrow Dedicado
                  </span>
                  <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                    Dr. Henri de Saint-Germain (Genebra)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowEscrowOfficerChat(true)}
                className="px-3 py-1.5 rounded bg-[#08090B] border border-[#C59B27] text-[#E5C875] text-xs font-['Space_Grotesk'] hover:bg-[#1A1E26] transition-colors"
              >
                CHAMAR PRIVADO
              </button>
            </div>
          </section>
        </form>
      </main>

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

      {/* DIGITAL DEED MODAL (Passo 4: Escritura Digital de Custódia) */}
      {showDeedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#12151B] border-2 border-[#f2ca50] rounded-lg max-w-2xl w-full p-6 sm:p-8 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-[#282E3A] pb-4">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-[#f2ca50] text-2xl">verified</span>
                <div>
                  <h3 className="font-['Playfair_Display'] font-bold text-lg text-[#F4F1EA]">
                    Escritura Digital Notarial Fiduciária
                  </h3>
                  <p className="text-[11px] font-['Space_Grotesk'] text-[#E5C875]">
                    Lacre Criptográfico Lavrado em Geneva Freeport Core-01
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDeedModal(false)}
                className="text-[#9CA3AF] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="bg-[#08090B] border border-[#282E3A] p-4 rounded text-xs font-['Space_Grotesk'] space-y-2">
              <div className="flex justify-between border-b border-[#282E3A] pb-1.5 text-[#E5C875]">
                <span>TITULAR ADQUIRENTE:</span>
                <span className="text-[#F4F1EA] font-semibold">{buyerName}</span>
              </div>
              <div className="flex justify-between border-b border-[#282E3A] pb-1.5">
                <span className="text-[#9CA3AF]">REGISTRO FISCAL / PASSAPORTE:</span>
                <span className="text-[#F4F1EA]">{buyerDoc}</span>
              </div>
              <div className="flex justify-between border-b border-[#282E3A] pb-1.5">
                <span className="text-[#9CA3AF]">RELÍQUIA AUTENTICADA:</span>
                <span className="text-[#F4F1EA]">Lote #PEL-1970 (Manto Final Copa 1970)</span>
              </div>
              <div className="flex justify-between border-b border-[#282E3A] pb-1.5">
                <span className="text-[#9CA3AF]">LOCAL DE GUARDA:</span>
                <span className="text-[#F4F1EA]">
                  {custodyOption === 'A'
                    ? 'Geneva Freeport Box 84 (Cofre Suíço)'
                    : 'Brink’s Global Nível IV (Em Trânsito Especial)'}
                </span>
              </div>
              <div className="flex justify-between border-b border-[#282E3A] pb-1.5">
                <span className="text-[#9CA3AF]">VALOR DE LIQUIDAÇÃO:</span>
                <span className="text-[#f2ca50] font-bold">R$ 4.850.000,00</span>
              </div>
              <div>
                <span className="text-[#9CA3AF] block mb-1">HASH SHA-256 DO CERTIFICADO NOTARIAL:</span>
                <code className="text-[#E5C875] text-[10px] break-all block font-mono bg-[#12151B] p-2 rounded">
                  0x9f4b8842ca019928107dd82a0918efbc7819920188219488a0b126d9069efbc
                </code>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <span className="text-[11px] font-['Space_Grotesk'] text-[#10B981] flex items-center gap-1">
                <span className="material-symbols-outlined text-sm">lock</span>
                Garantia e Custódia Homologadas via Lloyd&apos;s Syndicate
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => alert('Escritura salva em arquivo PDF com assinatura digital PKCS#7!')}
                  className="px-4 py-2 bg-[#1A1E26] hover:bg-[#282a2d] border border-[#282E3A] text-xs font-['Space_Grotesk'] text-[#F4F1EA] rounded"
                >
                  Baixar Certificado
                </button>
                <Link
                  href="/admin"
                  className="px-4 py-2 bg-[#f2ca50] text-[#08090B] font-bold text-xs font-['Space_Grotesk'] uppercase rounded"
                >
                  Acompanhar no Admin Ledger
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Escrow Officer Chat / Call Drawer */}
      {showEscrowOfficerChat && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#1A1E26] border border-[#C59B27] rounded-lg max-w-md w-full p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-[#282E3A] pb-2">
              <span className="text-xs font-bold text-[#E5C875] font-['Space_Grotesk']">
                OFICIAL DE ESCROW PRIVADO (GENEBRA)
              </span>
              <button
                onClick={() => setShowEscrowOfficerChat(false)}
                className="text-[#9CA3AF] hover:text-white"
              >
                <span className="material-symbols-outlined text-sm">close</span>
              </button>
            </div>
            <div className="space-y-2 text-xs font-['Space_Grotesk']">
              <p className="text-[#F4F1EA] font-semibold">Dr. Henri de Saint-Germain</p>
              <p className="text-[#9CA3AF]">
                Oficial Fiduciário responsável pela gestão de garantias de alto valor e custódia física no Geneva Freeport.
              </p>
              <div className="p-3 bg-[#08090B] rounded border border-[#282E3A] space-y-1">
                <div>Ramal Seguro: +41 22 710 4480</div>
                <div>Protocolo: ESCROW-GEN-091</div>
                <div className="text-[#10B981]">Conexão Criptografada Ativa (Genebra UTC+1)</div>
              </div>
            </div>
            <button
              onClick={() => {
                alert('Chamada de voz segura iniciada com a Bóveda de Genebra.');
                setShowEscrowOfficerChat(false);
              }}
              className="w-full py-2 bg-[#f2ca50] text-[#08090B] font-bold text-xs uppercase rounded"
            >
              Iniciar Ligação Privada Criptografada
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
