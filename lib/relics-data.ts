export interface MediaItem {
  id: string;
  type: 'image' | 'video';
  url: string; // Base64 data URL ou link externo
  title?: string;
  isCover?: boolean;
}

export interface RelicItem {
  id: string;
  sku: string;
  title: string;
  athlete: string;
  sport: 'futebol' | 'f1' | 'basquete' | 'boxe';
  category: string;
  description: string;
  year: number;
  grade: string;
  priceBRL: number;
  valuationBRL: number; // compatibilidade com páginas existentes
  installments: string;
  status: 'available' | 'reserved' | 'sold';
  statusLabel: string;
  stockCount: number;
  custodian: string;
  custodianFacility: string;
  insurancePolicy: string;
  sha256Hash: string;
  imageUrl: string;
  gallery?: MediaItem[]; // Galeria de fotos e vídeos do produto
  featured?: boolean; // Peça em Destaque na vitrine da Home
  altText: string;
  verifiedMethod: string;
}

export const RELIC_IMAGES = {
  peleJerseyCase: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBsZG_y0Z4wvBEfQUC0iKZoxsBPYIkKNDUsyZiy_M3IpMFUC5r_XavismKMlgAcomS-0gKJigrInrzpllgJhjIJvqc6_QB3F7h3xRKHOKq8Z7WqXwl1jPQqz7m7k18CII2XLLyFGyOGoCs1H9wtIhoVrYnLr0ayWl81VGaTbkk33tQF3PXOvTHzXKVf5mu58Gzot6UwkIrl2OZ7XOSjvgy7Xm0DYQ039Nc17fvKVSH2qVczHMIRCYNuHw',
  curatorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD6CxnU3WfLdUTyHZTG5-19k6QVBO4zORaXAjPcQPwYfX97109qrIvxhDZdjwdcm-VjU5WqSw3nYlO9pygw4XVbyVjko6Ew3mCMQjgvfCQEm8OVt2wmDua6Ft54cGSwMH8DX8Hszk2Kxd_2D8ewJYdCCPLMktS58VhItwyf_FKKi9Q5B9JUXoW9tEiCzdD3dpsTgTz5HR99Ocrz1iN78wyy2WcGvsxCiGJheVrYGl-6G7A8ahBP4IHfmA',
  pele1970Catalog: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDZR_AhBbBFs8K0x6AyXLaiI5p8Zk2rEUynIMztLkakrkmujvgCrmoqPSa4K5qZikidMK6mCcYaRic2kY_AkTxj64C5c4ZkctmzWoXuqgaFRcUXuE56u9RoVastEJci7Y8RtotV1iiyKUOp2iLFyQ7VN4JN91mHSPPb2X_6wk8Kg_smJThvsrgHtddZKibhpQYKiVXszEKNUvD3hLfDZGe4WAPpQtkNIp-H8pnldRi8Wxe6SRHdjo7lPQ',
  senna1991Helmet: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAPyyPF_wr8q1cInGkHy5kXmsj2Lscj-s20NK9VWK1HKG19RSI1RzpOEBQ5YKEbKYZXBTjS7mDqsLSzjlvLNnBAG-VclINcra7aFpRXjRST9MadfVr49kaztqU-zm6OD1VjGMx0qvi7EJIWd-nIHku39f5dN9cG7nh-6slstLUV1FTXQUfdFlOk8XA8fQ3r7_tCGjHgA870sO5I4X5QvExnnu4W34uqKfPbj-qCsi_LKWkn81BEY6sQTA',
  jordan1998Jersey: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBw5oqr8pd2EaGz1Fq_f4CpZW-Nu4bsY_ExpP0dEZgUcoC8pyBJ0GWR4rhF2-g1CxIxO_ehVe5VsQMW-HsXkPhuL-d3BCoY1rxV9QG5_57jD59G3Ut2Xva3RxH4VHhGc7dRjokq3q5U0J5lpLgXbjnK7lMenLFfps1tffsA3dHJLwSrcf-MXcw1bcqkvANYnW2HtDwqwUrIgU3AbU47TmkBjv4wvoV5C5TP5sfy2t91rEYzkzbtRvNLvA',
  ali1971Gloves: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCiD-uaPJ3PTdB-U8J8WmVHURJ-egRdnioeMyJrTN7wBLk5-gP5ejgdeCykhVfWdWCu3lMWTEukRaDCIvYp-WqAjWgZCR62rEWwDyaV1qgBJOBnUCm7qaU5vdLNFh95BPe4Hj8zI--Ekc-b16T3i4smzIfj3SbOJ5RT2mQb61acimQuG4wwccGV-p4X2G70BvjUnjgqtFZnH1SRez1w646NOm9kHNAWW2mU5W7h9lrdzzsYqStA7UgN7w',
  pele1970Boot: 'https://lh3.googleusercontent.com/aida-public/AB6AXuD_YnmWFhS4bMteVXi91L0rFtZRe2Hqz6HovHBQiOUyzgRC2kxuYzJAV58VkQW9CFfIQ470FgPjzAxWzdLpFE2ODeKbhpc0npt3cHuQy3cMkuefVks5B3PQYeGs13_NArkDVEHmTWbKFXVF_ogRptYwUgQUlWp2X3xN4FMG24NId6ymzfVQFT2_ztVjbvtECemAaJ6TSEIpwaVbD9zd0J2Ujh3u3-o-jMOcH3AtThkLnyxKdYAMp0wdKA',
  f11993Trophy: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA9iTjcqQY3_NtNDHqb96xdLXew9zl4AQ-HpW8Zm0XdE7oqgmdAnBnEW_tXLzzMuzjQ74CSYgpdO7kA_tc1KRVatWxowtkQB7t0PX9npNS28VzDo9hKhVaqTvHtpVcI2y5-jUYG6E8jggXEI9SB-RUGAMjWqf8P7rl2XWHDvRWeZ2avAKodCk3dtE4u68Ac1xXmNnVhcOsmU1xEpNwtxMpfrTyZJAi1iBm2S4DHRQDau4c7IXHhcTjxpg',
  peleProductMacro: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC4fAbtTcGpcTHOMN4mlKtXJeqCytbHZS795HXL2VCbM8GMLMFeU4fpZ413Z40V7Ee9-zPHi9S5aNzI7RZGlnR2GccgXbHdCYd40CvvMOmfcGe_HEhyg48ZVD00eijbwzXco6fIID3QH3xxXVq_6Ap5MbM-qmNAH36-Iis9TBbYU2S8KxhFvAb3x4ei512ydh4G7dOoebPG4CzQlwj-vHUwJobxOEmSi8zvI0Tu310LAfDmL1lHoQijWA',
  peleProductFullFront: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBM6VpmA7jhA_rs3bZokIsL7htA5M8P3ADpJFjHjJw2nmowMrBymOa5IS0T149Q-GTPwlXX7LiWS6CylSc0A5dnK8M1sI3zJRdOa5KdmctnLRUGndXXdsuoit2JEO35H-lmX0sMSlnaHBXcDc0WL8ZSi6yvv9tXaS2T3TAWhpe6NKxvSCGf6ygt8EqZoJ83NH78v-otBjRLVr6CxnknjcPha_rAGXcwZga_dEyNp8X72TnEjcIJTtD-vw',
  peleProductSignature: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAqQbBbKb5EMMotCY_T0hvPbY0B7D40v1mFruA8-nWlKEKGw0Mk5O11w6oAMZAQnPd5L1G4LA-Isqt-7_KUVYsaP-_Txi5cVFa7y0ib5NwKVTOVLAkYF3yyj00ydf_QdyzUzhPR1fAHyRJSgPk28wHtHp0TRQ7oaE7JFoOG3ac_6Z5ErkSrRaJZ7mll6lOSQKf362xCOPBOOrLE_XkUc1fN5TGykXZYAnD2nyfbk2sQjIoZHSGR4SKz9Q',
  peleProductFabricWeave: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu39YRAXX7kysKvQnTecKFYK9DLXuyZHRDNe2aVfnoca-xkuK9fAgAVsddAZBBcFzlZwcIiT02yGB6lJfc6nTxMsAljuIZZEB0iIYKLOJEvl22xsgKnOMvCLAr7d2AeTTkid4rjgGqCql6jISTl-dU4aXudQPUYyXDXC3zVryVqhtWYvUCk9y5oUvXmzN9_QTnzc1bc5CztOoGgw-UmvvBtXnmFYbSXosC0V98MJNwGBN00g8nHrbPag',
  peleProductCoaDoc: 'https://lh3.googleusercontent.com/aida-public/AB6AXuArKb2tHmUgVavWRWsSXUDR0WbctZCOj38PKCtRk2ig6Om744G7p6zTxJ8H2E8ibbQTkXXI3inYH7dOr4Pe-ImV71ck7gL5acye6h4QQboEe4GFExFe4ssxmYoCfu49EJ786EB99JqkSezU808ZZqrPZZKaf2ytSwUnH5N28Tc_2BUqzbZYBeMoSOXq_mADBD_ykmVgb90uXQ_IFa5aHKTQSwaoyDw-jlPDKo6y-sH95v9ZdB6UL4GZqA',
  homeHeroPele: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBhiTFiQ1KEf_x4VjPqI_tfA7cdIV28cCCYiAnM8mawhX3E-41Z4Vjl7MGmjNEVL7ywz1OWlb4vdnyFADoDl2xCJc9PTlwtTolFYyNOV6_FVklEEHb16YytRanXQo0hci80OZrglm7AxhSH2zdNzqzku5H4xa7bkvGzdm8dDY-gj_ey5NhXeloBw5i2K_x4SrE4SLAizl9bN-i_O3RvloUDgO3SUcOlK8ILY0kIGS-hiwnrZx_YcARpoA',
  homeMasterBay: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBEdgE2ZJ-ZxVNVC_6PZ8ttbd4r-NXvcTAOEK2e4pGwZiSSqI44xD-SFiwM3G4nxQKBijiiTpL2k7Xe61v21sumMa0gUMmeBWItPyx9B_rLwd8puA50PbZI84y4xOf9sk3q5n0lSyC_YfGKZl18pW8SNQzwCl0Yw0QQcpo0s6-JrkXeqU55P_852jav4CNOmGjBaqcPvPddqG82luUrIbI_NWV0DQxVopLAGKpE_gckcW2B1RVjHcm_vA',
  homeDrop1Armband: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAllcNQGrx6bbRE-q8NKn3H2J-OMuA_qjs9doJlpbPdLCDUa6Bl_nNbNNUu_7OnUe2GBCf-oIIzUz3WKHEAIH_aMf9Pp7tL5F-avYtgW135QOUZ86WybHtjra6Cwrg1cddXYKz4nX6wyZKN17YReDDvDA2CMmjS3L71dNriyOK2kcA7EIpQh5DLzW5bslWYJvw2XRmH7FUhppfOxduM3rA-s2fyVD3C8pXtV1pCOIvVzmReve-OZHY1XA',
  homeDrop2Helmet: 'https://lh3.googleusercontent.com/aida-public/AB6AXuADt3k4FeCElBQWwclqbKhrhr4t-5gtIGXU5QSEB6WobDxnhwFm6fIQVYCh8ZC-pAisRU7VazYA9komrXTbPySL0niNu13EkzOty90IjT28YGKzv0QrJLHHlig1yJ0FeEw_DdW9CrHOn4lx208_HPbbFF8l7bi_sqiWc5OX3LZXFF_hDlgSn2h9Ko1PPUR_fBhEkDXc7asIj7_6Qu1rBo56QcRd1W-qNjCwhDEaPkBCSYZVdkmG8AdNLA',
  homeDrop3Jordan: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBMMn41Z1kT1-AsIC6v7oENA8Hl0871x0zk9DI5pwksD7OWoxBRLV-4oNV2JxCTga1C7u76DD0Ss8CmpmeX-McBrEv3cl9pCpoeS_OnM9qCyLOScp5dehOLBPeFIzGB-hKCG1f3vCo1U8v5cT3PzwcnpyQdFMRLUpkNVpCaC5MMg_VZj2oAB_tIn3m2jjTWcb_GMzqMuGnYCjvBWf8m6S8TGIoOCyjh8O595YfG-fMJHEGRKu0ysDeqxA',
};

