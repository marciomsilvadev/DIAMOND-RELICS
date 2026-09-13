'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { RELIC_IMAGES } from '@/lib/relics-data';
import { getStoredSiteConfig, DEFAULT_SITE_CONFIG, SiteConfig } from '@/lib/site-config-store';
import { getCurrentSession, AuthSession } from '@/lib/auth-store';

interface NavbarProps {
  currentSearch?: string;
  onSearchChange?: (val: string) => void;
  cartCount?: number;
}

export function Navbar({ currentSearch, onSearchChange, cartCount = 1 }: NavbarProps) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [showNotifications, setShowNotifications] = useState(false);
  const [internalSearch, setInternalSearch] = useState('');
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setConfig(getStoredSiteConfig());
    setSession(getCurrentSession());

    const handleUpdate = () => setConfig(getStoredSiteConfig());
    const handleSession = () => setSession(getCurrentSession());

    window.addEventListener('diamond_config_updated', handleUpdate);
    window.addEventListener('diamond_session_updated', handleSession);

    return () => {
      window.removeEventListener('diamond_config_updated', handleUpdate);
      window.removeEventListener('diamond_session_updated', handleSession);
    };
  }, []);

  return (
    <header className="flex justify-between items-center w-full px-4 sm:px-6 py-3.5 bg-[#08090B] border-b border-[#282E3A] sticky top-0 z-40 backdrop-blur-md bg-opacity-95">
      <div className="flex items-center gap-6">
        <Link
          href="/"
          className="text-lg md:text-xl font-['Playfair_Display'] text-[#f2ca50] tracking-widest uppercase flex items-center gap-2.5 sm:gap-3.5 hover:text-[#E5C875] transition-colors duration-150 group"
        >
          <img
            src="/diamond-relics-logo.png"
            alt="Diamond Relics"
            className="h-10 sm:h-12 w-auto object-contain drop-shadow-[0_0_14px_rgba(242,202,80,0.35)] group-hover:scale-105 transition-transform shrink-0"
          />
          <div className="flex flex-col">
            <span className="hidden sm:inline font-bold leading-none tracking-wider text-[#f2ca50]">
              {config.storeName || 'DIAMOND RELICS'}
            </span>
            <span className="hidden sm:inline text-[9px] font-['Space_Grotesk'] text-[#9CA3AF] tracking-[0.2em] uppercase mt-0.5">
              {config.storeBadge || 'Artigos Esportivos'}
            </span>
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-4 text-xs font-['Space_Grotesk']">
          <Link
            href="/catalog"
            className="text-[#E5C875] font-semibold hover:text-[#f2ca50] transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
            {config.navCatalog || 'Catálogo de Produtos'}
          </Link>
          <span className="text-[#9CA3AF] flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50]"></span>
            Envio Seguro com Escolta Blindada
          </span>
        </nav>
      </div>

      {/* Busca de Produtos */}
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
          placeholder="Buscar produto, atleta, camisa..."
          className="w-full pl-9 pr-8 py-1.5 bg-[#12151B] border border-[#282E3A] rounded text-xs font-['Space_Grotesk'] text-[#F4F1EA] placeholder-[#9CA3AF] focus:outline-none focus:border-[#E5C875] transition-colors"
        />
        <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-['Space_Grotesk'] text-[#9CA3AF] bg-[#1A1E26] px-1 rounded border border-[#282E3A]">
          ⌘K
        </span>
      </div>

      {/* Ações e Carrinho de Compras */}
      <div className="flex items-center gap-3 md:gap-4">
        <Link
          href="/catalog"
          className="hidden sm:inline-flex items-center gap-1.5 text-xs font-['Space_Grotesk'] text-[#F4F1EA] bg-[#12151B] hover:bg-[#1A1E26] border border-[#282E3A] hover:border-[#f2ca50] px-3 py-1.5 rounded transition-colors"
        >
          <span className="material-symbols-outlined text-sm text-[#f2ca50]">storefront</span>
          {config.navCatalog || 'Ver Loja'}
        </Link>

        {/* Carrinho de Compras */}
        <div className="relative">
          <Link
            href="/checkout"
            className="flex items-center gap-2 px-3 py-1.5 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] rounded font-['Space_Grotesk'] text-xs font-bold transition-all shadow-sm"
            title="Carrinho de Compras e Checkout"
          >
            <span className="material-symbols-outlined text-base">shopping_bag</span>
            <span className="hidden sm:inline">Carrinho</span>
            <span className="bg-[#08090B] text-[#f2ca50] text-[10px] px-1.5 py-0.2 rounded-full font-extrabold">
              {cartCount}
            </span>
          </Link>
        </div>

        {/* Notificações de Envio & Segurança */}
        <div className="flex items-center gap-1.5 text-[#9CA3AF] relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="p-1.5 hover:text-[#E5C875] transition-colors duration-150 rounded relative"
            title="Avisos e Pedidos"
          >
            <span className="material-symbols-outlined text-lg">notifications</span>
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#10B981] ring-2 ring-[#08090B]"></span>
          </button>

          {showNotifications && (
            <div className="absolute right-0 top-10 w-80 bg-[#1A1E26] border border-[#282E3A] rounded p-4 shadow-2xl z-50 text-xs font-['Space_Grotesk'] space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#282E3A]">
                <span className="font-bold text-[#F4F1EA] uppercase tracking-wider">Avisos da Loja</span>
                <span className="text-[10px] text-[#10B981]">1 Novo</span>
              </div>
              <div className="p-2.5 rounded bg-[#12151B] border border-[#282E3A] space-y-1">
                <div className="flex justify-between text-[#E5C875] font-semibold text-[11px]">
                  <span>Novo Produto Disponível</span>
                  <span className="text-[#9CA3AF]">Hoje</span>
                </div>
                <p className="text-[#9CA3AF] text-[11px]">
                  Camisa do Pelé Copa 1970 adicionada ao estoque com frete grátis segurado para todo o Brasil.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Perfil & Acesso Admin */}
        <div className="flex items-center gap-2 pl-2 border-l border-[#282E3A]">
          <Link
            href="/admin"
            className="w-8 h-8 rounded-full border border-[#C59B27] p-0.5 bg-[#1A1E26] hover:scale-105 transition-transform flex items-center justify-center text-[#E5C875] text-xs font-['Space_Grotesk'] font-bold overflow-hidden"
            title={session ? `Painel da Loja (${session.user.name})` : 'Entrar no Painel da Loja'}
          >
            {session ? (
              session.user.avatar ? (
                <img
                  src={session.user.avatar}
                  alt={session.user.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xs font-bold text-[#f2ca50]">
                  {session.user.name.charAt(0)}
                </span>
              )
            ) : (
              <img
                src={RELIC_IMAGES.curatorAvatar}
                alt="Administrador da Loja"
                className="w-full h-full rounded-full object-cover"
              />
            )}
          </Link>

          <Link
            href="/admin"
            className="hidden xl:flex items-center gap-1.5 text-xs font-['Space_Grotesk'] text-[#9CA3AF] hover:text-[#E5C875] transition-colors duration-150"
          >
            <span>{session ? session.user.name.split(' ')[0] : (config.navAdmin || 'Painel')}</span>
            {session && (
              <span
                className={`text-[9px] px-1 rounded uppercase font-bold ${
                  session.user.role === 'admin'
                    ? 'bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40'
                    : 'bg-emerald-950/60 text-emerald-400 border border-emerald-500/40'
                }`}
              >
                {session.user.role === 'admin' ? 'Admin' : 'Operador'}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
