'use client';

export interface SiteConfig {
  storeName: string;
  storeBadge: string;
  topBannerText: string;
  contactPhone: string;
  contactEmail: string;

  // Logotipo da Empresa
  customLogoUrl?: string;

  // Modo de Exibição do Destaque da Home (Lado Direito do Hero)
  heroDisplayMode?: 'product' | 'vitrine' | 'logo' | 'custom_image';
  heroSelectedProductId?: string;
  heroCustomImageUrl?: string;
  heroCustomTag?: string;
  heroCustomTitle?: string;
  heroCustomSubtitle?: string;
  heroCustomBtnText?: string;
  heroCustomBtnLink?: string;
  heroCustomInstagramHandle?: string;

  // ==========================================
  // Controle de Visibilidade dos Painéis (Janelas)
  // ==========================================
  showTopRelayBar: boolean;
  showNavbarBadge: boolean;
  navbarBadgeText: string;
  showHeroSection: boolean;
  showHeroTrustBadges: boolean;
  showVitrineSection: boolean;
  showCoaSection: boolean;
  showBenefitsSection: boolean;
  showProductCertificateBanner?: boolean;
  showProductFreightSimulator?: boolean;
  showProductTrustBadges?: boolean;
  showProductConcierge?: boolean;

  // ==========================================
  // Textos do Painel de Consulta de Certificado (COA)
  // ==========================================
  coaBadge: string;
  coaTitle: string;
  coaSubtitle: string;
  coaPlaceholder: string;
  coaBtnText: string;

  // ==========================================
  // Textos do Painel de Garantias e Benefícios
  // ==========================================
  benefitsBadge: string;
  benefitsTitle: string;
  benefit1Icon: string;
  benefit1Title: string;
  benefit1Desc: string;
  benefit2Icon: string;
  benefit2Title: string;
  benefit2Desc: string;
  benefit3Icon: string;
  benefit3Title: string;
  benefit3Desc: string;

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

  // Carrossel de Peças em Destaque
  featuredAutoPlay: boolean;
  featuredIntervalSeconds: number;

  // Página de Catálogo
  catalogPageTitle: string;
  catalogPageSubtitle: string;

  // Página de Detalhes do Produto
  productPageBadge: string;
  productSecurityNotice: string;
  productCertificateTitle?: string;
  productCertificateSubtitle?: string;
  productCertificateBtnText?: string;
  productFreightTitle?: string;
  productFreightBtnText?: string;
  productFreightPlaceholder?: string;
  productFreightResultText?: string;
  productFreightInvalidText?: string;
  productTrustBadge1Title?: string;
  productTrustBadge1Subtitle?: string;
  productTrustBadge2Title?: string;
  productTrustBadge2Subtitle?: string;
  productConciergeTitle?: string;
  productConciergeSubtitle?: string;
  productConciergeBtnText?: string;
  productConciergePhone?: string;
  productConciergePhoneLabel?: string;
  showProductConciergePhoneLine?: boolean;
  productConciergeWhatsappMessage?: string;

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
    'Loja Oficial de Relíquias Esportivas Autênticas • Pagamento 100% em Reais • Entrega Segura e Segurada',
  contactPhone: '+55 (11) 99842-1970',
  contactEmail: 'concierge@diamondrelics.com.br',

  // Logotipo da Empresa
  customLogoUrl: '/diamond-relics-logo.png',

  // Modo de Exibição do Card em Destaque (Hero)
  heroDisplayMode: 'product',
  heroSelectedProductId: '',
  heroCustomImageUrl: '',
  heroCustomTag: 'DESTAQUE EXCLUSIVO',
  heroCustomTitle: 'Diamond Relics • Acervo Oficial',
  heroCustomSubtitle:
    'Relíquias esportivas originais com laudos forenses e certificado vitalício de procedência.',
  heroCustomBtnText: 'Explorar Acervo',
  heroCustomBtnLink: '/catalog',
  heroCustomInstagramHandle: '@diamond.relics',

  // Visibilidade Padrão dos Painéis
  showTopRelayBar: true,
  showNavbarBadge: true,
  navbarBadgeText: 'Envio Seguro Especializado',
  showHeroSection: true,
  showHeroTrustBadges: true,
  showVitrineSection: true,
  showCoaSection: true,
  showBenefitsSection: true,
  showProductCertificateBanner: true,
  showProductFreightSimulator: true,
  showProductTrustBadges: true,
  showProductConcierge: true,
  showProductConciergePhoneLine: true,

  // Textos do Painel de Consulta COA
  coaBadge: 'CONSULTA DE AUTENTICIDADE',
  coaTitle: 'Consulte o Certificado de um Produto',
  coaSubtitle:
    'Digite o código do certificado de autenticidade (COA) para verificar os laudos periciais e a procedência do item no acervo.',
  coaPlaceholder: 'Ex: COA-PEL-1970-MEX-9801',
  coaBtnText: 'Consultar',

