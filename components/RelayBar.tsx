'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { getStoredSiteConfig, DEFAULT_SITE_CONFIG, SiteConfig } from '@/lib/site-config-store';
import { getCurrentSession, logout, AuthSession } from '@/lib/auth-store';

export function RelayBar() {
  const pathname = usePathname();
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    setConfig(getStoredSiteConfig());
    setSession(getCurrentSession());

    const handleConfigUpdate = () => setConfig(getStoredSiteConfig());
    const handleSessionUpdate = () => setSession(getCurrentSession());

    window.addEventListener('diamond_config_updated', handleConfigUpdate);
    window.addEventListener('diamond_session_updated', handleSessionUpdate);

    return () => {
      window.removeEventListener('diamond_config_updated', handleConfigUpdate);
      window.removeEventListener('diamond_session_updated', handleSessionUpdate);
    };
  }, []);

  const links = [
    { href: '/', label: config.navHome || 'Início' },
    { href: '/catalog', label: config.navCatalog || 'Catálogo de Produtos' },
    { href: '/product', label: config.navProduct || 'Peça em Destaque' },
    { href: '/checkout', label: config.navCheckout || 'Carrinho & Checkout' },
  ];

  if (config.showTopRelayBar === false) {
    return null;
  }

  return (
    <aside
      aria-label="Navegação da Loja Virtual"
      className="w-full bg-[#08090B] border-b border-[#282E3A] px-4 md:px-6 py-2 flex flex-wrap items-center justify-between text-[12px] font-['Space_Grotesk'] text-[#9CA3AF] z-50 select-none"
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
        <span className="text-[#E5C875] font-medium tracking-wide">
          {config.storeName ? config.storeName.toUpperCase() : 'DIAMOND RELICS'} BRASIL
        </span>
        <span className="text-[#282E3A]">|</span>
        <span className="hidden sm:inline">{config.topBannerText}</span>
      </div>

      <nav className="flex items-center gap-2 md:gap-3 overflow-x-auto py-1 custom-scrollbar">
        {links.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`px-2.5 py-1 rounded text-xs transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap ${
                isActive
                  ? 'bg-[#1A1E26] text-[#f2ca50] border border-[#f2ca50] font-semibold shadow-[0_0_12px_rgba(212,175,55,0.25)]'
                  : 'bg-[#12151B] text-[#9CA3AF] hover:text-[#E5C875] hover:border-[#C59B27] border border-[#282E3A]'
              }`}
            >
              {isActive && (
                <span className="w-1.5 h-1.5 rounded-full bg-[#f2ca50]"></span>
              )}
              {item.label}
              {isActive && (
                <span className="text-[10px] text-[#E5C875] opacity-75 font-normal">(Ativo)</span>
              )}
            </Link>
          );
        })}
      </nav>
    </aside>
  );

}
