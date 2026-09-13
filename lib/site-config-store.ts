'use client';

export interface SiteConfig {
  storeName: string;
  storeBadge: string;
  topBannerText: string;
  contactPhone: string;
  contactEmail: string;

  // Nomes das Abas do Menu de Navegação
  navHome: string;
  navCatalog: string;
  navProduct: string;
  navCheckout: string;
  navAdmin: string;

  // Hero Section
  heroTagline: string;
  heroTitle: string;
  heroSubtitle: string;
  heroBtnPrimary: string;
  heroBtnSecondary: string;

  // Vitrine de Produtos (Home)
  showcaseBadge: string;
  showcaseTitle: string;
  showcaseSubtitle: string;

  // Página de Catálogo
  catalogPageTitle: string;
  catalogPageSubtitle: string;

  // Página de Detalhes do Produto
  productPageBadge: string;
  productSecurityNotice: string;

  // Rótulos de Botões Globais
  btnBuyNow: string;
  btnViewDetails: string;
  btnAddToCart: string;
  btnSoldOut: string;

  // Rodapé & Institucional
  footerDescription: string;
  footerCopyright: string;

  // Rodapé - Coluna 1: Segurança & Garantia
  footerCol1Title: string;
  footerCol1Item1: string;
  footerCol1Item2: string;
  footerCol1Item3: string;
  footerCol1Item4: string;

  // Rodapé - Coluna 2: Navegação da Loja
  footerCol2Title: string;
  footerCol2Item1: string;
  footerCol2Item2: string;
  footerCol2Item3: string;
  footerCol2Item4: string;
  footerCol2Item5: string;

  // Rodapé - Coluna 3: Formas de Pagamento
  footerCol3Title: string;
  footerPaymentPix: string;
  footerPaymentCard: string;
  footerPaymentBoleto: string;
  footerPaymentInsurance: string;

  // Selo de Segurança Inferior
  footerSecuritySeal: string;
}

export const DEFAULT_SITE_CONFIG: SiteConfig = {
  storeName: 'Diamond Relics',
  storeBadge: 'LOJA OFICIAL',
  topBannerText:
    'Loja Oficial de Relíquias Esportivas Autênticas • Pagamento 100% em Reais • Entrega Blindada Segurada',
  contactPhone: '+55 (11) 99842-1970',
  contactEmail: 'concierge@diamondrelics.com.br',

  // Nomes das Abas de Navegação
  navHome: 'Início',
  navCatalog: 'Catálogo de Produtos',
  navProduct: 'Peça em Destaque',
  navCheckout: 'Carrinho & Checkout',
  navAdmin: 'Painel da Loja',

  // Hero Section
  heroTagline: 'A MAIOR LOJA DE MEMORABILIA ESPORTIVA DO BRASIL',
  heroTitle: 'Relíquias Esportivas Originais dos Maiores Ícones do Mundo',
  heroSubtitle:
    'Comercializamos peças históricas de colecionador: camisas autênticas usadas em finais de Copas, capacetes genuínos de Ayrton Senna e artigos lendários. Todas com laudo forense pericial, nota fiscal, certificado vitalício e transporte com escolta armada para todo o Brasil.',
  heroBtnPrimary: 'Explorar Catálogo de Produtos',
  heroBtnSecondary: 'Ver Peça em Destaque',

  // Vitrine de Produtos
  showcaseBadge: 'PRODUTOS DISPONÍVEIS EM ESTOQUE',
  showcaseTitle: 'Acervo de Relíquias Esportivas',
  showcaseSubtitle: 'Peças históricas originais com laudos forenses e certificado vitalício.',

  // Página de Catálogo
  catalogPageTitle: 'Catálogo de Relíquias Esportivas',
  catalogPageSubtitle:
    'Peças históricas originais dos maiores atletas do mundo com laudos forenses, certificado vitalício de autenticidade e entrega segura blindada para todo o Brasil.',

  // Página de Detalhes do Produto
  productPageBadge: 'Item Histórico Genuíno • Acervo Oficial',
  productSecurityNotice:
    'Certificado de Autenticidade Vitalício • Laudo Forense Chancelado • Entrega Blindada em Todo o Brasil',

  // Rótulos de Botões Globais
  btnBuyNow: 'Comprar Agora',
  btnViewDetails: 'Ver Detalhes',
  btnAddToCart: 'Adicionar ao Carrinho',
  btnSoldOut: 'Peça Vendida',

  // Rodapé & Institucional
  footerDescription:
    'A mais prestigiada loja de memorabilia e relíquias esportivas originais do Brasil. Comercializamos itens autênticos com laudos forenses, certificado de autenticidade vitalício e entrega blindada segurada.',
  footerCopyright:
    '© 2024 Diamond Relics Brasil Ltda. CNPJ: 48.912.840/0001-92. Todos os direitos reservados. Todos os preços em Reais (R$).',

  // Rodapé - Coluna 1: Segurança & Garantia
  footerCol1Title: 'Segurança & Garantia',
  footerCol1Item1: 'Certificado de Autenticidade',
  footerCol1Item2: 'Envio com Transporte Blindado',
  footerCol1Item3: 'Garantia Vitalícia de Origem',
  footerCol1Item4: 'Política de Devolução (CDC)',

  // Rodapé - Coluna 2: Navegação da Loja
  footerCol2Title: 'Navegação da Loja',
  footerCol2Item1: 'Página Inicial',
  footerCol2Item2: 'Todos os Produtos',
  footerCol2Item3: 'Camisa Pelé 1970',
  footerCol2Item4: 'Carrinho de Compras',
  footerCol2Item5: 'Painel do Administrador',

  // Rodapé - Coluna 3: Formas de Pagamento
  footerCol3Title: 'Formas de Pagamento',
  footerPaymentPix: 'PIX (5% de desconto à vista)',
  footerPaymentCard: 'Cartão em até 12x sem juros',
  footerPaymentBoleto: 'Boleto Bancário / TED',
  footerPaymentInsurance: "Seguro Lloyd's até R$ 50M",

  // Selo de Segurança Inferior
  footerSecuritySeal: 'Site 100% Seguro com Certificado SSL',
};

const CONFIG_STORAGE_KEY = 'diamond_relics_site_config_v1';

export function getStoredSiteConfig(): SiteConfig {
  if (typeof window === 'undefined') return DEFAULT_SITE_CONFIG;
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_SITE_CONFIG));
      return DEFAULT_SITE_CONFIG;
    }
    const parsed = JSON.parse(raw);
    return { ...DEFAULT_SITE_CONFIG, ...parsed };
  } catch (err) {
    console.error('Erro ao ler configurações do site:', err);
    return DEFAULT_SITE_CONFIG;
  }
}

export function saveStoredSiteConfig(config: SiteConfig): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
    window.dispatchEvent(new Event('diamond_config_updated'));
  } catch (err) {
    console.error('Erro ao salvar configurações do site:', err);
  }
}

export function resetSiteConfig(): SiteConfig {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(CONFIG_STORAGE_KEY);
    window.dispatchEvent(new Event('diamond_config_updated'));
  }
  return DEFAULT_SITE_CONFIG;
}
