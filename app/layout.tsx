import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Diamond Relics Archive Vault — Sovereign Provenance Ledger',
  description: 'Arquivo soberano de memorabilia esportiva mundial, custódia fiduciária em escrow e ledger criptográfico de proveniência com certificação forense.',
  openGraph: {
    title: 'Diamond Relics Archive Vault — Sovereign Provenance Ledger',
    description: 'Arquivo soberano de memorabilia esportiva mundial, custódia fiduciária em escrow e ledger criptográfico de proveniência com certificação forense.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Diamond Relics Archive Vault — Sovereign Provenance Ledger',
    description: 'Arquivo soberano de memorabilia esportiva mundial, custódia fiduciária em escrow e ledger criptográfico de proveniência com certificação forense.',
  },
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="pt-BR" className="dark">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          href="https://fonts.googleapis.com/css2?family=Manrope:wght@300;400;500;600;700;800&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&family=Space+Grotesk:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap"
          rel="stylesheet"
        />
      </head>
      <body suppressHydrationWarning className="bg-[#08090B] text-[#e2e2e6] min-h-screen selection:bg-[#d4af37] selection:text-[#08090B] antialiased">
        {children}
      </body>
    </html>
  );
}
