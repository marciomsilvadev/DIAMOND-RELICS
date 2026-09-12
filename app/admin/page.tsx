'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RelayBar } from '@/components/RelayBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ImageModal } from '@/components/ImageModal';
import { CATALOG_RELICS, RelicItem } from '@/lib/relics-data';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState<'inventory' | 'ledger' | 'telemetry'>('inventory');
  const [relics, setRelics] = useState<RelicItem[]>(CATALOG_RELICS);
  const [isAuditing, setIsAuditing] = useState(false);
  const [auditComplete, setAuditComplete] = useState(false);
  const [showAddModal, setShowAddModal] = useState(false);

  // New Relic Form state
  const [newTitle, setNewTitle] = useState('');
  const [newAthlete, setNewAthlete] = useState('');
  const [newSport, setNewSport] = useState<'futebol' | 'f1' | 'basquete' | 'boxe'>('futebol');
  const [newYear, setNewYear] = useState(1982);
  const [newValuation, setNewValuation] = useState(1500000);
  const [newGrade, setNewGrade] = useState('9.8 ARCHIVAL');
  const [newImageUrl, setNewImageUrl] = useState('');

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

  const runNodeAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
      setAuditComplete(true);
      setTimeout(() => setAuditComplete(false), 4000);
    }, 1800);
  };

  const handleAddRelic = (e: React.FormEvent) => {
    e.preventDefault();
    const newItem: RelicItem = {
      id: `relic-${Date.now()}`,
      title: newTitle || 'Novo Lote Cadastrado no Cofre',
      athlete: newAthlete || 'Atleta Histórico',
      sport: newSport,
      year: Number(newYear),
      lotNumber: `#REL-${Math.floor(1000 + Math.random() * 9000)}`,
      category: newSport.toUpperCase(),
      valuationBRL: Number(newValuation),
      valuationUSD: Math.round(Number(newValuation) / 5),
      grade: newGrade,
      status: 'direct_buy',
      statusLabel: 'Compra Direta',
      imageUrl: newImageUrl || 'https://picsum.photos/seed/relic_vault_rare/800/1000',
      altText: newTitle,
      description: 'Lote adicionado via console de auditoria fiduciária com registro notarial em blockchain.',
      custodian: 'Geneva Freeport Custody',
      custodianFacility: 'Geneva Freeport Box 84',
      insurancePolicy: '#LL-CH-88219 (Lloyd\'s of London)',
      sha256Hash: '0x9f4b8842ca019928107dd82a0918efbc7819920188219488a0b126d9069efbc',
      verifiedMethod: 'COA Digital 8K',
    };

    setRelics([newItem, ...relics]);
    setShowAddModal(false);
    alert('Novo lote cadastrado com sucesso e indexado ao Nó Fiduciário #01!');
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

      {/* 2. HEADER DE COMANDO FORENSE & TELEMETRIA DO BUNKER */}
      <section className="bg-[#12151B] border-b border-[#282E3A] py-6 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2 py-0.5 bg-[#08090B] border border-[#f2ca50] text-[#f2ca50] text-[10px] font-['Space_Grotesk'] font-bold rounded uppercase">
                ADMIN COFRE FIDUCIÁRIO
              </span>
              <span className="text-[11px] font-['Space_Grotesk'] text-[#10B981] flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping"></span>
                NÓ DE AUDITORIA ZURIQUE ONLINE (LATÊNCIA 12ms)
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
              Painel de Auditoria Forense &amp; Governança de Custódia
            </h1>

            <p className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] mt-1">
              STATUS DOS NÓS: ZURIQUE (ATIVO) • GENEBRA (SINCRONIZADO) • SÃO PAULO (HOT-STANDBY) • HASH MERKLE ROOT VÁLIDO
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={runNodeAudit}
              disabled={isAuditing}
              className="px-4 py-2.5 bg-[#1A1E26] hover:bg-[#282E3A] border border-[#282E3A] hover:border-[#f2ca50] text-[#F4F1EA] text-xs font-['Space_Grotesk'] rounded flex items-center gap-2 transition-colors"
            >
              <span className="material-symbols-outlined text-[#E5C875] text-base">
                {isAuditing ? 'sync' : 'network_check'}
              </span>
              <span>
                {isAuditing
                  ? 'Auditando 8 Nós...'
                  : auditComplete
                  ? 'Nós 100% Auditados!'
                  : 'Auditoria de Nós SHA-256'}
              </span>
            </button>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-5 py-2.5 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] text-xs font-['Space_Grotesk'] font-bold uppercase tracking-wider rounded flex items-center gap-1.5 shadow-[0_0_20px_rgba(212,175,55,0.25)] transition-all"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              <span>Cadastrar Novo Lote</span>
            </button>
          </div>
        </div>
      </section>

      {/* 3. METRIC CARDS DE CONTROLE */}
      <section className="bg-[#08090B] border-b border-[#282E3A] py-6 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#12151B] border border-[#282E3A] p-4 rounded-lg">
            <div className="flex justify-between items-center text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] mb-1">
              <span>TOTAL SOB GUARDA FIDUCIÁRIA</span>
              <span className="text-[#10B981] font-bold">+12.4% a/a</span>
            </div>
            <div className="text-xl font-['Playfair_Display'] font-bold text-[#f2ca50]">
              R$ 184.750.000
            </div>
            <div className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] mt-1">
              US$ 36.95M em custódia suíça
            </div>
          </div>

          <div className="bg-[#12151B] border border-[#282E3A] p-4 rounded-lg">
            <div className="flex justify-between items-center text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] mb-1">
              <span>RELÍQUIAS NO COFRE</span>
              <span className="text-[#E5C875]">100% VALIDADO</span>
            </div>
            <div className="text-xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
              {relics.length} Lotes Físicos
            </div>
            <div className="text-[11px] font-['Space_Grotesk'] text-[#10B981] mt-1">
              Grau 9.7+ Archival Museum
            </div>
          </div>

          <div className="bg-[#12151B] border border-[#282E3A] p-4 rounded-lg">
            <div className="flex justify-between items-center text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] mb-1">
              <span>RETIDO EM CONTA ESCROW</span>
              <span className="text-[#F59E0B]">5 EM CURSO</span>
            </div>
            <div className="text-xl font-['Playfair_Display'] font-bold text-[#F59E0B]">
              R$ 24.150.000
            </div>
            <div className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] mt-1">
              BTG Pactual &amp; Swiss Trust
            </div>
          </div>

          <div className="bg-[#12151B] border border-[#282E3A] p-4 rounded-lg">
            <div className="flex justify-between items-center text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] mb-1">
              <span>INTEGRIDADE FORENSE C14</span>
              <span className="text-[#10B981]">ÓTIMO</span>
            </div>
            <div className="text-xl font-['Playfair_Display'] font-bold text-[#10B981]">
              99.98% Confiança
            </div>
            <div className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] mt-1">
              Zero divergências isotópicas
            </div>
          </div>
        </div>
      </section>

      {/* 4. MAIN ADMIN WORKSPACE (TABS) */}
      <main className="flex-grow max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-12 py-8">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-[#282E3A] mb-6">
          <button
            onClick={() => setActiveTab('inventory')}
            className={`pb-3 px-4 text-xs font-['Space_Grotesk'] font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'inventory'
                ? 'border-[#f2ca50] text-[#f2ca50]'
                : 'border-transparent text-[#9CA3AF] hover:text-[#F4F1EA]'
            }`}
          >
            <span className="material-symbols-outlined text-base">inventory_2</span>
            Lotes &amp; Relíquias no Ledger ({relics.length})
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`pb-3 px-4 text-xs font-['Space_Grotesk'] font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'ledger'
                ? 'border-[#f2ca50] text-[#f2ca50]'
                : 'border-transparent text-[#9CA3AF] hover:text-[#F4F1EA]'
            }`}
          >
            <span className="material-symbols-outlined text-base">receipt_long</span>
            Audit Trail SHA-256 em Tempo Real
          </button>

          <button
            onClick={() => setActiveTab('telemetry')}
            className={`pb-3 px-4 text-xs font-['Space_Grotesk'] font-bold border-b-2 flex items-center gap-2 transition-colors ${
              activeTab === 'telemetry'
                ? 'border-[#f2ca50] text-[#f2ca50]'
                : 'border-transparent text-[#9CA3AF] hover:text-[#F4F1EA]'
            }`}
          >
            <span className="material-symbols-outlined text-base">sensors</span>
            Telemetria de Atmosfera do Bunker
          </button>
        </div>

        {/* TAB 1: INVENTORY TABLE */}
        {activeTab === 'inventory' && (
          <div className="bg-[#12151B] border border-[#282E3A] rounded-lg overflow-hidden shadow-xl animate-fadeIn">
            <div className="p-4 border-b border-[#282E3A] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-['Playfair_Display'] font-bold text-base text-[#F4F1EA]">
                  Registro Fiduciário de Relíquias Sob Custódia
                </h3>
                <p className="text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                  Todos os itens possuem certificado físico notarial, hash SHA-256 e contrato de seguro com Lloyd&apos;s.
                </p>
              </div>
              <div className="text-xs font-['Space_Grotesk'] text-[#E5C875]">
                {relics.length} LOTES REGISTRADOS
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-['Space_Grotesk']">
                <thead className="bg-[#1A1E26] text-[#9CA3AF] uppercase text-[10px] tracking-wider border-b border-[#282E3A]">
                  <tr>
                    <th className="p-3.5">Miniatura &amp; Lote</th>
                    <th className="p-3.5">Relíquia &amp; Atleta</th>
                    <th className="p-3.5">Local de Guarda</th>
                    <th className="p-3.5">Valor Escrow</th>
                    <th className="p-3.5">Grau COA</th>
                    <th className="p-3.5">Status</th>
                    <th className="p-3.5 text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#282E3A] text-[#F4F1EA]">
                  {relics.map((relic) => (
                    <tr key={relic.id} className="hover:bg-[#1A1E26]/50 transition-colors">
                      {/* Thumbnail */}
                      <td className="p-3.5">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded bg-[#08090B] border border-[#282E3A] overflow-hidden relative shrink-0">
                            <img
                              src={relic.imageUrl}
                              alt={relic.title}
                              className="w-full h-full object-cover cursor-pointer"
                              onClick={() => openImage(relic.imageUrl, relic.title, relic.category)}
                            />
                            <button
                              onClick={() => openImage(relic.imageUrl, relic.title, relic.category)}
                              className="absolute bottom-0 right-0 bg-[#08090B]/90 text-[#E5C875] p-0.5 rounded-tl border-t border-l border-[#282E3A]"
                              title="Ver Link Direto da Imagem"
                            >
                              <span className="material-symbols-outlined text-[10px]">open_in_new</span>
                            </button>
                          </div>
                          <div>
                            <span className="text-[#E5C875] font-bold block">{relic.lotNumber}</span>
                            <span className="text-[10px] text-[#9CA3AF] uppercase">{relic.sport}</span>
                          </div>
                        </div>
                      </td>

                      {/* Title */}
                      <td className="p-3.5 max-w-xs">
                        <div className="font-['Manrope'] font-semibold text-xs text-[#F4F1EA] truncate">
                          {relic.title}
                        </div>
                        <div className="text-[11px] text-[#9CA3AF]">{relic.athlete} ({relic.year})</div>
                      </td>

                      {/* Vault */}
                      <td className="p-3.5">
                        <span className="text-xs text-[#9CA3AF] flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-[#C59B27]">
                            lock
                          </span>
                          {relic.custodianFacility}
                        </span>
                      </td>

                      {/* Valuation */}
                      <td className="p-3.5">
                        <span className="text-xs font-bold text-[#E5C875]">
                          R$ {relic.valuationBRL.toLocaleString('pt-BR')}
                        </span>
                        <span className="block text-[10px] text-[#9CA3AF]">
                          $ {relic.valuationUSD.toLocaleString('en-US')}
                        </span>
                      </td>

                      {/* Grade */}
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 bg-[#08090B] border border-[#10B981]/50 text-[#10B981] text-[10px] rounded font-bold">
                          {relic.grade}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="p-3.5">
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded border ${
                            relic.status === 'active_bid'
                              ? 'border-[#F59E0B]/50 text-[#F59E0B] bg-[#F59E0B]/10'
                              : 'border-[#282E3A] text-[#F4F1EA] bg-[#08090B]'
                          }`}
                        >
                          {relic.statusLabel}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="p-3.5 text-right space-x-2">
                        <Link
                          href="/product"
                          className="px-2.5 py-1 bg-[#08090B] border border-[#282E3A] hover:border-[#f2ca50] text-[#F4F1EA] rounded text-[11px] inline-block transition-colors"
                        >
                          Ver 8K
                        </Link>
                        <Link
                          href="/checkout"
                          className="px-2.5 py-1 bg-[#f2ca50] text-[#08090B] font-bold rounded text-[11px] inline-block hover:bg-[#E5C875] transition-colors"
                        >
                          Escrow
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: AUDIT TRAIL */}
        {activeTab === 'ledger' && (
          <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-6 space-y-4 shadow-xl animate-fadeIn">
            <div className="flex justify-between items-center border-b border-[#282E3A] pb-3">
              <div>
                <h3 className="font-['Playfair_Display'] font-bold text-base text-[#F4F1EA]">
                  Registro Imutável de Transações &amp; Auditoria Notarial
                </h3>
                <p className="text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                  Validação distribuída entre os nós de Genebra, Zurique e B3 São Paulo.
                </p>
              </div>
              <span className="text-xs font-['Space_Grotesk'] text-[#10B981] flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
                CONSENSO POFS ATIVO
              </span>
            </div>

            <div className="space-y-3 font-['Space_Grotesk'] text-xs">
              {[
                {
                  time: '14:28:10 UTC',
                  action: 'Depósito em Escrow Fiduciário',
                  relic: 'Lote #PEL-1970 Manto Pelé',
                  actor: 'Rothschild-Heritage Global Sports Assets LLC',
                  hash: '0x9f4b8842ca019928107dd82a0918efbc7819920188219488a0b126d9069efbc',
                  status: 'CONFIRMADO 8/8 NÓS',
                  amount: 'R$ 4.850.000,00',
                },
                {
                  time: '12:15:44 UTC',
                  action: 'Verificação Óptica Espectrométrica Raman',
                  relic: 'Lote #SEN-1991 Capacete Senna Bell XF-1',
                  actor: 'Dr. Jean-Luc Girard (Zurich Forensic Lab)',
                  hash: '0x3a8820f1cb78912903120199981247012351290bbfa199210982348123049182',
                  status: 'LAUDO APROVADO (GRAU 9.9)',
                  amount: 'Auditoria Programada',
                },
                {
                  time: '09:02:19 UTC',
                  action: 'Renovação de Apólice Especial Lloyd&apos;s',
                  relic: 'Acervo Global Diamond Relics (48 Lotes)',
                  actor: 'Lloyd&apos;s Syndicate London #LL-98402',
                  hash: '0x7719230fa10928bb019284091823019823019820391820398120398120398120',
                  status: 'APÓLICE ATIVA 2027',
                  amount: 'US$ 50.000.000 Cobertura',
                },
              ].map((ev, i) => (
                <div key={i} className="p-4 bg-[#08090B] border border-[#282E3A] rounded space-y-1.5">
                  <div className="flex flex-wrap items-center justify-between text-[#E5C875]">
                    <span className="font-bold flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-sm text-[#10B981]">verified</span>
                      {ev.action}
                    </span>
                    <span className="text-[11px] text-[#9CA3AF]">{ev.time}</span>
                  </div>

                  <div className="text-[#F4F1EA]">{ev.relic} • {ev.actor}</div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#282E3A]/60 text-[11px]">
                    <span className="text-[#9CA3AF] font-mono truncate max-w-sm">HASH: {ev.hash}</span>
                    <span className="text-[#10B981] font-bold">{ev.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: BUNKER TELEMETRY */}
        {activeTab === 'telemetry' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fadeIn">
            <div className="bg-[#12151B] border border-[#282E3A] p-5 rounded-lg space-y-4">
              <div className="flex justify-between items-center border-b border-[#282E3A] pb-2">
                <span className="font-bold text-[#E5C875] text-xs font-['Space_Grotesk']">
                  GENEVA FREEPORT · COFRE A-1
                </span>
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              </div>
              <div className="space-y-2 text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                <div className="flex justify-between">
                  <span>Atmosfera:</span>
                  <span className="text-[#F4F1EA]">99.98% Argônio Inerte</span>
                </div>
                <div className="flex justify-between">
                  <span>Temperatura:</span>
                  <span className="text-[#F4F1EA]">18.1°C ± 0.2°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Umidade Relativa:</span>
                  <span className="text-[#F4F1EA]">49.2% Constante</span>
                </div>
                <div className="flex justify-between">
                  <span>Pressão Bóveda:</span>
                  <span className="text-[#10B981]">Leve Sobrepressão (+5Pa)</span>
                </div>
              </div>
            </div>

            <div className="bg-[#12151B] border border-[#282E3A] p-5 rounded-lg space-y-4">
              <div className="flex justify-between items-center border-b border-[#282E3A] pb-2">
                <span className="font-bold text-[#E5C875] text-xs font-['Space_Grotesk']">
                  ZURICH HIGH-SECURITY VAULT Z-4
                </span>
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              </div>
              <div className="space-y-2 text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                <div className="flex justify-between">
                  <span>Atmosfera:</span>
                  <span className="text-[#F4F1EA]">Nitrogênio Purificado</span>
                </div>
                <div className="flex justify-between">
                  <span>Temperatura:</span>
                  <span className="text-[#F4F1EA]">17.8°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Umidade Relativa:</span>
                  <span className="text-[#F4F1EA]">48.0%</span>
                </div>
                <div className="flex justify-between">
                  <span>Status Laser:</span>
                  <span className="text-[#10B981]">Perímetro Tridimensional Ativo</span>
                </div>
              </div>
            </div>

            <div className="bg-[#12151B] border border-[#282E3A] p-5 rounded-lg space-y-4">
              <div className="flex justify-between items-center border-b border-[#282E3A] pb-2">
                <span className="font-bold text-[#E5C875] text-xs font-['Space_Grotesk']">
                  SÃO PAULO BANDEIRANTES FACILITY
                </span>
                <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              </div>
              <div className="space-y-2 text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                <div className="flex justify-between">
                  <span>Atmosfera:</span>
                  <span className="text-[#F4F1EA]">Climatização Filtros HEPA H14</span>
                </div>
                <div className="flex justify-between">
                  <span>Temperatura:</span>
                  <span className="text-[#F4F1EA]">19.0°C</span>
                </div>
                <div className="flex justify-between">
                  <span>Umidade Relativa:</span>
                  <span className="text-[#F4F1EA]">50.1%</span>
                </div>
                <div className="flex justify-between">
                  <span>Escolta Blindada Brink&apos;s:</span>
                  <span className="text-[#10B981]">Stand-by Pronto (02 Equipes)</span>
                </div>
              </div>
            </div>
          </div>
        )}
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

      {/* ADD RELIC MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-[#12151B] border-2 border-[#f2ca50] rounded-lg max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-[#282E3A] pb-3">
              <h3 className="font-['Playfair_Display'] font-bold text-lg text-[#F4F1EA]">
                Cadastrar Novo Lote Soberano no Cofre
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#9CA3AF] hover:text-white"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <form onSubmit={handleAddRelic} className="space-y-3 text-xs font-['Space_Grotesk']">
              <div>
                <label className="block text-[#9CA3AF] mb-1">Título do Manto ou Artefato</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Manto da Copa de 1982 — Zico #10"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] focus:border-[#f2ca50] p-2 rounded text-[#F4F1EA]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9CA3AF] mb-1">Atleta</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Zico"
                    value={newAthlete}
                    onChange={(e) => setNewAthlete(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] focus:border-[#f2ca50] p-2 rounded text-[#F4F1EA]"
                  />
                </div>
                <div>
                  <label className="block text-[#9CA3AF] mb-1">Ano Histórico</label>
                  <input
                    type="number"
                    required
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full bg-[#08090B] border border-[#282E3A] focus:border-[#f2ca50] p-2 rounded text-[#F4F1EA]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[#9CA3AF] mb-1">Esporte</label>
                  <select
                    value={newSport}
                    onChange={(e) => setNewSport(e.target.value as 'futebol' | 'f1' | 'basquete' | 'boxe')}
                    className="w-full bg-[#08090B] border border-[#282E3A] p-2 rounded text-[#F4F1EA]"
                  >
                    <option value="futebol">Futebol Histórico</option>
                    <option value="f1">Automobilismo / F1</option>
                    <option value="basquete">Basquete NBA</option>
                    <option value="boxe">Tênis &amp; Boxe</option>
                  </select>
                </div>
                <div>
                  <label className="block text-[#9CA3AF] mb-1">Grau COA</label>
                  <input
                    type="text"
                    value={newGrade}
                    onChange={(e) => setNewGrade(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] focus:border-[#f2ca50] p-2 rounded text-[#F4F1EA]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[#9CA3AF] mb-1">Avaliação em Escrow (BRL)</label>
                <input
                  type="number"
                  step="50000"
                  value={newValuation}
                  onChange={(e) => setNewValuation(Number(e.target.value))}
                  className="w-full bg-[#08090B] border border-[#282E3A] focus:border-[#f2ca50] p-2 rounded text-[#F4F1EA]"
                />
              </div>

              <div>
                <label className="block text-[#9CA3AF] mb-1">URL da Imagem de Alta Resolução</label>
                <input
                  type="url"
                  placeholder="https://... (ou deixe em branco para imagem padrão do cofre)"
                  value={newImageUrl}
                  onChange={(e) => setNewImageUrl(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] focus:border-[#f2ca50] p-2 rounded text-[#F4F1EA]"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#1A1E26] text-[#9CA3AF] rounded hover:text-white"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-bold uppercase rounded"
                >
                  Indexar no Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
