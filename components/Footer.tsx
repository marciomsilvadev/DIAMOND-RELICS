'use client';

import Link from 'next/link';

export function Footer() {
  return (
    <footer className="border-t border-[#282E3A] bg-[#08090B] text-[#9CA3AF] text-xs font-['Space_Grotesk'] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-6 border-b border-[#282E3A]">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[#f2ca50] text-xl"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                diamond
              </span>
              <span className="text-sm font-['Playfair_Display'] font-bold text-[#F4F1EA] uppercase tracking-wider">
                Diamond Relics Archive Vault
              </span>
            </div>
            <p className="text-[#9CA3AF] font-['Manrope'] text-xs leading-relaxed max-w-sm">
              Infraestrutura fiduciária para custódia, autenticação forense de alta precisão e liquidação em escrow de memorabilia esportiva de valor histórico universal.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#E5C875]">
              <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
              <span>GENÈVE • LONDRES • SÃO PAULO • NOVA YORK</span>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            <div>
              <span className="text-[#F4F1EA] font-semibold block mb-2 uppercase tracking-wider">
                Segurança &amp; Auditoria
              </span>
              <ul className="space-y-1.5 text-[#9CA3AF]">
                <li>
                  <Link href="/admin" className="hover:text-[#E5C875] transition-colors">
                    Integridade de Ledger v4.12
                  </Link>
                </li>
                <li>
                  <Link href="/checkout" className="hover:text-[#E5C875] transition-colors">
                    Termos de Custódia Segura
                  </Link>
                </li>
                <li>
                  <Link href="/checkout" className="hover:text-[#E5C875] transition-colors">
                    Escrow Blindado
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-[#E5C875] transition-colors">
                    Relatório de Auditoria SOC-2
                  </Link>
                </li>
              </ul>
            </div>

            <div>
              <span className="text-[#F4F1EA] font-semibold block mb-2 uppercase tracking-wider">
                Atalhos do Acervo
              </span>
              <ul className="space-y-1.5 text-[#9CA3AF]">
                <li>
                  <Link href="/" className="hover:text-[#E5C875] transition-colors">
                    Home (index.html)
                  </Link>
                </li>
                <li>
                  <Link href="/catalog" className="hover:text-[#E5C875] transition-colors">
                    Catálogo de Lotes (catalog.html)
                  </Link>
                </li>
                <li>
                  <Link href="/product" className="hover:text-[#E5C875] transition-colors text-[#E5C875]">
                    Lote Pelé 1970 (product.html)
                  </Link>
                </li>
                <li>
                  <Link href="/checkout" className="hover:text-[#E5C875] transition-colors">
                    Checkout &amp; Custódia (checkout.html)
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-[#E5C875] transition-colors">
                    Ledger Admin (admin.html)
                  </Link>
                </li>
              </ul>
            </div>

            <div className="col-span-2 sm:col-span-1">
              <span className="text-[#F4F1EA] font-semibold block mb-2 uppercase tracking-wider">
                Garantias Fiduciárias
              </span>
              <ul className="space-y-1.5 text-[#9CA3AF]">
                <li className="text-[#E5C875]">Lloyd&apos;s of London £50M</li>
                <li className="text-[#E5C875]">Swiss Freeport Box 84</li>
                <li className="text-[#E5C875]">Brink&apos;s Global Nível IV</li>
                <li className="text-[#10B981] flex items-center gap-1">
                  <span className="material-symbols-outlined text-xs">verified</span>
                  SHA-256 Imutável
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-4 gap-3 text-[#9CA3AF] text-[11px]">
          <div className="flex items-center gap-2">
            <span
              className="material-symbols-outlined text-[#C59B27] text-sm"
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              verified_user
            </span>
            <span>© 2024 Diamond Relics Ltd. Todos os direitos reservados. Protocolo Forense SHA-256 Validado.</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#E5C875]">Mainnet Vault Node #09-LX</span>
            <span>•</span>
            <span className="text-[#10B981]">Custódia Segurada por Lloyd&apos;s Syndicate</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