export const CATALOG_RELICS: RelicItem[] = [
  {
    id: 'pel-1970',
    sku: 'PROD-1970-MEX-10',
    title: 'Camisa Oficial Final Copa 1970 Usada em Jogo por Pelé',
    athlete: 'Pelé (Edson Arantes)',
    sport: 'futebol',
    category: 'Copa do Mundo 1970 • México',
    description: 'Camisa canarinho original usada no Estádio Azteca na final histórica de 1970. Acompanha laudo pericial têxtil, certificado de autenticidade vitalício e assinatura manuscrita do Rei do Futebol.',
    year: 1970,
    grade: 'Grau COA 9.8 Museu',
    priceBRL: 4850000,
    valuationBRL: 4850000,
    installments: '12x de R$ 404.166,66 sem juros',
    status: 'available',
    statusLabel: 'Peça Única • Disponível',
    stockCount: 1,
    custodian: 'Cofre de Alta Segurança de Genebra',
    custodianFacility: 'Bóveda Climatizada #G-44 • Rota Segura para São Paulo',
    insurancePolicy: "Apólice Lloyd's of London R$ 30.000.000 (Cobertura 100%)",
    sha256Hash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    imageUrl: RELIC_IMAGES.pele1970Catalog,
    featured: true,
    gallery: [
      { id: 'm-p1', type: 'image', url: RELIC_IMAGES.pele1970Catalog, title: 'Camisa Principal 1970', isCover: true },
      { id: 'm-p2', type: 'image', url: RELIC_IMAGES.peleProductFullFront, title: 'Visão Frontal Completa' },
      { id: 'm-p3', type: 'image', url: RELIC_IMAGES.peleProductSignature, title: 'Autógrafo Autêntico de Pelé' },
      { id: 'm-p4', type: 'image', url: RELIC_IMAGES.peleProductFabricWeave, title: 'Espectrometria Têxtil 8K' },
      { id: 'm-p5', type: 'image', url: RELIC_IMAGES.peleProductCoaDoc, title: 'Lacre Físico Notarial COA-9801' },
    ],
    altText: 'Fotografia de alta definição da camisa original de Pelé da final da Copa do Mundo de 1970 no México',
    verifiedMethod: 'Espectrometria 8K & Laudo Caligráfico Pericial',
  },
  {
    id: 'sen-1991',
    sku: 'PROD-F1-SENNA-91',
    title: 'Capacete Original Bell GP3 McLaren 1991 Ayrton Senna',
    athlete: 'Ayrton Senna',
    sport: 'f1',
    category: 'Fórmula 1 • McLaren Honda',
    description: 'Exemplar genuíno utilizado por Ayrton Senna no GP de Interlagos de 1991. Pintura autêntica de época Sid Special Paint com sistema de rádio original preservado.',
    year: 1991,
    grade: 'Grau COA 9.9 Impecável',
    priceBRL: 2450000,
    valuationBRL: 2450000,
    installments: '12x de R$ 204.166,66 sem juros',
    status: 'available',
    statusLabel: 'Pronta Entrega • Disponível',
    stockCount: 1,
    custodian: 'Cofre Diamante São Paulo',
    custodianFacility: 'Instalação de Segurança Bandeirantes',
    insurancePolicy: "Apólice Lloyd's of London R$ 15.000.000",
    sha256Hash: '4f81c9a0912dfbc78e019a823dcbe9102948bcda819273461028394012bc0a19',
    imageUrl: RELIC_IMAGES.senna1991Helmet,
    featured: true,
    gallery: [
      { id: 'm-s1', type: 'image', url: RELIC_IMAGES.senna1991Helmet, title: 'Capacete Bell Ayrton Senna 1991', isCover: true },
      { id: 'm-s2', type: 'image', url: RELIC_IMAGES.homeDrop2Helmet, title: 'Detalhes Sid Special Paint' },
    ],
    altText: 'Capacete histórico de Fórmula 1 de Ayrton Senna temporada 1991 com cores amarelo, verde e azul',
    verifiedMethod: 'Registro Oficial FIA Heritage & Certificado Sid Special',
  },
  {
    id: 'jor-1998',
    sku: 'PROD-NBA-LASTDANCE-23',
    title: 'Regata Oficial NBA Finals 1998 Michael Jordan (The Last Dance)',
    athlete: 'Michael Jordan',
    sport: 'basquete',
    category: 'NBA Finals 1998 • Chicago Bulls',
    description: 'Regata vermelha oficial número 23 do Chicago Bulls usada no Jogo 2 das Finais da NBA de 1998. Laudo completo de correspondência fotográfica MeiGray de trama têxtil e costuras.',
    year: 1998,
    grade: 'Grau COA 9.7 Museu',
    priceBRL: 5900000,
    valuationBRL: 5900000,
    installments: '12x de R$ 491.666,66 sem juros',
    status: 'available',
    statusLabel: 'Peça Única • Disponível',
    stockCount: 1,
    custodian: 'Custódia Especial Brink\'s Brasil',
    custodianFacility: 'Centro Seguro Logístico São Paulo',
    insurancePolicy: "Apólice Lloyd's of London R$ 35.000.000",
    sha256Hash: '9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8b',
    imageUrl: RELIC_IMAGES.jordan1998Jersey,
    featured: true,
    gallery: [
      { id: 'm-j1', type: 'image', url: RELIC_IMAGES.jordan1998Jersey, title: 'Regata Chicago Bulls 23', isCover: true },
      { id: 'm-j2', type: 'image', url: RELIC_IMAGES.homeDrop3Jordan, title: 'Costura e Trama MeiGray' },
    ],
    altText: 'Regata vermelha de Michael Jordan Chicago Bulls usada nas finais da NBA de 1998',
    verifiedMethod: 'Certificação MeiGray Photo-Match & NBA Authentication',
  },
  {
    id: 'ali-1971',
    sku: 'PROD-BOX-ALI-1971',
    title: 'Luvas da \'Luta do Século\' 1971 Usadas por Muhammad Ali',
    athlete: 'Muhammad Ali',
    sport: 'boxe',
    category: 'Boxe Histórico • Madison Square Garden',
    description: 'Par de luvas originais de couro Everlast utilizadas no Madison Square Garden contra Joe Frazier. Atestado de autenticidade assinado por Angelo Dundee e certificação da Fundação Ali.',
    year: 1971,
    grade: 'Grau COA 9.6 Museu',
    priceBRL: 3100000,
    valuationBRL: 3100000,
    installments: '12x de R$ 258.333,33 sem juros',
    status: 'available',
    statusLabel: 'Peça Única • Disponível',
    stockCount: 1,
    custodian: 'Cofre Internacional Zurique',
    custodianFacility: 'Bóveda Suíça de Segurança Máxima #Z-12',
    insurancePolicy: "Apólice Lloyd's of London R$ 20.000.000",
    sha256Hash: '1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    imageUrl: RELIC_IMAGES.ali1971Gloves,
    gallery: [
      { id: 'm-a1', type: 'image', url: RELIC_IMAGES.ali1971Gloves, title: 'Luvas Everlast Muhammad Ali', isCover: true },
    ],
    altText: 'Luvas clássicas de boxe de couro Everlast de Muhammad Ali da Luta do Século em 1971',
    verifiedMethod: 'Datação Forense por Carbono C14 e Selo Angelo Dundee',
  },
  {
    id: 'pel-boot-1970',
    sku: 'PROD-PUMA-PELE-70',
    title: 'Chuteira Puma King México 1970 Usada por Pelé',
    athlete: 'Pelé (Edson Arantes)',
    sport: 'futebol',
    category: 'Copa do Mundo 1970 • Puma Heritage',
    description: 'Pé direito autêntico confeccionado sob encomenda na Alemanha para Pelé. Travas moldadas originais e laudo confirmatório de uso no Mundial de 1970.',
    year: 1970,
    grade: 'Grau COA 9.8 Museu',
    priceBRL: 1850000,
    valuationBRL: 1850000,
    installments: '12x de R$ 154.166,66 sem juros',
    status: 'available',
    statusLabel: 'Pronta Entrega • Disponível',
    stockCount: 1,
    custodian: 'Cofre São Paulo',
    custodianFacility: 'Câmara Blindada Climatizada #SP-04',
    insurancePolicy: "Apólice Lloyd's of London R$ 10.000.000",
    sha256Hash: '2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d',
    imageUrl: RELIC_IMAGES.pele1970Boot,
    altText: 'Chuteira vintage de couro preto Puma King usada pelo Rei Pelé na Copa de 1970',
    verifiedMethod: 'Micro-Inspeção UV e Registro Oficial do Acervo Puma',
  },
  {
    id: 'sen-trophy-1993',
    sku: 'PROD-F1-TROPHY-93',
    title: 'Troféu Oficial Construtores GP do Brasil 1993 Ayrton Senna',
    athlete: 'Ayrton Senna',
    sport: 'f1',
    category: 'Fórmula 1 • GP Brasil 1993',
    description: 'Troféu genuíno esculpido em prata de lei 925 com banho em ouro 24k concedido na memorável vitória de Senna em Interlagos sob chuva torrencial.',
    year: 1993,
    grade: 'Grau COA 9.9 Peça de Museu',
    priceBRL: 4200000,
    valuationBRL: 4200000,
    installments: '12x de R$ 350.000,00 sem juros',
    status: 'available',
    statusLabel: 'Peça Única • Disponível',
    stockCount: 1,
    custodian: 'Cofre Diamante São Paulo',
    custodianFacility: 'Cofre Principal de Segurança Máxima #SP-01',
    insurancePolicy: "Apólice Lloyd's of London R$ 25.000.000",
    sha256Hash: '3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e',
    imageUrl: RELIC_IMAGES.f11993Trophy,
    altText: 'Troféu histórico de Fórmula 1 em prata e ouro do Grande Prêmio do Brasil de 1993',
    verifiedMethod: 'Certificação FIA Heritage e Ensaio Metalúrgico de Prata 925',
  },
];
