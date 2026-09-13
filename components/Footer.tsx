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

  const hasCol1Items =
    Boolean(config.footerCol1Item1?.trim() ||
    config.footerCol1Item2?.trim() ||
    config.footerCol1Item3?.trim() ||
    config.footerCol1Item4?.trim());

  const hasCol2Items =
    Boolean(config.footerCol2Item1?.trim() ||
    config.footerCol2Item2?.trim() ||
    config.footerCol2Item3?.trim() ||
    config.footerCol2Item4?.trim() ||
    config.footerCol2Item5?.trim());

  const hasCol3Items =
    Boolean(config.footerPaymentPix?.trim() ||
    config.footerPaymentCard?.trim() ||
    config.footerPaymentBoleto?.trim() ||
    config.footerPaymentInsurance?.trim());

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
            {config.footerDescription?.trim() && (
              <p className="text-[#9CA3AF] font-['Manrope'] text-xs leading-relaxed max-w-sm">
                {config.footerDescription}
              </p>
            )}
            <div className="flex flex-col gap-1 text-[11px] text-[#E5C875]">
              {config.contactPhone?.trim() && (
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                  <span>WhatsApp / Concierge: {config.contactPhone}</span>
                </div>
              )}
              {config.contactEmail?.trim() && (
                <div className="flex items-center gap-1.5 text-[#9CA3AF]">
                  <span>E-mail: {config.contactEmail}</span>
                </div>
              )}
            </div>
          </div>

          <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-6 text-xs">
            {/* Coluna 1: Segurança & Garantia */}
            {(config.footerCol1Title?.trim() || hasCol1Items) && (
              <div>
                {config.footerCol1Title?.trim() && (
                  <span className="text-[#F4F1EA] font-semibold block mb-2 uppercase tracking-wider">
                    {config.footerCol1Title}
                  </span>
                )}
                <ul className="space-y-1.5 text-[#9CA3AF]">
                  {config.footerCol1Item1?.trim() && (
                    <li>
                      <Link href="/catalog" className="hover:text-[#E5C875] transition-colors">
                        {config.footerCol1Item1}
                      </Link>
                    </li>
                  )}
                  {config.footerCol1Item2?.trim() && (
                    <li>
                      <Link href="/checkout" className="hover:text-[#E5C875] transition-colors">
                        {config.footerCol1Item2}
                      </Link>
                    </li>
                  )}
                  {config.footerCol1Item3?.trim() && (
                    <li>
                      <Link href="/checkout" className="hover:text-[#E5C875] transition-colors">
                        {config.footerCol1Item3}
                      </Link>
                    </li>
                  )}
                  {config.footerCol1Item4?.trim() && (
                    <li>
                      <Link href="/checkout" className="hover:text-[#E5C875] transition-colors">
                        {config.footerCol1Item4}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Coluna 2: Navegação da Loja */}
            {(config.footerCol2Title?.trim() || hasCol2Items) && (
              <div>
                {config.footerCol2Title?.trim() && (
                  <span className="text-[#F4F1EA] font-semibold block mb-2 uppercase tracking-wider">
                    {config.footerCol2Title}
                  </span>
                )}
                <ul className="space-y-1.5 text-[#9CA3AF]">
                  {config.footerCol2Item1?.trim() && (
                    <li>
                      <Link href="/" className="hover:text-[#E5C875] transition-colors">
                        {config.footerCol2Item1}
                      </Link>
                    </li>
                  )}
                  {config.footerCol2Item2?.trim() && (
                    <li>
                      <Link href="/catalog" className="hover:text-[#E5C875] transition-colors">
                        {config.footerCol2Item2}
                      </Link>
                    </li>
                  )}
                  {config.footerCol2Item3?.trim() && (
                    <li>
                      <Link href="/product" className="hover:text-[#E5C875] transition-colors text-[#E5C875]">
                        {config.footerCol2Item3}
                      </Link>
                    </li>
                  )}
                  {config.footerCol2Item4?.trim() && (
                    <li>
                      <Link href="/checkout" className="hover:text-[#E5C875] transition-colors">
                        {config.footerCol2Item4}
                      </Link>
                    </li>
                  )}
                  {config.footerCol2Item5?.trim() && (
                    <li>
                      <Link href="/admin" className="hover:text-[#E5C875] transition-colors">
                        {config.footerCol2Item5}
                      </Link>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {/* Coluna 3: Formas de Pagamento */}
            {(config.footerCol3Title?.trim() || hasCol3Items) && (
              <div className="col-span-2 sm:col-span-1">
                {config.footerCol3Title?.trim() && (
                  <span className="text-[#F4F1EA] font-semibold block mb-2 uppercase tracking-wider">
                    {config.footerCol3Title}
                  </span>
                )}
                <ul className="space-y-1.5 text-[#9CA3AF]">
                  {config.footerPaymentPix?.trim() && (
                    <li className="text-[#10B981] font-semibold">
                      {config.footerPaymentPix}
                    </li>
                  )}
                  {config.footerPaymentCard?.trim() && (
                    <li className="text-[#E5C875]">
                      {config.footerPaymentCard}
                    </li>
                  )}
                  {config.footerPaymentBoleto?.trim() && (
                    <li className="text-[#E5C875]">
                      {config.footerPaymentBoleto}
                    </li>
                  )}
                  {config.footerPaymentInsurance?.trim() && (
                    <li className="text-[#9CA3AF] flex items-center gap-1 mt-2">
                      <span className="material-symbols-outlined text-xs text-[#10B981]">verified</span>
                      {config.footerPaymentInsurance}
                    </li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-col md:flex-row justify-between items-center pt-4 gap-3 text-[#9CA3AF] text-[11px]">
          {config.footerCopyright?.trim() && (
            <div className="flex items-center gap-2">
              <span
                className="material-symbols-outlined text-[#C59B27] text-sm"
                style={{ fontVariationSettings: "'FILL' 1" }}
              >
                verified_user
              </span>
              <span>{config.footerCopyright}</span>
            </div>
          )}
          {config.footerSecuritySeal?.trim() && (
            <div className="flex items-center gap-4">
              <span className="text-[#E5C875]">{config.footerSecuritySeal}</span>
            </div>
          )}
        </div>
      </div>
    </footer>
  );
}