  // Textos do Painel de Garantias e Benefícios
  benefitsBadge: 'GARANTIAS EXCLUSIVAS',
  benefitsTitle: 'Por que Comprar na Diamond Relics?',
  benefit1Icon: 'biotech',
  benefit1Title: 'Perícia Forense 8K e C14',
  benefit1Desc:
    'Todas as peças passam por rigorosa análise espectrométrica molecular, correspondência fotográfica e laudos periciais chancelados.',
  benefit2Icon: 'shield',
  benefit2Title: 'Transporte Especial Segurado',
  benefit2Desc:
    "Logística de alta segurança com rastreamento contínuo e apólice de seguro total da Lloyd's of London até a entrega em mãos.",
  benefit3Icon: 'receipt_long',
  benefit3Title: 'Nota Fiscal e Certificado Notarial',
  benefit3Desc:
    'Emissão de Nota Fiscal Eletrônica e termo de autenticidade vitalício registrado em Cartório de Registro de Títulos e Documentos.',

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
    'Comercializamos peças históricas de colecionador: camisas autênticas usadas em finais de Copas, capacetes genuínos de Ayrton Senna e artigos lendários. Todas com laudo forense pericial, nota fiscal, certificado vitalício e transporte seguro especializado para todo o Brasil.',
  heroBtnPrimary: 'Explorar Catálogo de Produtos',
  heroBtnSecondary: 'Ver Peça em Destaque',

  // Vitrine de Produtos
  showcaseBadge: 'PRODUTOS DISPONÍVEIS EM ESTOQUE',
  showcaseTitle: 'Acervo de Relíquias Esportivas',
  showcaseSubtitle: 'Peças históricas originais com laudos forenses e certificado vitalício.',

  // Carrossel de Peças em Destaque
  featuredAutoPlay: true,
  featuredIntervalSeconds: 4,

  // Página de Catálogo
  catalogPageTitle: 'Catálogo de Relíquias Esportivas',
  catalogPageSubtitle:
    'Peças históricas originais dos maiores atletas do mundo com laudos forenses, certificado vitalício de autenticidade e entrega especial segurada para todo o Brasil.',

  // Página de Detalhes do Produto
  productPageBadge: 'Item Histórico Genuíno • Acervo Oficial',
  productSecurityNotice:
    'Certificado de Autenticidade Vitalício • Laudo Forense Chancelado • Entrega Segura em Todo o Brasil',
  productCertificateTitle: 'Certificado de Autenticidade Vitalício #COA-9801',
  productCertificateSubtitle:
    'Laudo pericial com espectrometria molecular e correspondência fotográfica do jogo.',
  productCertificateBtnText: 'Baixar Laudo Oficial (PDF)',
  productFreightTitle: 'Simulador de Frete e Entrega Segura',
  productFreightBtnText: 'Calcular',
  productFreightPlaceholder: 'Digite seu CEP (ex: 01310-100)',
  productFreightResultText:
    'Transporte Especializado: Grátis (Prazo estimado: 2 a 4 dias úteis com seguro total Lloyd\'s)',
  productFreightInvalidText: 'Por favor, digite um CEP válido com 8 dígitos.',
  productTrustBadge1Title: 'Seguro Total',
  productTrustBadge1Subtitle: 'Apólice Lloyd\'s',
  productTrustBadge2Title: 'Garantia Vitalícia',
  productTrustBadge2Subtitle: 'Autenticidade Forense',
  productConciergeTitle: 'Atendimento VIP & Concierge',
  productConciergeSubtitle:
    'Dúvidas sobre o produto ou agendamento de inspeção presencial.',
  productConciergeBtnText: 'Falar Agora',
  productConciergePhone: '+55 (11) 99842-1970',
  productConciergePhoneLabel: 'WhatsApp:',
  productConciergeWhatsappMessage:
    'Olá! Gostaria de atendimento VIP sobre uma peça no acervo da Diamond Relics.',

  // Rótulos de Botões Globais
  btnBuyNow: 'Comprar Agora',
  btnViewDetails: 'Ver Detalhes',
  btnAddToCart: 'Adicionar ao Carrinho',
  btnSoldOut: 'Peça Vendida',

  // Rodapé & Institucional
  footerDescription:
    'A mais prestigiada loja de memorabilia e relíquias esportivas originais do Brasil. Comercializamos itens autênticos com laudos forenses, certificado de autenticidade vitalício e entrega especial segurada.',
  footerCopyright:
    '© 2024 Diamond Relics Brasil Ltda. CNPJ: 48.912.840/0001-92. Todos os direitos reservados. Todos os preços em Reais (R$).',

  // Rodapé - Coluna 1: Segurança & Garantia
  footerCol1Title: 'Segurança & Garantia',
  footerCol1Item1: 'Certificado de Autenticidade',
  footerCol1Item2: 'Envio com Seguro Especial',
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
    let raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(DEFAULT_SITE_CONFIG));
      return DEFAULT_SITE_CONFIG;
    }

    // Auto-sanitização de cache antigo (remove qualquer vestígio de escolta armada/blindada em navegadores antigos)
    if (raw.includes('Blindada') || raw.includes('blindada') || raw.includes('Armada') || raw.includes('armada')) {
      raw = raw
        .replace(/Entrega Blindada Segurada/gi, 'Entrega Segura e Segurada')
        .replace(/com Escolta Blindada/gi, 'Especializado')
        .replace(/Escolta Armada/gi, 'Especial Segurado')
        .replace(/Transporte Blindado/gi, 'Envio Especializado')
        .replace(/Transporte com Escolta Armada/gi, 'Transporte Especial Segurado');
      localStorage.setItem(CONFIG_STORAGE_KEY, raw);
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
