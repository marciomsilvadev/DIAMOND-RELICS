'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function RelayBar() {
  const pathname = usePathname();

  const links = [
    { href: '/', label: 'Home', fullLabel: 'Home (index.html)' },
    { href: '/catalog', label: 'Catálogo (Acervo)', fullLabel: 'Catálogo (catalog.html)' },
    { href: '/product', label: 'Lote Pelé 1970', fullLabel: 'Lote Pelé (product.html)' },
    { href: '/checkout', label: 'Custódia & Checkout', fullLabel: 'Custódia (checkout.html)' },
    { href: '/admin', label: 'Ledger Admin', fullLabel: 'Ledger Admin (admin.html)' },
  ];

  return (
    <aside
      aria-label="Simulação de Rotas do Sistema"
      className="w-full bg-[#08090B] border-b border-[#282E3A] px-4 md:px-6 py-2 flex flex-wrap items-center justify-between text-[12px] font-['Space_Grotesk'] text-[#9CA3AF] z-50 select-none"
    >
      <div className="flex items-center gap-2">
        <span className="w-2 h-2 rounded-full bg-[#10B981] animate-pulse"></span>
        <span className="text-[#E5C875] font-medium tracking-wide">DIAMOND RELICS NET</span>
        <span className="text-[#282E3A]">|</span>
        <span className="hidden sm:inline">Nó Ativo: Zurich Core-01 • Ledger SHA-256</span>
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
