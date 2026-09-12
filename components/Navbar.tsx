'use client';

import Link from 'next/link';
import { useState } from 'react';
import { RELIC_IMAGES } from '@/lib/relics-data';

interface NavbarProps {
  currentSearch?: string;
  onSearchChange?: (val: string) => void;
}

export function Navbar({ currentSearch, onSearchChange }: NavbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [internalSearch, setInternalSearch] = useState('');

  return (
    <header className="flex justify-between items-center w-full px-6 py-3.5 bg-[#08090B] border-b border-[#282E3A] sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-lg md:text-xl font-['Playfair_Display'] text-[#f2ca50] tracking-widest uppercase flex items-center gap-2.5 hover:text-[#E5C875] transition-colors duration-150"
        >
          <span
            className="material-symbols-outlined text-[#f2ca50] text-2xl"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            diamond
          </span>
          <span className="hidden sm:inline font-bold">Diamond Relics</span>
          <span className="text-xs font-['Space_Grotesk'] text-[#9CA3AF] tracking-normal font-normal border border-[#282E3A] px-1.5 py-0.5 rounded bg-[#12151B]">
            ARCHIVE VAULT
          </span>
        </Link>

        <div className="hidden lg:flex items-center gap-4 text-xs font-['Space_Grotesk']">
          <span className="text-[#E5C875] font-semibold border-b border-[#E5C875] pb-0.5 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E5C875]"></span>
            Mainnet Vault
          </span>
          <span className="text-[#9CA3AF] hover:text-[#e2e2e6] transition-colors flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            Ledger Status: Synchronized
          </span>
        </div>
      </div>

      {/* Center/Search Input */}
      <div className="hidden md:flex items-center relative w-64 lg:w-80">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF] text-sm">
          search
        </span>
        <input
          type="text"
          value={currentSearch !== undefined ? currentSearch : internalSearch}
          onChange={(e) => {
            if (onSearchChange) {
              onSearchChange(e.target.value);
            } else {
              setInternalSearch(e.target.value);
            }
          }}
          placeholder="Localizar Lote, Atleta ou Hash SHA-256..."
          className="w-full pl-9 pr-8 py-1.5 bg-[#12151B] border border-[#282E3A] rounded text-xs font-['Space_Grotesk'] text-[#F4F1EA] placeholder-[#9CA3AF] focus:outline-none focus:border-[#E5C875] transition-colors"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] bg-[#1A1E26] px-1 rounded border border-[#282E3A]">
          ⌘K
        </span>
      </div>

      {/* Trailing Controls & Institutional Authority Actions */}
      <div className="flex items-center gap-3 md:gap-4">
        <span className="hidden xl:inline-block text-[11px] font-['Space_Grotesk'] px-2.5 py-1 bg-[#12151B] border border-[#282E3A] rounded text-[#9CA3AF]">
          Ambiente: Produção
        </span>

        <div className="flex items-center gap-1.5 text-[#9CA3AF] relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 hover:text-[#E5C875] transition-colors duration-150 rounded relative"
            title="Notificações Notariais & Ledger"
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#F59E0B] ring-2 ring-[#08090B]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-[#1A1E26] border border-[#282E3A] rounded p-4 shadow-2xl z-50 text-xs font-['Space_Grotesk'] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#282E3A]">
                <span className="font-bold text-[#F4F1EA] uppercase tracking-wider">Notificações do Ledger</span>
                <span className="text-[10px] text-[#10B981]">2 Não Lidas</span>
              </div>
              <div className="p-2.5 rounded bg-[#12151B] border border-[#282E3A] space-y-1">
                <div className="flex justify-between text-[#E5C875] font-semibold text-[11px]">
                  <span>Lance em Escrow Confirmado</span>
                  <span className="text-[#9CA3AF]">há 12 min</span>
                </div>
                <p className="text-[#9CA3AF] text-[11px]">
                  Novo lance qualificado de R$ 4.850.000 registrado no Lote #PEL-1970.
                </p>
              </div>
              <div className="p-2.5 rounded bg-[#12151B] border border-[#282E3A] space-y-1">
                <div className="flex justify-between text-[#10B981] font-semibold text-[11px]">
                  <span>Merkle Root Atualizado</span>
                  <span className="text-[#9CA3AF]">há 42 seg</span>
                </div>
                <p className="text-[#9CA3AF] text-[11px]">
                  Hash SHA-256 consolidado com Zurich Freeport Core Node.
                </p>
              </div>
            </div>
          )}

          <Link
            href="/admin"
            className="p-1.5 text-[#10B981] hover:opacity-80 transition-opacity rounded"
            title="Validação de Assinatura Nv. 4"
          >
            <span
              className="material-symbols-outlined text-lg"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
          </Link>
        </div>

        {/* Curator Profile */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#282E3A]">
          <Link
            href="/admin"
            className="w-8 h-8 rounded-full border border-[#C59B27] p-0.5 bg-[#1A1E26] hover:scale-105 transition-transform flex items-center justify-center text-[#E5C875] text-xs font-['Space_Grotesk'] font-bold overflow-hidden"
            title="Curador Executivo Nível 4 (Ir para Painel Admin)"
          >
            {/* Direct avatar image */}
            <img
              src={RELIC_IMAGES.curatorAvatar}
              alt="Curador Executivo Nível 4"
              className="w-full h-full rounded-full object-cover"
            />
          </Link>

          <Link
            href="/admin"
            className="hidden sm:inline-block text-xs font-['Space_Grotesk'] text-[#9CA3AF] hover:text-[#E5C875] transition-colors duration-150"
          >
            Terminal Admin
          </Link>
        </div>
      </div>
    </header>
  );
}
