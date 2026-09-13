'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { getStoredSiteConfig, DEFAULT_SITE_CONFIG, SiteConfig } from '@/lib/site-config-store';

export function Footer() {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);

  useEffect(() => {
    setConfig(getStoredSiteConfig());
    const handleUpdate = () => setConfig(getStoredSiteConfig());
    window.addEventListener('diamond_config_updated', handleUpdate);
    return () => window.removeEventListener('diamond_config_updated', handleUpdate);
  }, []);

  return (
    <footer className="border-t border-[#282E3A] bg-[#08090B] text-[#9CA3AF] text-xs font-['Space_Grotesk'] mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-6 border-b border-[#282E3A]">
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <img
                src="/diamond-relics-logo.png"
                alt={config.storeName || 'Diamond Relics'}
                className="h-14 w-auto object-contain drop-shadow-[0_0_15px_rgba(242,202,80,0.3)] shrink-0"
              />
              <div className="flex flex-col">
                <span className="text-sm font-['Playfair_Display'] font-bold text-[#F4F1EA] uppercase tracking-wider">
                  {config.storeName || 'DIAMOND RELICS'}
                </span>
                <span className="text-[10px] text-[#f2ca50] font-medium tracking-widest uppercase">
                  Artigos Esportivos de Colecionador
                </span>
                <span className="text-[10px] text-[#9CA3AF] font-mono mt-0.5">
                  @diamond.relics
                </span>
              </div>
            </div>
            <p className="text-[#9CA3AF] font-['Manrope'] text-xs leading-relaxed max-w-sm">
              {config.footerDescription}
            </p>
            <div className="flex flex-col gap-1 text-[11px] text-[#E5C875]">
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                <span>WhatsApp / Concierge: {config.contactPhone}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[#9CA3AF]">
                <span>E-mail: {config.contactEmail}</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            {/* Coluna 1: Segurança & Garantia */}
            <div>
              <span className="text-[#F4F1EA] font-semibold block mb-2 uppercase tracking-wider">
                {config.footerCol1Title || 'Segurança & Garantia'}
              </span>
              <ul className="space-y-1.5 text-[#9CA3AF]">
                <li>
                  <Link href="/catalog" className="hover:text-[#E5C875] transition-colors">
                    {config.footerCol1Item1 || 'Certificado de Autenticidade'}
                  </Link>
                </li>
                <li>
                  <Link href="/checkout" className="hover:text-[#E5C875] transition-colors">
                    {config.footerCol1Item2 || 'Envio com Seguro Especial'}
                  </Link>
                </li>
                <li>
                  <Link href="/checkout" className="hover:text-[#E5C875] transition-colors">
                    {config.footerCol1Item3 || 'Garantia Vitalícia de Origem'}
                  </Link>
                </li>
                <li>
                  <Link href="/checkout" className="hover:text-[#E5C875] transition-colors">
                    {config.footerCol1Item4 || 'Política de Devolução (CDC)'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 2: Navegação da Loja */}
            <div>
              <span className="text-[#F4F1EA] font-semibold block mb-2 uppercase tracking-wider">
                {config.footerCol2Title || 'Navegação da Loja'}
              </span>
              <ul className="space-y-1.5 text-[#9CA3AF]">
                <li>
                  <Link href="/" className="hover:text-[#E5C875] transition-colors">
                    {config.footerCol2Item1 || 'Página Inicial'}
                  </Link>
                </li>
                <li>
                  <Link href="/catalog" className="hover:text-[#E5C875] transition-colors">
                    {config.footerCol2Item2 || 'Todos os Produtos'}
                  </Link>
                </li>
                <li>
                  <Link href="/product" className="hover:text-[#E5C875] transition-colors text-[#E5C875]">
                    {config.footerCol2Item3 || 'Camisa Pelé 1970'}
                  </Link>
                </li>
                <li>
                  <Link href="/checkout" className="hover:text-[#E5C875] transition-colors">
                    {config.footerCol2Item4 || 'Carrinho de Compras'}
                  </Link>
                </li>
                <li>
                  <Link href="/admin" className="hover:text-[#E5C875] transition-colors">
                    {config.footerCol2Item5 || 'Painel do Administrador'}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Coluna 3: Formas de Pagamento */}
            <div className="col-span-2 sm:col-span-1">
              <span className="text-[#F4F1EA] font-semibold block mb-2 uppercase tracking-wider">
                {config.footerCol3Title || 'Formas de Pagamento'}
              </span>
              <ul className="space-y-1.5 text-[#9CA3AF]">
                <li className="text-[#10B981] font-semibold">
                  {config.footerPaymentPix || 'PIX (5% de desconto à vista)'}
                </li>
                <li className="text-[#E5C875]">
                  {config.footerPaymentCard || 'Cartão em até 12x sem juros'}
                </li>
                <li className="text-[#E5C875]">
                  {config.footerPaymentBoleto || 'Boleto Bancário / TED'}
                </li>
                <li className="text-[#9CA3AF] flex items-center gap-1 mt-2">
                  <span className="material-symbols-outlined text-xs text-[#10B981]">verified</span>
                  {config.footerPaymentInsurance || "Seguro Lloyd's até R$ 50M"}
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
            <span>{config.footerCopyright}</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-[#E5C875]">{config.footerSecuritySeal || 'Site 100% Seguro com Certificado SSL'}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
