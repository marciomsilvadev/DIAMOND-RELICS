'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { RelayBar } from '@/components/RelayBar';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ImageModal } from '@/components/ImageModal';
import { RelicItem, CATALOG_RELICS, MediaItem } from '@/lib/relics-data';
import { ProductGalleryEditor } from '@/components/ProductGalleryEditor';
import {
  getStoredProducts,
  addStoredProduct,
  updateStoredProduct,
  removeStoredProduct,
  resetStoredProducts,
  getStoredOrders,
  clearStoredOrders,
  OrderItem,
} from '@/lib/products-store';
import {
  getStoredSiteConfig,
  saveStoredSiteConfig,
  resetSiteConfig,
  DEFAULT_SITE_CONFIG,
  SiteConfig,
} from '@/lib/site-config-store';
import { getCurrentSession, logout, AuthSession } from '@/lib/auth-store';
import { AdminLoginForm } from '@/components/AdminLoginForm';
import { UserManagementTab } from '@/components/UserManagementTab';

export default function AdminPage() {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [activeTab, setActiveTab] = useState<'inventory' | 'cms' | 'orders' | 'users'>('inventory');
  const [products, setProducts] = useState<RelicItem[]>(CATALOG_RELICS);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<RelicItem | null>(null);
  const [productToDelete, setProductToDelete] = useState<RelicItem | null>(null);
  const [siteConfig, setSiteConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [saveConfigSuccess, setSaveConfigSuccess] = useState(false);

  // Formulário de Novo Produto
  const [newTitle, setNewTitle] = useState('');
  const [newAthlete, setNewAthlete] = useState('');
  const [newSport, setNewSport] = useState<'futebol' | 'f1' | 'basquete' | 'boxe'>('futebol');
  const [newCategory, setNewCategory] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newYear, setNewYear] = useState(1982);
  const [newPrice, setNewPrice] = useState(1500000);
  const [newGrade, setNewGrade] = useState('Grau COA 9.8 Museu');
  const [newGallery, setNewGallery] = useState<MediaItem[]>([]);
  const [newFeatured, setNewFeatured] = useState(false);

  // Formulário de Edição de Produto
  const [editTitle, setEditTitle] = useState('');
  const [editAthlete, setEditAthlete] = useState('');
  const [editSport, setEditSport] = useState<'futebol' | 'f1' | 'basquete' | 'boxe'>('futebol');
  const [editCategory, setEditCategory] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editYear, setEditYear] = useState(1982);
  const [editPrice, setEditPrice] = useState(1500000);
  const [editGrade, setEditGrade] = useState('Grau COA 9.8 Museu');
  const [editGallery, setEditGallery] = useState<MediaItem[]>([]);
  const [editStatus, setEditStatus] = useState<'available' | 'sold'>('available');
  const [editFeatured, setEditFeatured] = useState(false);

  const [modalData, setModalData] = useState<{
    isOpen: boolean;
    imageUrl: string;
    title: string;
    subtitle?: string;
  }>({
    isOpen: false,
    imageUrl: '',
    title: '',
    subtitle: '',
  });

  const loadData = () => {
    setProducts(getStoredProducts());
    setOrders(getStoredOrders());
    setSiteConfig(getStoredSiteConfig());
  };

  useEffect(() => {
    setSession(getCurrentSession());
    setIsLoadingAuth(false);
    loadData();

    const handleProductsUpdate = () => setProducts(getStoredProducts());
    const handleOrdersUpdate = () => setOrders(getStoredOrders());
    const handleConfigUpdate = () => setSiteConfig(getStoredSiteConfig());
    const handleSessionUpdate = () => setSession(getCurrentSession());

    window.addEventListener('diamond_products_updated', handleProductsUpdate);
    window.addEventListener('diamond_orders_updated', handleOrdersUpdate);
    window.addEventListener('diamond_config_updated', handleConfigUpdate);
    window.addEventListener('diamond_session_updated', handleSessionUpdate);

    return () => {
      window.removeEventListener('diamond_products_updated', handleProductsUpdate);
      window.removeEventListener('diamond_orders_updated', handleOrdersUpdate);
      window.removeEventListener('diamond_config_updated', handleConfigUpdate);
      window.removeEventListener('diamond_session_updated', handleSessionUpdate);
    };
  }, []);

  // Métricas reais calculadas dinamicamente
  const totalRevenue = orders.reduce((sum, o) => sum + (o.totalBRL || 0), 0);
  const totalOrders = orders.length;
  const averageTicket = totalOrders > 0 ? totalRevenue / totalOrders : 0;
  const soldProductsCount = products.filter((p) => p.status === 'sold').length;

  // Adicionar Novo Produto
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newAthlete.trim()) {
      alert('Por favor, preencha o título e o nome do atleta.');
      return;
    }

    const price = Number(newPrice) || 100000;
    const installmentsValue = (price / 12).toLocaleString('pt-BR', {
      maximumFractionDigits: 2,
    });

    const coverUrl =
      newGallery.length > 0
        ? newGallery[0].url
        : 'https://picsum.photos/seed/relic_gold_vault/800/1000';

    const finalGallery =
      newGallery.length > 0
        ? newGallery
        : [{ id: `med-${Date.now()}`, type: 'image' as const, url: coverUrl, title: newTitle, isCover: true }];

    const newItem: RelicItem = {
      id: `prod-${Date.now()}`,
      sku: `PROD-${Math.floor(1000 + Math.random() * 9000)}`,
      title: newTitle.trim(),
      athlete: newAthlete.trim(),
      sport: newSport,
      category: newCategory.trim() || `${newSport.toUpperCase()} • Edição Histórica`,
      description:
        newDescription.trim() ||
        'Item genuíno autêntico com certificado de autenticidade vitalício e entrega segura especializada.',
      year: Number(newYear) || 1980,
      grade: newGrade.trim() || 'Grau COA 9.8 Museu',
      priceBRL: price,
      valuationBRL: price,
      installments: `12x de R$ ${installmentsValue} sem juros`,
      status: 'available',
      statusLabel: 'Peça Única • Disponível',
      stockCount: 1,
      custodian: 'Cofre São Paulo',
      custodianFacility: 'Câmara Climatizada de Segurança',
      insurancePolicy: "Apólice Lloyd's of London (Cobertura 100%)",
      sha256Hash: `0x${Math.random().toString(16).substring(2)}${Math.random().toString(16).substring(2)}`,
      imageUrl: coverUrl,
      gallery: finalGallery,
      featured: newFeatured,
      altText: newTitle,
      verifiedMethod: 'Laudo Pericial Forense Chancelado',
    };

    const updated = addStoredProduct(newItem);
    setProducts(updated);
    setShowAddModal(false);

    // Resetar campos
    setNewTitle('');
    setNewAthlete('');
    setNewCategory('');
    setNewDescription('');
    setNewPrice(1500000);
    setNewGallery([]);
    setNewFeatured(false);

    alert('Produto adicionado com sucesso ao catálogo da loja!');
  };

  // Abrir Modal de Edição de Produto
  const handleOpenEditProduct = (item: RelicItem) => {
    setEditingProduct(item);
    setEditTitle(item.title);
    setEditAthlete(item.athlete);
    setEditSport(item.sport);
    setEditCategory(item.category);
    setEditDescription(item.description);
    setEditYear(item.year);
    setEditPrice(item.priceBRL);
    setEditGrade(item.grade);
    setEditFeatured(Boolean(item.featured));

    const existingGallery: MediaItem[] =
      item.gallery && item.gallery.length > 0
        ? item.gallery
        : [{ id: `med-${item.id}`, type: 'image', url: item.imageUrl, title: item.title, isCover: true }];
    setEditGallery(existingGallery);
    setEditStatus(item.status === 'sold' ? 'sold' : 'available');
  };

  // Salvar Produto Editado
  const handleSaveEditProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    const price = Number(editPrice) || editingProduct.priceBRL;
    const installmentsValue = (price / 12).toLocaleString('pt-BR', {
      maximumFractionDigits: 2,
    });

    const isSold = editStatus === 'sold';
    const coverUrl = editGallery.length > 0 ? editGallery[0].url : editingProduct.imageUrl;
    const finalGallery =
      editGallery.length > 0
        ? editGallery
        : [{ id: `med-${editingProduct.id}`, type: 'image' as const, url: coverUrl, title: editTitle, isCover: true }];

    const updated: RelicItem = {
      ...editingProduct,
      title: editTitle.trim() || editingProduct.title,
      athlete: editAthlete.trim() || editingProduct.athlete,
      sport: editSport,
      category: editCategory.trim() || editingProduct.category,
      description: editDescription.trim() || editingProduct.description,
      year: Number(editYear) || editingProduct.year,
      grade: editGrade.trim() || editingProduct.grade,
      priceBRL: price,
      valuationBRL: price,
      installments: `12x de R$ ${installmentsValue} sem juros`,
      imageUrl: coverUrl,
      gallery: finalGallery,
      status: editStatus,
      statusLabel: isSold ? 'Vendido • Acervo Fechado' : 'Peça Única • Disponível',
      featured: editFeatured,
    };

    const list = updateStoredProduct(updated);
    setProducts(list);
    setEditingProduct(null);
    alert(`Produto "${updated.title}" atualizado com sucesso!`);
  };

  // Alternar rapidamente status entre Disponível e Vendido
  const handleToggleSoldStatus = (item: RelicItem) => {
    const isCurrentlySold = item.status === 'sold';
    const nextStatus: 'available' | 'sold' = isCurrentlySold ? 'available' : 'sold';
    const nextLabel = isCurrentlySold ? 'Peça Única • Disponível' : 'Vendido • Acervo Fechado';

    const updated: RelicItem = {
      ...item,
      status: nextStatus,
      statusLabel: nextLabel,
    };

    const list = updateStoredProduct(updated);
    setProducts(list);
  };

  // Alternar rapidamente status de Peça em Destaque
  const handleToggleFeatured = (item: RelicItem) => {
    const nextFeatured = !item.featured;
    const updated: RelicItem = {
      ...item,
      featured: nextFeatured,
    };

    const list = updateStoredProduct(updated);
    setProducts(list);
  };

  const handleConfirmDelete = () => {
    if (!productToDelete) return;
    const updated = removeStoredProduct(productToDelete.id);
    setProducts(updated);
    setProductToDelete(null);
  };

  const handleResetCatalog = () => {
    if (confirm('Deseja restaurar os produtos padrão do catálogo inicial?')) {
      const reset = resetStoredProducts();
      setProducts(reset);
    }
  };

  const handleClearOrders = () => {
    if (confirm('Deseja limpar todos os pedidos registrados?')) {
      clearStoredOrders();
      setOrders([]);
    }
  };

  // Salvar Configurações do Site (CMS)
  const handleSaveSiteConfig = (e: React.FormEvent) => {
    e.preventDefault();
    saveStoredSiteConfig(siteConfig);
    setSaveConfigSuccess(true);
    setTimeout(() => setSaveConfigSuccess(false), 4000);
  };

  // Restaurar Textos Originais do Site
  const handleResetSiteConfig = () => {
    if (confirm('Deseja restaurar todos os textos e nomes de abas para os padrões originais?')) {
      const def = resetSiteConfig();
      setSiteConfig(def);
      setSaveConfigSuccess(true);
      setTimeout(() => setSaveConfigSuccess(false), 4000);
    }
  };

  const openImage = (imageUrl: string, title: string, subtitle?: string) => {
    setModalData({
      isOpen: true,
      imageUrl,
      title,
      subtitle,
    });
  };

  if (isLoadingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#08090B] text-[#f2ca50]">
        <div className="flex flex-col items-center gap-3">
          <span className="w-8 h-8 border-2 border-[#f2ca50] border-t-transparent rounded-full animate-spin"></span>
          <span className="text-xs font-['Space_Grotesk'] tracking-widest uppercase">
            Verificando Credenciais...
          </span>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col bg-[#08090B] text-[#e2e2e6] selection:bg-[#d4af37] selection:text-[#08090B]">
        <RelayBar />
        <Navbar />
        <AdminLoginForm onLoginSuccess={(newSession) => setSession(newSession)} />
        <Footer />
      </div>
    );
  }

  const isUserAdmin = session.user.role === 'admin';

  return (
    <div className="min-h-screen flex flex-col bg-[#08090B] text-[#e2e2e6] selection:bg-[#d4af37] selection:text-[#08090B]">
      {/* 1. Global Navigation Relay Bar */}
      <RelayBar />

      {/* Main Top Institutional Nav Bar */}
      <Navbar />

      {/* Header do Painel */}
      <section className="bg-[#12151B] border-b border-[#282E3A] py-6 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-[#10B981]"></span>
              <span className="text-xs font-['Space_Grotesk'] text-[#f2ca50] tracking-widest uppercase font-semibold">
                Painel Administrativo Completo
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
              Gestão da Loja, Produtos &amp; Editor Visual (CMS)
            </h1>
            <p className="text-xs sm:text-sm font-['Manrope'] text-[#9CA3AF] mt-1">
              Edite qualquer texto da página, renomeie botões e abas, marque produtos como vendidos e gerencie vendas reais em tempo real.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Card de Sessão e Perfil Logado */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 bg-[#08090B] border border-[#282E3A] rounded-lg">
              <div className="w-8 h-8 rounded-full bg-[#1A1E26] border border-[#f2ca50]/50 overflow-hidden flex items-center justify-center shrink-0">
                {session.user.avatar ? (
                  <img
                    src={session.user.avatar}
                    alt={session.user.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-xs text-[#f2ca50]">
                    {session.user.name.charAt(0)}
                  </span>
                )}
              </div>
              <div className="text-left text-xs leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-[#F4F1EA] font-['Space_Grotesk'] truncate max-w-[140px]">
                    {session.user.name}
                  </span>
                  {isUserAdmin ? (
                    <span className="px-1.5 py-0.2 rounded bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40 font-bold text-[9px] uppercase tracking-wider">
                      Admin
                    </span>
                  ) : (
                    <span className="px-1.5 py-0.2 rounded bg-emerald-950/60 text-emerald-400 border border-emerald-500/40 font-bold text-[9px] uppercase tracking-wider">
                      Operador
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-[#9CA3AF] font-['Space_Grotesk'] block truncate max-w-[150px]">
                  {session.user.department || 'Painel da Loja'}
                </span>
              </div>
              <button
                onClick={() => {
                  logout();
                  setSession(null);
                }}
                className="ml-1 px-2 py-1 bg-[#1A1E26] hover:bg-red-950/60 border border-[#282E3A] hover:border-red-500/50 text-[#9CA3AF] hover:text-red-400 rounded text-xs transition-colors flex items-center gap-1 cursor-pointer"
                title="Encerrar Sessão Segura"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span className="hidden sm:inline text-[10px] uppercase font-bold">Sair</span>
              </button>
            </div>

            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2.5 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-['Space_Grotesk'] font-bold text-xs uppercase rounded flex items-center gap-1.5 transition-colors shadow-sm"
            >
              <span className="material-symbols-outlined text-base">add_circle</span>
              Adicionar Novo Produto
            </button>

            <Link
              href="/catalog"
              className="px-4 py-2.5 bg-[#1A1E26] hover:bg-[#282E3A] border border-[#282E3A] text-[#F4F1EA] font-['Space_Grotesk'] font-semibold text-xs rounded flex items-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-base text-[#f2ca50]">storefront</span>
              Ver Loja ao Vivo
            </Link>
          </div>
        </div>
      </section>

      {/* Métricas Reais da Loja */}
      <section className="bg-[#08090B] border-b border-[#282E3A] py-6 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
              Faturamento Real da Loja
            </span>
            <span className="text-2xl font-bold font-['Playfair_Display'] text-[#f2ca50]">
              R$ {totalRevenue.toLocaleString('pt-BR')},00
            </span>
            <span className="text-[10px] text-[#9CA3AF] font-['Space_Grotesk'] block">
              {totalOrders === 0 ? 'Nenhuma venda concluída ainda' : `${totalOrders} venda(s) realizada(s)`}
            </span>
          </div>

          <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
              Produtos Cadastrados
            </span>
            <span className="text-2xl font-bold font-['Playfair_Display'] text-[#F4F1EA]">
              {products.length} {products.length === 1 ? 'Peça' : 'Peças'}
            </span>
            <span className="text-[10px] text-[#10B981] font-['Space_Grotesk'] block">
              {products.length - soldProductsCount} disponíveis • {soldProductsCount} vendido(s)
            </span>
          </div>

          <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
              Pedidos Realizados (Reais)
            </span>
            <span className="text-2xl font-bold font-['Playfair_Display'] text-[#10B981]">
              {totalOrders} {totalOrders === 1 ? 'Pedido' : 'Pedidos'}
            </span>
            <span className="text-[10px] text-[#9CA3AF] font-['Space_Grotesk'] block">
              Zero vendas fictícias
            </span>
          </div>

          <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-4 space-y-1">
            <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase block">
              Ticket Médio Real
            </span>
            <span className="text-2xl font-bold font-['Playfair_Display'] text-[#E5C875]">
              R$ {averageTicket.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-[#9CA3AF] font-['Space_Grotesk'] block">
              Baseado nas vendas efetuadas
            </span>
          </div>
        </div>
      </section>

      {/* Main Admin Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-12 py-8 space-y-6">
        {/* Tabs Principais */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#282E3A] pb-3">
          <div className="flex flex-wrap border border-[#282E3A] bg-[#12151B] rounded-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('inventory')}
              className={`px-5 py-2.5 text-xs font-['Space_Grotesk'] font-bold uppercase transition-colors flex items-center gap-2 ${
                activeTab === 'inventory'
                  ? 'text-[#08090B] bg-[#f2ca50]'
                  : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
              }`}
            >
              <span className="material-symbols-outlined text-base">inventory_2</span>
              Catálogo de Produtos ({products.length})
            </button>

            <button
              onClick={() => setActiveTab('cms')}
              className={`px-5 py-2.5 text-xs font-['Space_Grotesk'] font-bold uppercase transition-colors flex items-center gap-2 ${
                activeTab === 'cms'
                  ? 'text-[#08090B] bg-[#f2ca50]'
                  : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
              }`}
            >
              <span className="material-symbols-outlined text-base">edit_note</span>
              Editor de Textos &amp; Abas (CMS)
            </button>

            <button
              onClick={() => setActiveTab('orders')}
              className={`px-5 py-2.5 text-xs font-['Space_Grotesk'] font-bold uppercase transition-colors flex items-center gap-2 ${
                activeTab === 'orders'
                  ? 'text-[#08090B] bg-[#f2ca50]'
                  : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
              }`}
            >
              <span className="material-symbols-outlined text-base">receipt_long</span>
              Vendas e Pedidos Reais ({orders.length})
            </button>

            <button
              onClick={() => setActiveTab('users')}
              className={`px-5 py-2.5 text-xs font-['Space_Grotesk'] font-bold uppercase transition-colors flex items-center gap-2 ${
                activeTab === 'users'
                  ? 'text-[#08090B] bg-[#f2ca50]'
                  : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
              }`}
            >
              <span className="material-symbols-outlined text-base">manage_accounts</span>
              Equipe &amp; Acessos
              {!isUserAdmin && (
                <span className="text-[9px] bg-[#1A1E26] text-[#9CA3AF] px-1.5 py-0.2 rounded font-normal">
                  Ver
                </span>
              )}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {activeTab === 'inventory' && (
              <button
                onClick={handleResetCatalog}
                className="px-3 py-1.5 bg-[#12151B] hover:bg-[#1A1E26] border border-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA] text-xs font-['Space_Grotesk'] rounded transition-colors"
                title="Restaura os 6 produtos originais"
              >
                Restaurar Acervo Original
              </button>
            )}

            {activeTab === 'cms' && (
              <button
                onClick={handleResetSiteConfig}
                className="px-3 py-1.5 bg-[#12151B] hover:bg-[#1A1E26] border border-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA] text-xs font-['Space_Grotesk'] rounded transition-colors"
              >
                Restaurar Textos Originais
              </button>
            )}

            {activeTab === 'orders' && orders.length > 0 && (
              <button
                onClick={handleClearOrders}
                className="px-3 py-1.5 bg-[#12151B] hover:bg-red-950/40 border border-red-900/50 text-red-400 hover:text-red-300 text-xs font-['Space_Grotesk'] rounded transition-colors"
              >
                Limpar Pedidos
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: CATÁLOGO DE PRODUTOS (Adicionar, Editar e Marcar como Vendido) */}
        {/* ========================================================================= */}
        {activeTab === 'inventory' && (
          <div className="bg-[#12151B] border border-[#282E3A] rounded-lg overflow-hidden space-y-4">
            <div className="p-4 bg-[#1A1E26] border-b border-[#282E3A] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="text-xs font-['Space_Grotesk'] font-bold text-[#F4F1EA] uppercase tracking-wide block">
                  Lista de Produtos Anunciados
                </span>
                <span className="text-[11px] font-['Space_Grotesk'] text-[#9CA3AF]">
                  Você pode editar o texto de qualquer produto, marcar como vendido com 1 clique ou remover da loja.
                </span>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-3 py-1.5 bg-[#f2ca50] text-[#08090B] font-bold text-xs uppercase rounded font-['Space_Grotesk'] flex items-center gap-1 self-start sm:self-auto"
              >
                <span className="material-symbols-outlined text-sm">add</span>
                Novo Produto
              </button>
            </div>

            {products.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <span className="material-symbols-outlined text-5xl text-[#9CA3AF]">
                  production_quantity_limits
                </span>
                <h3 className="text-lg font-bold text-[#F4F1EA] font-['Playfair_Display']">
                  Nenhum produto cadastrado no catálogo
                </h3>
                <p className="text-xs text-[#9CA3AF] font-['Manrope'] max-w-sm mx-auto">
                  Você removeu todos os produtos. Clique abaixo para cadastrar um novo produto ou restaurar os originais.
                </p>
                <div className="flex justify-center gap-3 pt-2">
                  <button
                    onClick={() => setShowAddModal(true)}
                    className="px-4 py-2 bg-[#f2ca50] text-[#08090B] font-bold text-xs rounded uppercase font-['Space_Grotesk']"
                  >
                    Cadastrar Produto
                  </button>
                  <button
                    onClick={handleResetCatalog}
                    className="px-4 py-2 bg-[#1A1E26] border border-[#282E3A] text-[#F4F1EA] font-semibold text-xs rounded font-['Space_Grotesk']"
                  >
                    Restaurar Acervo Original
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-['Space_Grotesk']">
                  <thead className="bg-[#1A1E26] border-b border-[#282E3A] text-[#9CA3AF] uppercase">
                    <tr>
                      <th className="p-4">Produto</th>
                      <th className="p-4">SKU</th>
                      <th className="p-4">Atleta / Categoria</th>
                      <th className="p-4">Preço em Reais (R$)</th>
                      <th className="p-4">Disponibilidade</th>
                      <th className="p-4 text-center">Ações Rápidas</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#282E3A]">
                    {products.map((item) => {
                      const isSold = item.status === 'sold';
                      return (
                        <tr key={item.id} className="hover:bg-[#1A1E26]/50 transition-colors">
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="relative shrink-0">
                                <img
                                  src={item.imageUrl}
                                  alt={item.title}
                                  className="w-12 h-12 rounded object-cover border border-[#282E3A]"
                                />
                                {item.gallery && item.gallery.length > 1 && (
                                  <span
                                    className="absolute -bottom-1 -right-1 bg-[#f2ca50] text-[#08090B] text-[9px] font-extrabold px-1 rounded-full border border-[#08090B] shadow-sm"
                                    title={`${item.gallery.length} mídias na galeria`}
                                  >
                                    +{item.gallery.length}
                                  </span>
                                )}
                              </div>
                              <div className="max-w-xs">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-bold text-[#F4F1EA] block leading-snug">
                                    {item.title}
                                  </span>
                                  {item.featured && (
                                    <span className="text-[9px] bg-[#f2ca50]/15 text-[#f2ca50] border border-[#f2ca50]/40 px-1.5 py-0.5 rounded font-bold uppercase shrink-0 flex items-center gap-0.5">
                                      <span className="material-symbols-outlined text-[10px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                                        star
                                      </span>
                                      Destaque
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 text-[10px] text-[#9CA3AF] mt-0.5">
                                  <span>Ano: {item.year}</span>
                                  <span>•</span>
                                  <span className="text-[#E5C875]">
                                    {item.gallery && item.gallery.length > 0
                                      ? `${item.gallery.length} mídia(s)`
                                      : '1 foto'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-[#9CA3AF] font-mono">{item.sku}</td>
                          <td className="p-4">
                            <span className="text-[#F4F1EA] block font-semibold">{item.athlete}</span>
                            <span className="text-[10px] text-[#C59B27] uppercase">
                              {item.category}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-bold text-[#f2ca50] text-sm block">
                              R$ {item.priceBRL.toLocaleString('pt-BR')},00
                            </span>
                            <span className="text-[10px] text-[#9CA3AF] block">
                              {item.installments}
                            </span>
                          </td>
                          <td className="p-4">
                            {isSold ? (
                              <span className="px-2.5 py-1 rounded border border-red-500/50 bg-red-950/60 text-red-400 text-[10px] font-bold uppercase inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-400"></span>
                                VENDIDO
                              </span>
                            ) : (
                              <span className="px-2.5 py-1 rounded border border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981] text-[10px] font-bold uppercase inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                                DISPONÍVEL
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-1.5 flex-wrap">
                              {/* BOTÃO RÁPIDO: DESTAQUE NA HOME */}
                              <button
                                onClick={() => handleToggleFeatured(item)}
                                className={`px-2 py-1 rounded text-[11px] font-bold uppercase transition-colors flex items-center gap-1 ${
                                  item.featured
                                    ? 'bg-[#f2ca50]/20 hover:bg-[#f2ca50]/30 border border-[#f2ca50] text-[#f2ca50]'
                                    : 'bg-[#1A1E26] hover:bg-[#282E3A] border border-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA]'
                                }`}
                                title={
                                  item.featured
                                    ? 'Peça em destaque na Home (Clique para desmarcar)'
                                    : 'Clique para colocar esta peça em destaque na Home'
                                }
                              >
                                <span
                                  className="material-symbols-outlined text-sm"
                                  style={{ fontVariationSettings: item.featured ? "'FILL' 1" : "'FILL' 0" }}
                                >
                                  star
                                </span>
                                {item.featured ? 'Destaque' : 'Comum'}
                              </button>

                              {/* BOTÃO RÁPIDO: MARCAR COMO VENDIDO / DISPONÍVEL */}
                              <button
                                onClick={() => handleToggleSoldStatus(item)}
                                className={`px-2 py-1 rounded text-[11px] font-bold uppercase transition-colors flex items-center gap-1 ${
                                  isSold
                                    ? 'bg-[#10B981]/20 hover:bg-[#10B981]/30 border border-[#10B981]/50 text-[#10B981]'
                                    : 'bg-red-950/40 hover:bg-red-950/70 border border-red-900/60 text-red-300'
                                }`}
                                title={
                                  isSold
                                    ? 'Clique para marcar este produto como DISPONÍVEL novamente'
                                    : 'Clique para marcar este produto como VENDIDO'
                                }
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {isSold ? 'check_circle' : 'sell'}
                                </span>
                                {isSold ? 'Tornar Disponível' : 'Marcar como Vendido'}
                              </button>

                              {/* BOTÃO EDITAR PRODUTO (LÁPIS) */}
                              <button
                                onClick={() => handleOpenEditProduct(item)}
                                className="p-1.5 bg-[#1A1E26] hover:bg-[#282E3A] border border-[#282E3A] hover:border-[#f2ca50] text-[#f2ca50] rounded transition-colors"
                                title="Editar Textos e Preço do Produto"
                              >
                                <span className="material-symbols-outlined text-base">edit</span>
                              </button>

                              {/* VISUALIZAR FOTO */}
                              <button
                                onClick={() => openImage(item.imageUrl, item.title, item.sku)}
                                className="p-1.5 hover:text-[#f2ca50] text-[#9CA3AF] transition-colors"
                                title="Visualizar Foto Ampliada"
                              >
                                <span className="material-symbols-outlined text-base">zoom_in</span>
                              </button>

                              {/* BOTÃO REMOVER PRODUTO */}
                              <button
                                onClick={() => setProductToDelete(item)}
                                className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded transition-colors"
                                title="Remover Produto da Loja"
                              >
                                <span className="material-symbols-outlined text-base">delete</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: EDITOR VISUAL DE TEXTOS & ABAS (CMS TOTALMENTE EDITÁVEL) */}
        {/* ========================================================================= */}
        {activeTab === 'cms' && (
          <form onSubmit={handleSaveSiteConfig} className="space-y-6">
            {!isUserAdmin && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/50 rounded-lg flex items-center gap-3 text-amber-200 text-xs font-['Space_Grotesk']">
                <span className="material-symbols-outlined text-amber-400 text-xl">lock</span>
                <div>
                  <strong className="block text-amber-300 font-bold mb-0.5">Modo de Visualização para Operadores</strong>
                  As alterações nas configurações globais e textos do CMS são restritas a <strong>Administradores</strong>.
                </div>
              </div>
            )}

            {/* Notificação de Sucesso */}
            {saveConfigSuccess && (
              <div className="bg-[#10B981]/20 border border-[#10B981] p-4 rounded-lg flex items-center justify-between text-[#10B981] animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  <span className="font-['Space_Grotesk'] text-sm font-bold">
                    Sucesso! Todas as alterações de textos, abas e botões foram salvas e já estão ativas em todo o site.
                  </span>
                </div>
                <Link
                  href="/"
                  className="px-3 py-1 bg-[#10B981] text-[#08090B] font-bold text-xs rounded uppercase font-['Space_Grotesk']"
                >
                  Ver Home
                </Link>
              </div>
            )}

            <div className="bg-[#1A1E26] border border-[#282E3A] p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f2ca50]">tune</span>
                  Editor Completo de Textos, Nomes de Abas e Botões
                </h2>
                <p className="text-xs text-[#9CA3AF] font-['Manrope'] mt-0.5">
                  Modifique qualquer texto, renomeie botões e abas de navegação da página. O site é 100% editável.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetSiteConfig}
                  disabled={!isUserAdmin}
                  className="px-3 py-2 bg-[#12151B] hover:bg-[#282E3A] border border-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA] font-['Space_Grotesk'] text-xs rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Restaurar Padrões
                </button>
                <button
                  type="submit"
                  disabled={!isUserAdmin}
                  className="px-5 py-2 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-['Space_Grotesk'] font-bold text-xs uppercase rounded flex items-center gap-1.5 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-sm">save</span>
                  Salvar Alterações
                </button>
              </div>
            </div>

            {/* SEÇÃO 1: Nomes das Abas do Menu de Navegação */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
              <div className="border-b border-[#282E3A] pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50] text-lg">tab</span>
                <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                  1. Nomes das Abas de Navegação (Renomear Toda a Página)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs font-['Space_Grotesk']">
                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Nome da Aba 1 (Home/Início):
                  </label>
                  <input
                    type="text"
                    value={siteConfig.navHome || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, navHome: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Nome da Aba 2 (Catálogo de Produtos):
                  </label>
                  <input
                    type="text"
                    value={siteConfig.navCatalog || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, navCatalog: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Nome da Aba 3 (Peça em Destaque):
                  </label>
                  <input
                    type="text"
                    value={siteConfig.navProduct || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, navProduct: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Nome da Aba 4 (Carrinho &amp; Checkout):
                  </label>
                  <input
                    type="text"
                    value={siteConfig.navCheckout || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, navCheckout: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Nome da Aba 5 (Painel da Loja / Admin):
                  </label>
                  <input
                    type="text"
                    value={siteConfig.navAdmin || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, navAdmin: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 2: Identidade da Loja & Faixa Superior */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
              <div className="border-b border-[#282E3A] pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50] text-lg">badge</span>
                <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                  2. Identidade da Loja &amp; Faixa de Anúncio Superior
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-['Space_Grotesk']">
                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">Nome da Loja:</label>
                  <input
                    type="text"
                    value={siteConfig.storeName || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, storeName: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">Selo / Badge da Loja:</label>
                  <input
                    type="text"
                    value={siteConfig.storeBadge || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, storeBadge: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Texto do Banner / Faixa de Aviso Superior (RelayBar):
                  </label>
                  <input
                    type="text"
                    value={siteConfig.topBannerText || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, topBannerText: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 3: Textos da Página Inicial (Home) & Botões da Home */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
              <div className="border-b border-[#282E3A] pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50] text-lg">home</span>
                <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                  3. Textos da Página Inicial (Home) &amp; Botões Principais
                </h3>
              </div>

              <div className="space-y-4 text-xs font-['Space_Grotesk']">
                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Tagline Superior (Hero):
                  </label>
                  <input
                    type="text"
                    value={siteConfig.heroTagline || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, heroTagline: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Título Principal da Home (H1):
                  </label>
                  <input
                    type="text"
                    value={siteConfig.heroTitle || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, heroTitle: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Descrição / Subtítulo da Home:
                  </label>
                  <textarea
                    rows={3}
                    value={siteConfig.heroSubtitle || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, heroSubtitle: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 font-semibold">
                      Nome do Botão Principal da Home:
                    </label>
                    <input
                      type="text"
                      value={siteConfig.heroBtnPrimary || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, heroBtnPrimary: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] block mb-1 font-semibold">
                      Nome do Botão Secundário da Home:
                    </label>
                    <input
                      type="text"
                      value={siteConfig.heroBtnSecondary || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, heroBtnSecondary: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 border-t border-[#282E3A]">
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 font-semibold">
                      Badge da Vitrine de Produtos:
                    </label>
                    <input
                      type="text"
                      value={siteConfig.showcaseBadge || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, showcaseBadge: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] block mb-1 font-semibold">
                      Título da Vitrine de Produtos:
                    </label>
                    <input
                      type="text"
                      value={siteConfig.showcaseTitle || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, showcaseTitle: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] block mb-1 font-semibold">
                      Subtítulo da Vitrine:
                    </label>
                    <input
                      type="text"
                      value={siteConfig.showcaseSubtitle || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, showcaseSubtitle: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 4: Textos da Página de Catálogo */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
              <div className="border-b border-[#282E3A] pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50] text-lg">storefront</span>
                <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                  4. Textos da Página de Catálogo de Produtos
                </h3>
              </div>

              <div className="space-y-4 text-xs font-['Space_Grotesk']">
                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Título Principal do Catálogo:
                  </label>
                  <input
                    type="text"
                    value={siteConfig.catalogPageTitle || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, catalogPageTitle: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Subtítulo / Descrição do Catálogo:
                  </label>
                  <textarea
                    rows={2}
                    value={siteConfig.catalogPageSubtitle || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, catalogPageSubtitle: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 5: Rótulos Globais de Botões de Compra */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
              <div className="border-b border-[#282E3A] pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50] text-lg">smart_button</span>
                <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                  5. Nomes dos Botões da Loja (Globais)
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-['Space_Grotesk']">
                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Botão &quot;Comprar Agora&quot;:
                  </label>
                  <input
                    type="text"
                    value={siteConfig.btnBuyNow || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, btnBuyNow: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Botão &quot;Ver Detalhes&quot;:
                  </label>
                  <input
                    type="text"
                    value={siteConfig.btnViewDetails || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, btnViewDetails: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Botão &quot;Adicionar ao Carrinho&quot;:
                  </label>
                  <input
                    type="text"
                    value={siteConfig.btnAddToCart || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, btnAddToCart: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Texto do Botão quando Vendido:
                  </label>
                  <input
                    type="text"
                    value={siteConfig.btnSoldOut || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, btnSoldOut: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 6: Contato, Rodapé & Informações Legais */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
              <div className="border-b border-[#282E3A] pb-2 flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50] text-lg">support_agent</span>
                <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                  6. Contatos do Concierge, Rodapé &amp; Dados Oficiais
                </h3>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-['Space_Grotesk']">
                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    WhatsApp / Telefone do Concierge:
                  </label>
                  <input
                    type="text"
                    value={siteConfig.contactPhone || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, contactPhone: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    E-mail Oficial do Suporte / Vendas:
                  </label>
                  <input
                    type="email"
                    value={siteConfig.contactEmail || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, contactEmail: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Descrição Institucional no Rodapé:
                  </label>
                  <textarea
                    rows={2}
                    value={siteConfig.footerDescription || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, footerDescription: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Texto de Copyright, CNPJ e Moeda:
                  </label>
                  <input
                    type="text"
                    value={siteConfig.footerCopyright || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, footerCopyright: e.target.value })}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
              </div>
            </div>

            {/* SEÇÃO 7: Colunas do Rodapé & Formas de Pagamento (Textos do Rodapé) */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-5">
              <div className="border-b border-[#282E3A] pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f2ca50] text-lg">view_column</span>
                  <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                    7. Colunas do Rodapé &amp; Formas de Pagamento
                  </h3>
                </div>
                <span className="text-[10px] text-[#f2ca50] bg-[#f2ca50]/10 border border-[#f2ca50]/20 px-2 py-0.5 rounded font-mono">
                  100% Editável
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5 text-xs font-['Space_Grotesk']">
                {/* Coluna 1: Segurança & Garantia */}
                <div className="bg-[#0D0F14] border border-[#282E3A] p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-[#282E3A]/70 text-[#f2ca50] font-bold uppercase tracking-wider text-[11px]">
                    <span className="material-symbols-outlined text-sm">verified_user</span>
                    Coluna 1: Segurança &amp; Garantia
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px] font-semibold">Título da Coluna:</label>
                    <input
                      type="text"
                      value={siteConfig.footerCol1Title || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerCol1Title: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px]">Item 1:</label>
                    <input
                      type="text"
                      value={siteConfig.footerCol1Item1 || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerCol1Item1: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px]">Item 2:</label>
                    <input
                      type="text"
                      value={siteConfig.footerCol1Item2 || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerCol1Item2: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px]">Item 3:</label>
                    <input
                      type="text"
                      value={siteConfig.footerCol1Item3 || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerCol1Item3: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px]">Item 4:</label>
                    <input
                      type="text"
                      value={siteConfig.footerCol1Item4 || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerCol1Item4: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                </div>

                {/* Coluna 2: Navegação da Loja */}
                <div className="bg-[#0D0F14] border border-[#282E3A] p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-[#282E3A]/70 text-[#f2ca50] font-bold uppercase tracking-wider text-[11px]">
                    <span className="material-symbols-outlined text-sm">menu_book</span>
                    Coluna 2: Navegação da Loja
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px] font-semibold">Título da Coluna:</label>
                    <input
                      type="text"
                      value={siteConfig.footerCol2Title || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerCol2Title: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px]">Item 1 (Início):</label>
                    <input
                      type="text"
                      value={siteConfig.footerCol2Item1 || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerCol2Item1: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px]">Item 2 (Catálogo):</label>
                    <input
                      type="text"
                      value={siteConfig.footerCol2Item2 || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerCol2Item2: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px]">Item 3 (Destaque):</label>
                    <input
                      type="text"
                      value={siteConfig.footerCol2Item3 || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerCol2Item3: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px]">Item 4 (Carrinho):</label>
                    <input
                      type="text"
                      value={siteConfig.footerCol2Item4 || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerCol2Item4: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px]">Item 5 (Painel):</label>
                    <input
                      type="text"
                      value={siteConfig.footerCol2Item5 || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerCol2Item5: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                </div>

                {/* Coluna 3: Formas de Pagamento */}
                <div className="bg-[#0D0F14] border border-[#282E3A] p-4 rounded-lg space-y-3">
                  <div className="flex items-center gap-1.5 pb-2 border-b border-[#282E3A]/70 text-[#f2ca50] font-bold uppercase tracking-wider text-[11px]">
                    <span className="material-symbols-outlined text-sm">payments</span>
                    Coluna 3: Formas de Pagamento
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px] font-semibold">Título da Coluna:</label>
                    <input
                      type="text"
                      value={siteConfig.footerCol3Title || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerCol3Title: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px]">Texto PIX (com desconto):</label>
                    <input
                      type="text"
                      value={siteConfig.footerPaymentPix || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerPaymentPix: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px]">Texto Cartão de Crédito:</label>
                    <input
                      type="text"
                      value={siteConfig.footerPaymentCard || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerPaymentCard: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px]">Texto Boleto / Transferência:</label>
                    <input
                      type="text"
                      value={siteConfig.footerPaymentBoleto || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerPaymentBoleto: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 text-[11px]">Texto Seguro / Garantia:</label>
                    <input
                      type="text"
                      value={siteConfig.footerPaymentInsurance || ''}
                      onChange={(e) => setSiteConfig({ ...siteConfig, footerPaymentInsurance: e.target.value })}
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                </div>
              </div>

              {/* Selo Inferior de Segurança SSL */}
              <div className="pt-2 border-t border-[#282E3A]/70">
                <label className="text-[#9CA3AF] block mb-1 text-xs font-semibold">
                  Texto do Selo de Segurança Inferior (Barra Final):
                </label>
                <input
                  type="text"
                  value={siteConfig.footerSecuritySeal || ''}
                  onChange={(e) => setSiteConfig({ ...siteConfig, footerSecuritySeal: e.target.value })}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50] text-xs font-['Space_Grotesk']"
                />
              </div>
            </div>

            {/* Barra de Salvar no Rodapé */}
            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleResetSiteConfig}
                disabled={!isUserAdmin}
                className="px-4 py-2.5 bg-[#1A1E26] hover:bg-[#282E3A] border border-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA] font-['Space_Grotesk'] text-xs rounded transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Restaurar Padrões
              </button>
              <button
                type="submit"
                disabled={!isUserAdmin}
                className="px-6 py-2.5 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-['Space_Grotesk'] font-bold text-xs uppercase rounded flex items-center gap-2 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <span className="material-symbols-outlined text-base">check_circle</span>
                Salvar Todas as Alterações do Site
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: VENDAS E PEDIDOS REAIS (ZERO FICTÍCIOS) */}
        {/* ========================================================================= */}
        {activeTab === 'orders' && (
          <div className="bg-[#12151B] border border-[#282E3A] rounded-lg overflow-hidden space-y-4">
            <div className="p-4 bg-[#1A1E26] border-b border-[#282E3A] flex items-center justify-between">
              <div>
                <h3 className="text-xs font-['Space_Grotesk'] font-bold text-[#F4F1EA] uppercase tracking-wide">
                  Histórico de Pedidos e Vendas Efetivas
                </h3>
                <p className="text-[11px] text-[#9CA3AF]">
                  Todas as vendas fictícias foram removidas. Apenas pedidos finalizados por clientes reais aparecem nesta lista.
                </p>
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="p-14 text-center space-y-4">
                <div className="w-16 h-16 bg-[#1A1E26] border border-[#282E3A] rounded-full flex items-center justify-center text-[#9CA3AF] mx-auto">
                  <span className="material-symbols-outlined text-3xl">shopping_cart</span>
                </div>
                <h3 className="text-lg font-bold text-[#F4F1EA] font-['Playfair_Display']">
                  Nenhuma venda realizada até o momento
                </h3>
                <p className="text-xs text-[#9CA3AF] font-['Manrope'] max-w-md mx-auto leading-relaxed">
                  Todas as vendas fictícias foram removidas do sistema. Assim que você ou um comprador finalizar uma compra na página de checkout, o pedido aparecerá aqui automaticamente com os dados do comprador, valor em Reais e método de pagamento.
                </p>
                <div>
                  <Link
                    href="/catalog"
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-bold text-xs uppercase font-['Space_Grotesk'] rounded transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">shopping_bag</span>
                    Simular uma Compra no Checkout
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-['Space_Grotesk']">
                  <thead className="bg-[#1A1E26] border-b border-[#282E3A] text-[#9CA3AF] uppercase">
                    <tr>
                      <th className="p-4">Pedido ID</th>
                      <th className="p-4">Produto</th>
                      <th className="p-4">Comprador</th>
                      <th className="p-4">Data</th>
                      <th className="p-4">Valor Pago (R$)</th>
                      <th className="p-4">Forma de Pagamento</th>
                      <th className="p-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#282E3A]">
                    {orders.map((order) => (
                      <tr key={order.id} className="hover:bg-[#1A1E26]/50 transition-colors">
                        <td className="p-4 font-bold text-[#f2ca50]">{order.id}</td>
                        <td className="p-4 font-semibold text-[#F4F1EA] max-w-xs truncate">
                          {order.productTitle}
                        </td>
                        <td className="p-4">
                          <span className="text-[#F4F1EA] block font-semibold">
                            {order.buyerName}
                          </span>
                          <span className="text-[10px] text-[#9CA3AF]">
                            {order.city} - {order.state} • Doc: {order.buyerDoc}
                          </span>
                        </td>
                        <td className="p-4 text-[#9CA3AF]">{order.date}</td>
                        <td className="p-4 font-bold text-[#f2ca50] text-sm">
                          R$ {order.totalBRL.toLocaleString('pt-BR')},00
                        </td>
                        <td className="p-4 text-[#9CA3AF]">{order.paymentMethod}</td>
                        <td className="p-4">
                          <span
                            className={`px-2 py-0.5 rounded border text-[10px] font-bold ${order.statusColor}`}
                          >
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: GESTÃO DE EQUIPE & ACESSOS (ADMINISTRADORES E OPERADORES) */}
        {/* ========================================================================= */}
        {activeTab === 'users' && (
          <UserManagementTab currentUser={session.user} />
        )}
      </main>

      {/* MODAL DE ADICIONAR PRODUTO */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08090B]/95 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#12151B] border border-[#f2ca50] rounded-lg max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[#282E3A]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50]">add_box</span>
                <h3 className="text-sm font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase">
                  Adicionar Novo Produto à Loja
                </h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-[#9CA3AF] hover:text-[#F4F1EA]"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleAddProduct} className="space-y-3.5 text-xs font-['Space_Grotesk']">
              <div>
                <label className="text-[#9CA3AF] block mb-1">
                  Título Completo do Produto <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Camisa Oficial Zico Flamengo Final Mundial 1981"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9CA3AF] block mb-1">
                    Nome do Atleta / Lenda <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Zico"
                    value={newAthlete}
                    onChange={(e) => setNewAthlete(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1">Modalidade Esportiva</label>
                  <select
                    value={newSport}
                    onChange={(e) => setNewSport(e.target.value as any)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  >
                    <option value="futebol">Futebol</option>
                    <option value="f1">Fórmula 1</option>
                    <option value="basquete">Basquete (NBA)</option>
                    <option value="boxe">Boxe Histórico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9CA3AF] block mb-1">Ano Histórico</label>
                  <input
                    type="number"
                    value={newYear}
                    onChange={(e) => setNewYear(Number(e.target.value))}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1">
                    Preço de Venda em Reais (R$) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="1000"
                    placeholder="Ex: 1500000"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#9CA3AF] block mb-1">Categoria ou Competição</label>
                <input
                  type="text"
                  placeholder="Ex: Mundial Interclubes Tóquio 1981"
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div>
                <label className="text-[#9CA3AF] block mb-1">Grau de Conservação / Certificado</label>
                <input
                  type="text"
                  placeholder="Ex: Grau COA 9.8 Museu"
                  value={newGrade}
                  onChange={(e) => setNewGrade(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div>
                <label className="text-[#9CA3AF] block mb-1">Descrição Detalhada da Peça</label>
                <textarea
                  rows={3}
                  placeholder="Descreva a história da peça, estado de conservação e certificações..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div className="p-3 bg-[#08090B] border border-[#282E3A] rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#F4F1EA] block text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#f2ca50]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    Definir como Peça em Destaque na Home
                  </span>
                  <span className="text-[11px] text-[#9CA3AF] block mt-0.5">
                    Este produto terá exibição prioritária no topo e vitrine da página inicial
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    type="checkbox"
                    checked={newFeatured}
                    onChange={(e) => setNewFeatured(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f2ca50]"></div>
                </label>
              </div>

              <div className="pt-2 border-t border-[#282E3A]">
                <ProductGalleryEditor mediaList={newGallery} onChange={setNewGallery} />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#282E3A]">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-[#1A1E26] text-[#9CA3AF] rounded hover:text-[#F4F1EA]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f2ca50] text-[#08090B] font-bold rounded uppercase hover:bg-[#E5C875] transition-colors"
                >
                  Publicar Produto na Loja
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE EDITAR PRODUTO EXISTENTE (E MARCAR COMO VENDIDO) */}
      {editingProduct && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08090B]/95 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#12151B] border border-[#f2ca50] rounded-lg max-w-xl w-full p-6 space-y-4 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center pb-2 border-b border-[#282E3A]">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#f2ca50]">edit_document</span>
                <h3 className="text-sm font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase">
                  Editar Produto Anunciado: {editingProduct.sku}
                </h3>
              </div>
              <button
                onClick={() => setEditingProduct(null)}
                className="text-[#9CA3AF] hover:text-[#F4F1EA]"
              >
                <span className="material-symbols-outlined text-base">close</span>
              </button>
            </div>

            <form onSubmit={handleSaveEditProduct} className="space-y-3.5 text-xs font-['Space_Grotesk']">
              <div>
                <label className="text-[#9CA3AF] block mb-1">
                  Título Completo do Produto <span className="text-red-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              {/* Status de Disponibilidade / Marcar como Vendido */}
              <div className="p-3 bg-[#08090B] border border-[#282E3A] rounded-lg space-y-2">
                <label className="text-[#f2ca50] font-bold block uppercase tracking-wide">
                  Status de Venda do Produto
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditStatus('available')}
                    className={`py-2 px-3 rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                      editStatus === 'available'
                        ? 'bg-[#10B981] text-[#08090B] shadow-[0_0_10px_rgba(16,185,129,0.3)]'
                        : 'bg-[#1A1E26] text-[#9CA3AF] border border-[#282E3A]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Disponível para Compra
                  </button>

                  <button
                    type="button"
                    onClick={() => setEditStatus('sold')}
                    className={`py-2 px-3 rounded text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 ${
                      editStatus === 'sold'
                        ? 'bg-red-600 text-white shadow-[0_0_10px_rgba(239,68,68,0.4)]'
                        : 'bg-[#1A1E26] text-[#9CA3AF] border border-[#282E3A]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-sm">lock</span>
                    Marcar como VENDIDO
                  </button>
                </div>
                <p className="text-[10px] text-[#9CA3AF]">
                  {editStatus === 'sold'
                    ? 'Aviso: Ao marcar como VENDIDO, o produto exibirá a tarja vermelha e os botões de compra serão desativados no site.'
                    : 'O produto está disponível e qualquer visitante poderá adquiri-lo diretamente na loja.'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9CA3AF] block mb-1">
                    Nome do Atleta / Lenda <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={editAthlete}
                    onChange={(e) => setEditAthlete(e.target.value)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1">Modalidade Esportiva</label>
                  <select
                    value={editSport}
                    onChange={(e) => setEditSport(e.target.value as any)}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  >
                    <option value="futebol">Futebol</option>
                    <option value="f1">Fórmula 1</option>
                    <option value="basquete">Basquete (NBA)</option>
                    <option value="boxe">Boxe Histórico</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#9CA3AF] block mb-1">Ano Histórico</label>
                  <input
                    type="number"
                    value={editYear}
                    onChange={(e) => setEditYear(Number(e.target.value))}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>

                <div>
                  <label className="text-[#9CA3AF] block mb-1">
                    Preço de Venda em Reais (R$) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    step="1000"
                    value={editPrice}
                    onChange={(e) => setEditPrice(Number(e.target.value))}
                    className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                  />
                </div>
              </div>

              <div>
                <label className="text-[#9CA3AF] block mb-1">Categoria ou Competição</label>
                <input
                  type="text"
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div>
                <label className="text-[#9CA3AF] block mb-1">Grau de Conservação / Certificado</label>
                <input
                  type="text"
                  value={editGrade}
                  onChange={(e) => setEditGrade(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div>
                <label className="text-[#9CA3AF] block mb-1">Descrição Detalhada da Peça</label>
                <textarea
                  rows={3}
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                />
              </div>

              <div className="p-3 bg-[#08090B] border border-[#282E3A] rounded-lg flex items-center justify-between">
                <div>
                  <span className="font-bold text-[#F4F1EA] block text-xs flex items-center gap-1">
                    <span className="material-symbols-outlined text-sm text-[#f2ca50]" style={{ fontVariationSettings: "'FILL' 1" }}>
                      star
                    </span>
                    Definir como Peça em Destaque na Home
                  </span>
                  <span className="text-[11px] text-[#9CA3AF] block mt-0.5">
                    Este produto terá exibição prioritária no topo e vitrine da página inicial
                  </span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                  <input
                    type="checkbox"
                    checked={editFeatured}
                    onChange={(e) => setEditFeatured(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#f2ca50]"></div>
                </label>
              </div>

              <div className="pt-2 border-t border-[#282E3A]">
                <ProductGalleryEditor mediaList={editGallery} onChange={setEditGallery} />
              </div>

              <div className="pt-3 flex justify-end gap-2 border-t border-[#282E3A]">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-4 py-2 bg-[#1A1E26] text-[#9CA3AF] rounded hover:text-[#F4F1EA]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#f2ca50] text-[#08090B] font-bold rounded uppercase hover:bg-[#E5C875] transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE PRODUTO */}
      {productToDelete && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#08090B]/95 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#12151B] border border-red-500/80 rounded-lg max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3 text-red-400">
              <span className="material-symbols-outlined text-3xl">warning</span>
              <h3 className="text-sm font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase">
                Confirmar Remoção de Produto
              </h3>
            </div>

            <p className="text-xs font-['Manrope'] text-[#9CA3AF] leading-relaxed">
              Tem certeza que deseja remover o produto{' '}
              <strong className="text-[#F4F1EA] font-semibold">{productToDelete.title}</strong>{' '}
              do catálogo da loja? Ele deixará de aparecer para compra imediatamente.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setProductToDelete(null)}
                className="px-4 py-2 bg-[#1A1E26] border border-[#282E3A] text-[#9CA3AF] hover:text-[#F4F1EA] text-xs font-['Space_Grotesk'] rounded"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmDelete}
                className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase font-['Space_Grotesk'] rounded transition-colors"
              >
                Sim, Remover Produto
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Foto */}
      <ImageModal
        isOpen={modalData.isOpen}
        onClose={() => setModalData({ ...modalData, isOpen: false })}
        imageUrl={modalData.imageUrl}
        title={modalData.title}
        subtitle={modalData.subtitle}
      />

      {/* Rodapé Oficial */}
      <Footer />
    </div>
  );
}
