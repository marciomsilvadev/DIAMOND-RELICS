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
  saveStoredProducts,
  addStoredProduct,
  updateStoredProduct,
  removeStoredProduct,
  resetStoredProducts,
  syncProductsFromSupabase,
  getStoredOrders,
  clearStoredOrders,
  OrderItem,
} from '@/lib/products-store';
import { isSupabaseConfigured } from '@/lib/supabase';

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
  const [activeTab, setActiveTab] = useState<'inventory' | 'panels' | 'cms' | 'orders' | 'users'>('inventory');
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

  const [isSyncing, setIsSyncing] = useState(false);
  const jsonInputRef = useState<HTMLInputElement | null>(null);

  const handleExportBackup = () => {
    const currentProducts = getStoredProducts();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(currentProducts, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `diamond-relics-catalogo-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          saveStoredProducts(parsed);
          setProducts(parsed);
          alert(`Backup restaurado com sucesso! ${parsed.length} produtos carregados.`);
        } else {
          alert('Arquivo de backup inválido.');
        }
      } catch (err) {
        alert('Erro ao processar arquivo JSON.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleCloudSync = async () => {
    setIsSyncing(true);
    try {
      const updated = await syncProductsFromSupabase();
      setProducts(updated);
      alert('Sincronização com o Supabase concluída com sucesso!');
    } catch (err: any) {
      alert('Erro na sincronização: ' + (err.message || 'Falha de conexão'));
    } finally {
      setIsSyncing(false);
    }
  };

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

  // Upload do Logotipo da Empresa
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem é muito grande. Escolha uma imagem de até 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const updated = { ...siteConfig, customLogoUrl: result };
        setSiteConfig(updated);
        saveStoredSiteConfig(updated);
        setSaveConfigSuccess(true);
        setTimeout(() => setSaveConfigSuccess(false), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Restaurar Logotipo Padrão
  const handleResetLogo = () => {
    if (confirm('Deseja restaurar o logotipo oficial original da Diamond Relics?')) {
      const updated = { ...siteConfig, customLogoUrl: '/diamond-relics-logo.png' };
      setSiteConfig(updated);
      saveStoredSiteConfig(updated);
      setSaveConfigSuccess(true);
      setTimeout(() => setSaveConfigSuccess(false), 4000);
    }
  };

  // Upload de Imagem Personalizada para o Hero
  const handleHeroCustomImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      alert('A imagem é muito grande. Escolha uma imagem de até 5MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      if (result) {
        const updated = { ...siteConfig, heroCustomImageUrl: result };
        setSiteConfig(updated);
        saveStoredSiteConfig(updated);
        setSaveConfigSuccess(true);
        setTimeout(() => setSaveConfigSuccess(false), 4000);
      }
    };
    reader.readAsDataURL(file);
  };

  // Restaurar Logotipo Oficial do Hero para o Padrão
  const handleResetHeroLogo = () => {
    if (confirm('Deseja restaurar o brasão oficial padrão da Diamond Relics no destaque?')) {
      const updated = {
        ...siteConfig,
        heroCustomImageUrl: '',
        heroCustomInstagramHandle: '@diamond.relics',
      };
      setSiteConfig(updated);
      saveStoredSiteConfig(updated);
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
      {/* Top Bar Unificada e Exclusiva do Painel Administrativo */}
      <header className="bg-[#0D0F14] border-b border-[#282E3A] sticky top-0 z-40 px-4 sm:px-6 lg:px-12 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          {/* Lado Esquerdo: Marca, Título e Status Nuvem */}
          <div className="flex items-center gap-3 sm:gap-4">
            <Link href="/" className="flex items-center gap-2 group" title="Ir para a loja">
              <span className="font-['Playfair_Display'] font-black text-sm sm:text-base tracking-widest text-[#F4F1EA]">
                DIAMOND <span className="text-[#f2ca50]">RELICS</span>
              </span>
            </Link>

            <span className="text-[#282E3A] hidden sm:inline">|</span>

            <span className="px-2 py-0.5 rounded bg-[#1A1E26] border border-[#282E3A] text-[10px] sm:text-[11px] font-['Space_Grotesk'] text-[#f2ca50] font-bold tracking-wider uppercase hidden sm:inline">
              Painel de Gestão
            </span>

            {/* Status do Banco em Nuvem (Supabase) */}
            {isSupabaseConfigured() ? (
              <button
                type="button"
                onClick={handleCloudSync}
                disabled={isSyncing}
                title="Supabase Conectado. Clique para sincronizar agora."
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-500/40 text-emerald-400 text-[11px] font-['Space_Grotesk'] font-semibold transition-colors cursor-pointer"
              >
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${isSyncing ? 'animate-spin' : 'animate-pulse'}`}></span>
                <span>{isSyncing ? 'Sincronizando...' : 'Nuvem Ativa'}</span>
              </button>
            ) : (
              <div
                title="Modo Local"
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-950/40 border border-amber-500/40 text-amber-300 text-[11px] font-['Space_Grotesk'] font-semibold"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                <span>Modo Local</span>
              </div>
            )}
          </div>

          {/* Lado Direito: Ações Diretas + Perfil ÚNICO + ÚNICO Botão de Sair */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Link Ver Loja */}
            <Link
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#9CA3AF] hover:text-[#F4F1EA] hover:bg-[#1A1E26] rounded border border-transparent hover:border-[#282E3A] transition-colors"
              title="Abrir vitrine da loja em nova aba"
            >
              <span className="material-symbols-outlined text-sm text-[#f2ca50]">storefront</span>
              <span className="hidden md:inline">Ver Loja</span>
            </Link>

            {/* Backup Simples (Exportar / Importar) */}
            <div className="hidden sm:flex items-center bg-[#12151B] border border-[#282E3A] rounded overflow-hidden">
              <button
                type="button"
                onClick={handleExportBackup}
                title="Baixar backup do acervo (JSON)"
                className="px-2.5 py-1.5 text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] hover:text-[#F4F1EA] hover:bg-[#1A1E26] transition-colors border-r border-[#282E3A] cursor-pointer"
              >
                Exportar
              </button>
              <label
                title="Restaurar backup do acervo (JSON)"
                className="px-2.5 py-1.5 text-[11px] font-['Space_Grotesk'] text-[#9CA3AF] hover:text-[#F4F1EA] hover:bg-[#1A1E26] transition-colors cursor-pointer"
              >
                Importar
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>

            {/* Botão Principal: Adicionar Produto */}
            <button
              onClick={() => setShowAddModal(true)}
              className="px-3.5 py-1.5 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-['Space_Grotesk'] font-bold text-xs uppercase rounded flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
            >
              <span className="material-symbols-outlined text-sm font-bold">add</span>
              <span>Novo Produto</span>
            </button>

            {/* Divisor vertical sutil */}
            <div className="h-5 w-px bg-[#282E3A] mx-1"></div>

            {/* Perfil ÚNICO do Usuário Logado */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1A1E26] border border-[#f2ca50]/50 overflow-hidden flex items-center justify-center shrink-0">
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
              <div className="hidden lg:block text-left leading-tight">
                <span className="font-bold text-xs text-[#F4F1EA] font-['Space_Grotesk'] block max-w-[120px] truncate">
                  {session.user.name.split(' ')[0]}
                </span>
              </div>
            </div>

            {/* ÚNICO Botão de Sair do Painel */}
            <button
              type="button"
              onClick={() => {
                if (confirm('Deseja realmente sair e encerrar a sua sessão no Painel de Administração?')) {
                  logout();
                  setSession(null);
                }
              }}
              className="p-1.5 text-zinc-400 hover:text-red-400 hover:bg-red-950/30 rounded border border-transparent hover:border-red-900/40 transition-colors cursor-pointer"
              title="Sair do Painel"
            >
              <span className="material-symbols-outlined text-lg">logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Sub-header Elegante e Limpo */}
      <section className="bg-[#12151B] border-b border-[#282E3A] py-5 px-4 sm:px-6 lg:px-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-['Playfair_Display'] font-bold text-[#F4F1EA]">
              Gestão da Loja &amp; Acervo
            </h1>
            <p className="text-xs font-['Manrope'] text-[#9CA3AF] mt-0.5">
              Edite produtos, personalize banners e textos do CMS, gerencie vendas e operadores em tempo real.
            </p>
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
              onClick={() => setActiveTab('panels')}
              className={`px-5 py-2.5 text-xs font-['Space_Grotesk'] font-bold uppercase transition-colors flex items-center gap-2 ${
                activeTab === 'panels'
                  ? 'text-[#08090B] bg-[#f2ca50]'
                  : 'text-[#9CA3AF] hover:text-[#F4F1EA]'
              }`}
            >
              <span className="material-symbols-outlined text-base">dashboard_customize</span>
              Painéis &amp; Seções do Site
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
        {/* TAB 2: GERENCIADOR DE PAINÉIS & SEÇÕES DO SITE (ADICIONAR/REMOVER/EDITAR) */}
        {/* ========================================================================= */}
        {activeTab === 'panels' && (
          <form onSubmit={handleSaveSiteConfig} className="space-y-6">
            {!isUserAdmin && (
              <div className="p-4 bg-amber-950/40 border border-amber-500/50 rounded-lg flex items-center gap-3 text-amber-200 text-xs font-['Space_Grotesk']">
                <span className="material-symbols-outlined text-amber-400 text-xl">lock</span>
                <div>
                  <strong className="block text-amber-300 font-bold mb-0.5">Modo de Visualização para Operadores</strong>
                  As alterações na exibição ou remoção de painéis do site são restritas a <strong>Administradores</strong>.
                </div>
              </div>
            )}

            {/* Notificação de Sucesso */}
            {saveConfigSuccess && (
              <div className="bg-[#10B981]/20 border border-[#10B981] p-4 rounded-lg flex items-center justify-between text-[#10B981] animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  <span className="font-['Space_Grotesk'] text-sm font-bold">
                    Sucesso! A visibilidade e os textos de todos os painéis foram salvos e já estão ativos no site.
                  </span>
                </div>
                <Link
                  href="/"
                  className="px-3 py-1 bg-[#10B981] text-[#08090B] font-bold text-xs rounded uppercase font-['Space_Grotesk']"
                >
                  Ver Home ao Vivo
                </Link>
              </div>
            )}

            {/* Cabeçalho da Aba de Painéis */}
            <div className="bg-[#1A1E26] border border-[#282E3A] p-4 rounded-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-sm font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f2ca50]">dashboard_customize</span>
                  Controle de Janelas, Painéis &amp; Seções da Loja
                </h2>
                <p className="text-xs text-[#9CA3AF] font-['Manrope'] mt-0.5">
                  Escolha se deseja deixar ou remover cada janela/painel do site e edite o texto contido em cada um deles.
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
                  className={`px-5 py-2 font-['Space_Grotesk'] font-bold text-xs uppercase rounded flex items-center gap-1.5 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed ${
                    saveConfigSuccess
                      ? 'bg-[#10B981] text-[#08090B]'
                      : 'bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B]'
                  }`}
                >
                  <span className="material-symbols-outlined text-sm">
                    {saveConfigSuccess ? 'task_alt' : 'save'}
                  </span>
                  {saveConfigSuccess ? 'Salvo com Sucesso!' : 'Salvar Alterações'}
                </button>
              </div>
            </div>

            {/* LISTAGEM DOS PAINÉIS */}
            <div className="space-y-6">
              {/* PAINEL 0: TIPO DE EXIBIÇÃO NO DESTAQUE PRINCIPAL DA HOME (HERO) */}
              <div className="bg-[#12151B] border border-[#f2ca50]/50 rounded-lg p-5 space-y-5 shadow-[0_0_30px_rgba(242,202,80,0.08)]">
                <div className="border-b border-[#282E3A] pb-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-md bg-[#f2ca50]/15 border border-[#f2ca50]/30 flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-[#f2ca50] text-xl">auto_awesome</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                          Tipo de Exibição no Destaque da Home
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase font-['Space_Grotesk'] bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/30">
                          Quadro Principal
                        </span>
                      </div>
                      <p className="text-[11px] text-[#9CA3AF] font-['Manrope']">
                        Selecione o tipo de conteúdo exibido no quadro ao lado do texto da Home: Destaque da Galeria, Produtos da Vitrine ou Logotipo da Empresa em Tamanho Maior.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {siteConfig.heroDisplayMode === 'logo' && (
                      <button
                        type="button"
                        onClick={handleResetHeroLogo}
                        disabled={!isUserAdmin}
                        className="px-3 py-1.5 bg-[#08090B] hover:bg-[#1A1E26] border border-[#282E3A] hover:border-[#f2ca50] text-[#9CA3AF] hover:text-[#F4F1EA] text-[11px] font-['Space_Grotesk'] rounded transition-colors flex items-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed"
                        title="Restaurar o logotipo oficial padrão da Diamond Relics no destaque"
                      >
                        <span className="material-symbols-outlined text-sm text-[#f2ca50]">restart_alt</span>
                        Restaurar Logo Original
                      </button>
                    )}
                  </div>
                </div>

                {/* BOTÕES DE SELEÇÃO DO TIPO DE IMAGEM / DESTAQUE */}
                <div>
                  <label className="text-xs font-['Space_Grotesk'] font-bold text-[#F4F1EA] uppercase tracking-wider block mb-3 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-[#f2ca50]">tune</span>
                    Selecione o Tipo de Imagem / Conteúdo a ser Exibido:
                  </label>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Botão 1: Destaque da Galeria */}
                    <button
                      type="button"
                      onClick={() =>
                        setSiteConfig({ ...siteConfig, heroDisplayMode: 'product' })
                      }
                      className={`p-4 rounded-lg border text-left transition-all flex flex-col gap-2 relative group ${
                        !siteConfig.heroDisplayMode || siteConfig.heroDisplayMode === 'product'
                          ? 'bg-[#f2ca50]/15 border-[#f2ca50] text-[#F4F1EA] shadow-[0_0_20px_rgba(242,202,80,0.18)]'
                          : 'bg-[#08090B] border-[#282E3A] text-[#9CA3AF] hover:border-[#f2ca50]/50 hover:text-[#F4F1EA]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded bg-[#12151B] border border-[#282E3A] group-hover:border-[#f2ca50]/50 flex items-center justify-center">
                          <span className="material-symbols-outlined text-base text-[#f2ca50]">photo_library</span>
                        </div>
                        {(!siteConfig.heroDisplayMode || siteConfig.heroDisplayMode === 'product') ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase font-['Space_Grotesk'] bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                            Ativo
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#9CA3AF] font-['Space_Grotesk']">Clique p/ Ativar</span>
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-xs block text-[#F4F1EA]">
                          1. Destaque da Galeria
                        </span>
                        <span className="text-[11px] leading-tight text-[#9CA3AF] block mt-1 font-['Manrope']">
                          Card com carrossel de fotos, miniaturas clicáveis, preço em R$ e botão Comprar.
                        </span>
                      </div>
                    </button>

                    {/* Botão 2: Produtos da Vitrine */}
                    <button
                      type="button"
                      onClick={() =>
                        setSiteConfig({ ...siteConfig, heroDisplayMode: 'vitrine' })
                      }
                      className={`p-4 rounded-lg border text-left transition-all flex flex-col gap-2 relative group ${
                        siteConfig.heroDisplayMode === 'vitrine'
                          ? 'bg-[#f2ca50]/15 border-[#f2ca50] text-[#F4F1EA] shadow-[0_0_20px_rgba(242,202,80,0.18)]'
                          : 'bg-[#08090B] border-[#282E3A] text-[#9CA3AF] hover:border-[#f2ca50]/50 hover:text-[#F4F1EA]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded bg-[#12151B] border border-[#282E3A] group-hover:border-[#f2ca50]/50 flex items-center justify-center">
                          <span className="material-symbols-outlined text-base text-[#f2ca50]">storefront</span>
                        </div>
                        {siteConfig.heroDisplayMode === 'vitrine' ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase font-['Space_Grotesk'] bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                            Ativo
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#9CA3AF] font-['Space_Grotesk']">Clique p/ Ativar</span>
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-xs block text-[#F4F1EA]">
                          2. Produtos da Vitrine
                        </span>
                        <span className="text-[11px] leading-tight text-[#9CA3AF] block mt-1 font-['Manrope']">
                          Exibe os itens cadastrados na vitrine principal da loja no quadro de destaque.
                        </span>
                      </div>
                    </button>

                    {/* Botão 3: Logotipo da Empresa em Tamanho Maior */}
                    <button
                      type="button"
                      onClick={() =>
                        setSiteConfig({ ...siteConfig, heroDisplayMode: 'logo' })
                      }
                      className={`p-4 rounded-lg border text-left transition-all flex flex-col gap-2 relative group ${
                        siteConfig.heroDisplayMode === 'logo'
                          ? 'bg-[#f2ca50]/15 border-[#f2ca50] text-[#F4F1EA] shadow-[0_0_20px_rgba(242,202,80,0.18)]'
                          : 'bg-[#08090B] border-[#282E3A] text-[#9CA3AF] hover:border-[#f2ca50]/50 hover:text-[#F4F1EA]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-8 h-8 rounded bg-[#12151B] border border-[#282E3A] group-hover:border-[#f2ca50]/50 flex items-center justify-center">
                          <span className="material-symbols-outlined text-base text-[#f2ca50]">diamond</span>
                        </div>
                        {siteConfig.heroDisplayMode === 'logo' ? (
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase font-['Space_Grotesk'] bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-pulse"></span>
                            Ativo
                          </span>
                        ) : (
                          <span className="text-[10px] text-[#9CA3AF] font-['Space_Grotesk']">Clique p/ Ativar</span>
                        )}
                      </div>
                      <div>
                        <span className="font-bold text-xs block text-[#F4F1EA]">
                          3. Logotipo em Tamanho Maior
                        </span>
                        <span className="text-[11px] leading-tight text-[#9CA3AF] block mt-1 font-['Manrope']">
                          Brasão 3D dourado da Diamond Relics com @diamond.relics.
                        </span>
                      </div>
                    </button>
                  </div>
                </div>

                {/* PAINEL DINÂMICO CONFORME O MODO SELECIONADO */}

                {/* MODO 3: LOGOTIPO EM TAMANHO MAIOR */}
                {siteConfig.heroDisplayMode === 'logo' && (
                  <div className="p-4 sm:p-5 bg-[#08090B] border border-[#f2ca50]/40 rounded-lg space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-[#282E3A] pb-2.5">
                      <span className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-[#f2ca50]">image</span>
                        Configuração do Logotipo / Imagem em Tamanho Maior
                      </span>
                      <span className="text-[10px] text-[#10B981] font-['Space_Grotesk'] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                        Modo Logotipo Ativo na Home
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-5 items-center">
                      {/* Pré-visualização */}
                      <div className="md:col-span-5 bg-[#050608] border border-[#282E3A] rounded-xl p-5 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-2xl">
                        <div className="absolute top-2 left-3 text-[9px] font-['Space_Grotesk'] text-[#9CA3AF] uppercase">
                          Pré-visualização da Home
                        </div>
                        {/* Glow Dourado Ambiente de Fundo */}
                        <div className="absolute -inset-4 bg-[#f2ca50]/10 rounded-full blur-2xl pointer-events-none" />

                        <div className="w-full py-4 flex items-center justify-center min-h-[170px] relative z-10">
                          <img
                            src={siteConfig.heroCustomImageUrl || '/diamond-relics-logo.png'}
                            alt="Logotipo Oficial Diamond Relics"
                            className="max-h-36 sm:max-h-44 w-auto object-contain drop-shadow-[0_15px_30px_rgba(0,0,0,0.9)]"
                          />
                        </div>

                        {/* Badge do Instagram conforme segunda imagem (Link Clicável) */}
                        {siteConfig.heroCustomInstagramHandle?.trim() && (
                          <a
                            href={`https://instagram.com/${siteConfig.heroCustomInstagramHandle.replace('@', '').trim()}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative z-10 mt-2 flex items-center justify-center gap-2 px-3.5 py-1.5 rounded-full bg-[#12151B]/90 hover:bg-[#1A1E26] border border-[#282E3A] hover:border-[#f2ca50] transition-colors group/admininsta cursor-pointer"
                            title={`Abrir perfil ${siteConfig.heroCustomInstagramHandle} no Instagram`}
                          >
                            <svg
                              className="w-3.5 h-3.5 text-[#f2ca50] group-hover/admininsta:scale-110 transition-transform shrink-0"
                              fill="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                            </svg>
                            <span className="text-[11px] font-['Space_Grotesk'] text-[#F4F1EA] group-hover/admininsta:text-[#f2ca50] font-medium transition-colors">
                              {siteConfig.heroCustomInstagramHandle}
                            </span>
                            <span className="material-symbols-outlined text-[12px] text-[#9CA3AF] group-hover/admininsta:text-[#f2ca50] transition-colors">
                              open_in_new
                            </span>
                          </a>
                        )}
                      </div>

                      {/* Controles de Upload e Customização do Logotipo */}
                      <div className="md:col-span-7 space-y-3.5 text-xs font-['Space_Grotesk']">
                        <div>
                          <label className="text-[#F4F1EA] block mb-1.5 font-bold flex items-center justify-between">
                            <span>Trocar / Enviar Imagem do Logotipo:</span>
                            <span className="text-[10px] text-[#9CA3AF] font-normal">
                              PNG transparente, SVG, WebP ou JPG (até 5MB)
                            </span>
                          </label>
                          <div className="flex flex-col sm:flex-row items-center gap-2">
                            <label className="w-full sm:w-auto px-4 py-2.5 bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B] font-bold text-xs uppercase rounded cursor-pointer transition-colors flex items-center justify-center gap-2 shadow-sm shrink-0">
                              <span className="material-symbols-outlined text-base">upload_file</span>
                              Selecionar Arquivo do Computador
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleHeroCustomImageUpload}
                                disabled={!isUserAdmin}
                                className="hidden"
                              />
                            </label>
                            <span className="text-[11px] text-[#9CA3AF]">ou cole o link da imagem</span>
                          </div>
                        </div>

                        <div>
                          <label className="text-[#9CA3AF] block mb-1 font-semibold">
                            Link Direto da Imagem (URL):
                          </label>
                          <input
                            type="text"
                            value={siteConfig.heroCustomImageUrl || ''}
                            onChange={(e) =>
                              setSiteConfig({ ...siteConfig, heroCustomImageUrl: e.target.value })
                            }
                            placeholder="Ex: https://meusite.com/logo.png ou deixe vazio para o padrão"
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                          />
                        </div>

                        <div>
                          <label className="text-[#9CA3AF] block mb-1 font-semibold">
                            Identificador do Instagram exibido abaixo do logotipo:
                          </label>
                          <input
                            type="text"
                            value={siteConfig.heroCustomInstagramHandle ?? ''}
                            onChange={(e) =>
                              setSiteConfig({ ...siteConfig, heroCustomInstagramHandle: e.target.value })
                            }
                            placeholder="Deixe em branco para não exibir ou digite ex: @diamond.relics"
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                          />
                        </div>

                        <div className="p-3 bg-[#12151B] border border-[#282E3A] rounded-lg text-[11px] text-[#9CA3AF] leading-relaxed">
                          <span className="text-[#10B981] font-bold block mb-0.5">
                            ✓ Identidade Visual Preservada
                          </span>
                          Esta opção altera exclusivamente o quadro de destaque da página inicial em tamanho maior. Os logotipos do cabeçalho (Navbar) e do rodapé permanecem protegidos e inalterados.
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* MODO 1: DESTAQUE DA GALERIA */}
                {(!siteConfig.heroDisplayMode || siteConfig.heroDisplayMode === 'product') && (
                  <div className="p-4 sm:p-5 bg-[#08090B] border border-[#282E3A] rounded-lg space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-[#282E3A] pb-2.5">
                      <span className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-[#f2ca50]">photo_library</span>
                        Configuração do Destaque da Galeria
                      </span>
                      <span className="text-[10px] text-[#10B981] font-['Space_Grotesk'] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                        Modo Galeria Ativo na Home
                      </span>
                    </div>

                    <div className="space-y-3.5 text-xs font-['Space_Grotesk']">
                      <div>
                        <label className="text-[#F4F1EA] block mb-1.5 font-bold flex items-center justify-between">
                          <span>Selecionar Produto para o Destaque Principal:</span>
                          <span className="text-[10px] text-[#9CA3AF] font-normal">
                            {products.length} relíquias cadastradas
                          </span>
                        </label>
                        <select
                          value={siteConfig.heroSelectedProductId || ''}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              heroSelectedProductId: e.target.value,
                            })
                          }
                          className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2.5 text-[#F4F1EA] text-xs font-['Space_Grotesk'] focus:outline-none focus:border-[#f2ca50]"
                        >
                          <option value="">
                            ★ Automático (Alternar entre os produtos marcados como Destaque na Galeria)
                          </option>
                          {products.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.title} — {prod.athlete} (R$ {(Number(prod.priceBRL) || 0).toLocaleString('pt-BR')},00)
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Miniatura do produto selecionado */}
                      {siteConfig.heroSelectedProductId && (
                        (() => {
                          const sel = products.find((p) => p.id === siteConfig.heroSelectedProductId);
                          if (!sel) return null;
                          return (
                            <div className="p-3 bg-[#12151B] border border-[#f2ca50]/30 rounded-lg flex items-center gap-3">
                              <img
                                src={sel.imageUrl}
                                alt={sel.title}
                                className="w-14 h-14 object-contain rounded bg-[#08090B] border border-[#282E3A] shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] text-[#f2ca50] uppercase font-bold block">
                                  Item Fixo Selecionado para o Destaque
                                </span>
                                <h4 className="text-xs font-bold text-[#F4F1EA] truncate">
                                  {sel.title}
                                </h4>
                                <span className="text-[11px] text-[#9CA3AF]">
                                  {sel.athlete} • R$ {(Number(sel.priceBRL) || 0).toLocaleString('pt-BR')},00 • {sel.status === 'sold' ? 'Vendido' : 'Disponível'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSiteConfig({ ...siteConfig, heroSelectedProductId: '' })}
                                className="text-[10px] text-red-400 hover:text-red-300 px-2.5 py-1 bg-red-950/40 border border-red-800/40 rounded shrink-0 transition-colors"
                                title="Voltar para rotação automática de destaques"
                              >
                                Limpar Seleção Fixa
                              </button>
                            </div>
                          );
                        })()
                      )}

                      {/* Controle de Carrossel Automático de Fotos da Galeria */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                        <div className="p-3 bg-[#12151B] border border-[#282E3A] rounded flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-[#F4F1EA] block">
                              Carrossel Automático de Fotos
                            </span>
                            <span className="text-[10px] text-[#9CA3AF]">
                              Troca as fotos da galeria automaticamente no card
                            </span>
                          </div>
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={siteConfig.featuredAutoPlay !== false}
                              onChange={(e) =>
                                setSiteConfig({ ...siteConfig, featuredAutoPlay: e.target.checked })
                              }
                              className="sr-only peer"
                            />
                            <div className="w-9 h-5 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                          </label>
                        </div>

                        <div className="p-3 bg-[#12151B] border border-[#282E3A] rounded flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold text-[#F4F1EA] block">
                              Tempo de Troca de Foto
                            </span>
                            <span className="text-[10px] text-[#9CA3AF]">
                              Segundos para cada imagem
                            </span>
                          </div>
                          <input
                            type="number"
                            min={2}
                            max={20}
                            value={siteConfig.featuredIntervalSeconds || 4}
                            onChange={(e) =>
                              setSiteConfig({
                                ...siteConfig,
                                featuredIntervalSeconds: Math.max(2, parseInt(e.target.value) || 4),
                              })
                            }
                            className="w-16 bg-[#08090B] border border-[#282E3A] rounded px-2 py-1 text-[#F4F1EA] text-center text-xs focus:outline-none focus:border-[#f2ca50]"
                          />
                        </div>
                      </div>

                      <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                        💡 <strong>Dica da Galeria:</strong> Você pode adicionar fotos, ordenar arrastando e escolher a foto de capa diretamente na aba <strong>&ldquo;Catálogo de Produtos&rdquo;</strong> clicando em <strong>&ldquo;Editar Galeria&rdquo;</strong> em qualquer item!
                      </p>
                    </div>
                  </div>
                )}

                {/* MODO 2: PRODUTOS DA VITRINE */}
                {siteConfig.heroDisplayMode === 'vitrine' && (
                  <div className="p-4 sm:p-5 bg-[#08090B] border border-[#282E3A] rounded-lg space-y-4 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-[#282E3A] pb-2.5">
                      <span className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-sm text-[#f2ca50]">storefront</span>
                        Configuração dos Produtos da Vitrine
                      </span>
                      <span className="text-[10px] text-[#10B981] font-['Space_Grotesk'] font-bold flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#10B981]"></span>
                        Modo Vitrine Ativo na Home
                      </span>
                    </div>

                    <div className="space-y-3.5 text-xs font-['Space_Grotesk']">
                      <div>
                        <label className="text-[#F4F1EA] block mb-1.5 font-bold flex items-center justify-between">
                          <span>Selecionar Item da Vitrine para Exibir:</span>
                          <span className="text-[10px] text-[#9CA3AF] font-normal">
                            {products.length} produtos na vitrine
                          </span>
                        </label>
                        <select
                          value={siteConfig.heroSelectedProductId || ''}
                          onChange={(e) =>
                            setSiteConfig({
                              ...siteConfig,
                              heroSelectedProductId: e.target.value,
                            })
                          }
                          className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2.5 text-[#F4F1EA] text-xs font-['Space_Grotesk'] focus:outline-none focus:border-[#f2ca50]"
                        >
                          <option value="">
                            ★ Vitrine Completa (Alternar entre todos os itens cadastrados na Vitrine da Home)
                          </option>
                          {products.map((prod) => (
                            <option key={prod.id} value={prod.id}>
                              {prod.title} — {prod.athlete} (R$ {(Number(prod.priceBRL) || 0).toLocaleString('pt-BR')},00)
                            </option>
                          ))}
                        </select>
                      </div>

                      {siteConfig.heroSelectedProductId && (
                        (() => {
                          const sel = products.find((p) => p.id === siteConfig.heroSelectedProductId);
                          if (!sel) return null;
                          return (
                            <div className="p-3 bg-[#12151B] border border-[#f2ca50]/30 rounded-lg flex items-center gap-3">
                              <img
                                src={sel.imageUrl}
                                alt={sel.title}
                                className="w-14 h-14 object-contain rounded bg-[#08090B] border border-[#282E3A] shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <span className="text-[10px] text-[#f2ca50] uppercase font-bold block">
                                  Peça da Vitrine Selecionada
                                </span>
                                <h4 className="text-xs font-bold text-[#F4F1EA] truncate">
                                  {sel.title}
                                </h4>
                                <span className="text-[11px] text-[#9CA3AF]">
                                  {sel.athlete} • R$ {(Number(sel.priceBRL) || 0).toLocaleString('pt-BR')},00 • {sel.status === 'sold' ? 'Vendido' : 'Disponível'}
                                </span>
                              </div>
                              <button
                                type="button"
                                onClick={() => setSiteConfig({ ...siteConfig, heroSelectedProductId: '' })}
                                className="text-[10px] text-red-400 hover:text-red-300 px-2.5 py-1 bg-red-950/40 border border-red-800/40 rounded shrink-0 transition-colors"
                              >
                                Limpar
                              </button>
                            </div>
                          );
                        })()
                      )}

                      <p className="text-[11px] text-[#9CA3AF] leading-relaxed">
                        Exibe os produtos da vitrine da loja no card do Hero. Os clientes podem navegar entre os itens da vitrine com os botões de avançar e voltar.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* PAINEL 1: FAIXA SUPERIOR DE AVISOS (RELAYBAR) */}
              <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
                <div className="border-b border-[#282E3A] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f2ca50] text-lg">vertical_align_top</span>
                    <div>
                      <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                        1. Faixa Superior de Anúncios &amp; Navegação (Topo de Tudo)
                      </h3>
                      <p className="text-[11px] text-[#9CA3AF] font-['Manrope']">
                        A barra escura superior com nome da loja, status verde e aviso oficial.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['Space_Grotesk'] ${
                        siteConfig.showTopRelayBar !== false
                          ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                          : 'bg-[#282E3A] text-[#9CA3AF]'
                      }`}
                    >
                      {siteConfig.showTopRelayBar !== false ? '🟢 Ativo no Site' : '⚪ Ocultado'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteConfig.showTopRelayBar !== false}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, showTopRelayBar: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>
                </div>

                {siteConfig.showTopRelayBar !== false && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-['Space_Grotesk'] pt-1 animate-fadeIn">
                    <div className="sm:col-span-2">
                      <label className="text-[#9CA3AF] block mb-1 font-semibold">
                        Texto de Anúncio da Faixa Superior:
                      </label>
                      <input
                        type="text"
                        value={siteConfig.topBannerText || ''}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, topBannerText: e.target.value })
                        }
                        className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PAINEL 2: AVISO RÁPIDO DO MENU SUPERIOR (NAVBAR) */}
              <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
                <div className="border-b border-[#282E3A] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f2ca50] text-lg">call_to_action</span>
                    <div>
                      <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                        2. Aviso Informativo no Menu Superior (Navbar)
                      </h3>
                      <p className="text-[11px] text-[#9CA3AF] font-['Manrope']">
                        Texto com bolinha dourada exibido ao lado do link do catálogo no menu principal.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['Space_Grotesk'] ${
                        siteConfig.showNavbarBadge !== false
                          ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                          : 'bg-[#282E3A] text-[#9CA3AF]'
                      }`}
                    >
                      {siteConfig.showNavbarBadge !== false ? '🟢 Ativo no Menu' : '⚪ Ocultado'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteConfig.showNavbarBadge !== false}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, showNavbarBadge: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>
                </div>

                {siteConfig.showNavbarBadge !== false && (
                  <div className="text-xs font-['Space_Grotesk'] pt-1 animate-fadeIn">
                    <label className="text-[#9CA3AF] block mb-1 font-semibold">
                      Texto do Aviso do Menu:
                    </label>
                    <input
                      type="text"
                      value={siteConfig.navbarBadgeText || ''}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, navbarBadgeText: e.target.value })
                      }
                      placeholder="Ex: Envio Seguro Especializado"
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                )}
              </div>

              {/* PAINEL 3: SEÇÃO HERO & DESTAQUES */}
              <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
                <div className="border-b border-[#282E3A] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f2ca50] text-lg">view_headline</span>
                    <div>
                      <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                        3. Seção Hero (Banner Principal &amp; Card em Destaque)
                      </h3>
                      <p className="text-[11px] text-[#9CA3AF] font-['Manrope']">
                        Apresentação principal da Home, título de impacto e card de produto em destaque.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['Space_Grotesk'] ${
                        siteConfig.showHeroSection !== false
                          ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                          : 'bg-[#282E3A] text-[#9CA3AF]'
                      }`}
                    >
                      {siteConfig.showHeroSection !== false ? '🟢 Ativo no Site' : '⚪ Ocultado'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteConfig.showHeroSection !== false}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, showHeroSection: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>
                </div>

                {siteConfig.showHeroSection !== false && (
                  <div className="space-y-4 text-xs font-['Space_Grotesk'] pt-1 animate-fadeIn">
                    <div className="flex items-center justify-between p-3 bg-[#08090B] border border-[#282E3A] rounded">
                      <div>
                        <span className="font-bold text-[#F4F1EA] block">
                          Selos de Confiança (100% Autêntico / Entrega Segura / Pagamento em R$)
                        </span>
                        <span className="text-[11px] text-[#9CA3AF]">
                          Exibe os 3 pequenos selos de garantia logo abaixo dos botões do Hero.
                        </span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer shrink-0">
                        <input
                          type="checkbox"
                          checked={siteConfig.showHeroTrustBadges !== false}
                          onChange={(e) =>
                            setSiteConfig({ ...siteConfig, showHeroTrustBadges: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-9 h-5 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">Tagline Superior:</label>
                        <input
                          type="text"
                          value={siteConfig.heroTagline || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, heroTagline: e.target.value })}
                          className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>
                      <div>
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">Título Principal (H1):</label>
                        <input
                          type="text"
                          value={siteConfig.heroTitle || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, heroTitle: e.target.value })}
                          className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">Texto / Subtítulo do Hero:</label>
                        <textarea
                          rows={2}
                          value={siteConfig.heroSubtitle || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, heroSubtitle: e.target.value })}
                          className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>
                    </div>

                    {/* Indicador do Modo de Destaque configurado no topo */}
                    <div className="pt-3 border-t border-[#282E3A] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[#f2ca50] text-base">auto_awesome</span>
                        <span>
                          O tipo de card exibido (Galeria, Vitrine ou Logotipo Maior) é gerenciado no <strong>Painel de Destaque da Home</strong> no topo.
                        </span>
                      </div>
                      <span className="text-[10px] text-[#f2ca50] uppercase font-bold">
                        Modo Ativo: {siteConfig.heroDisplayMode === 'logo' ? 'Logotipo Maior' : siteConfig.heroDisplayMode === 'vitrine' ? 'Produtos da Vitrine' : 'Destaque da Galeria'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* PAINEL 4: VITRINE DE PRODUTOS */}
              <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
                <div className="border-b border-[#282E3A] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f2ca50] text-lg">grid_view</span>
                    <div>
                      <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                        4. Vitrine de Produtos (Acervo da Home)
                      </h3>
                      <p className="text-[11px] text-[#9CA3AF] font-['Manrope']">
                        Grid com as relíquias esportivas disponíveis e cards com troca de fotos.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['Space_Grotesk'] ${
                        siteConfig.showVitrineSection !== false
                          ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                          : 'bg-[#282E3A] text-[#9CA3AF]'
                      }`}
                    >
                      {siteConfig.showVitrineSection !== false ? '🟢 Ativo no Site' : '⚪ Ocultado'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteConfig.showVitrineSection !== false}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, showVitrineSection: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>
                </div>

                {siteConfig.showVitrineSection !== false && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-['Space_Grotesk'] pt-1 animate-fadeIn">
                    <div>
                      <label className="text-[#9CA3AF] block mb-1 font-semibold">Badge Superior da Vitrine:</label>
                      <input
                        type="text"
                        value={siteConfig.showcaseBadge || ''}
                        onChange={(e) => setSiteConfig({ ...siteConfig, showcaseBadge: e.target.value })}
                        className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>
                    <div>
                      <label className="text-[#9CA3AF] block mb-1 font-semibold">Título Principal da Vitrine:</label>
                      <input
                        type="text"
                        value={siteConfig.showcaseTitle || ''}
                        onChange={(e) => setSiteConfig({ ...siteConfig, showcaseTitle: e.target.value })}
                        className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* PAINEL 5: JANELA DE CONSULTA DE CERTIFICADO (COA) */}
              <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
                <div className="border-b border-[#282E3A] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#10B981] text-lg">verified</span>
                    <div>
                      <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                        5. Janela de Consulta de Certificado Forense (COA)
                      </h3>
                      <p className="text-[11px] text-[#9CA3AF] font-['Manrope']">
                        Painel interativo onde o cliente digita o código do laudo para validar a autenticidade.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['Space_Grotesk'] ${
                        siteConfig.showCoaSection !== false
                          ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                          : 'bg-red-950/40 text-red-300 border border-red-900/60'
                      }`}
                    >
                      {siteConfig.showCoaSection !== false ? '🟢 Exibido no Site' : '⚪ Removido da Página'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteConfig.showCoaSection !== false}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, showCoaSection: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#9CA3AF] font-['Space_Grotesk'] bg-[#08090B] p-2.5 rounded border border-[#282E3A]/60">
                  <span>
                    {siteConfig.showCoaSection !== false
                      ? 'Esta janela está atualmente VISÍVEL na página inicial para os clientes consultarem certificados.'
                      : 'Esta janela foi REMOVIDA da página inicial. O campo de busca de laudos não será exibido.'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSiteConfig({
                        ...siteConfig,
                        showCoaSection: !(siteConfig.showCoaSection !== false),
                      })
                    }
                    className="text-[11px] font-bold text-[#f2ca50] hover:underline shrink-0 ml-2"
                  >
                    {siteConfig.showCoaSection !== false ? 'Remover Janela' : 'Reativar Janela'}
                  </button>
                </div>

                {siteConfig.showCoaSection !== false && (
                  <div className="space-y-4 text-xs font-['Space_Grotesk'] pt-1 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">Selo Superior:</label>
                        <input
                          type="text"
                          value={siteConfig.coaBadge || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, coaBadge: e.target.value })}
                          className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>
                      <div>
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">Título Principal:</label>
                        <input
                          type="text"
                          value={siteConfig.coaTitle || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, coaTitle: e.target.value })}
                          className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">Texto de Instrução:</label>
                        <textarea
                          rows={2}
                          value={siteConfig.coaSubtitle || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, coaSubtitle: e.target.value })}
                          className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>
                      <div>
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">Placeholder do Campo:</label>
                        <input
                          type="text"
                          value={siteConfig.coaPlaceholder || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, coaPlaceholder: e.target.value })}
                          className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>
                      <div>
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">Texto do Botão:</label>
                        <input
                          type="text"
                          value={siteConfig.coaBtnText || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, coaBtnText: e.target.value })}
                          className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PAINEL 6: JANELA "POR QUE COMPRAR?" (GARANTIAS EXCLUSIVAS) */}
              <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
                <div className="border-b border-[#282E3A] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f2ca50] text-lg">shield</span>
                    <div>
                      <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                        6. Janela &quot;Por que Comprar?&quot; (Garantias Exclusivas &amp; Benefícios)
                      </h3>
                      <p className="text-[11px] text-[#9CA3AF] font-['Manrope']">
                        Os 3 cards de diferenciais da loja (Perícia Forense, Transporte Especial e Nota Fiscal).
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['Space_Grotesk'] ${
                        siteConfig.showBenefitsSection !== false
                          ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                          : 'bg-red-950/40 text-red-300 border border-red-900/60'
                      }`}
                    >
                      {siteConfig.showBenefitsSection !== false ? '🟢 Exibido no Site' : '⚪ Removido da Página'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteConfig.showBenefitsSection !== false}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, showBenefitsSection: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-[#9CA3AF] font-['Space_Grotesk'] bg-[#08090B] p-2.5 rounded border border-[#282E3A]/60">
                  <span>
                    {siteConfig.showBenefitsSection !== false
                      ? 'Esta janela está atualmente VISÍVEL na página inicial da loja.'
                      : 'Esta janela foi REMOVIDA da página inicial. Os 3 cards de garantias não serão exibidos.'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSiteConfig({
                        ...siteConfig,
                        showBenefitsSection: !(siteConfig.showBenefitsSection !== false),
                      })
                    }
                    className="text-[11px] font-bold text-[#f2ca50] hover:underline shrink-0 ml-2"
                  >
                    {siteConfig.showBenefitsSection !== false ? 'Remover Janela' : 'Reativar Janela'}
                  </button>
                </div>

                {siteConfig.showBenefitsSection !== false && (
                  <div className="space-y-4 text-xs font-['Space_Grotesk'] pt-1 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">Selo Superior:</label>
                        <input
                          type="text"
                          value={siteConfig.benefitsBadge || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, benefitsBadge: e.target.value })}
                          className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>
                      <div>
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">Título Principal da Seção:</label>
                        <input
                          type="text"
                          value={siteConfig.benefitsTitle || ''}
                          onChange={(e) => setSiteConfig({ ...siteConfig, benefitsTitle: e.target.value })}
                          className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#282E3A] grid grid-cols-1 md:grid-cols-3 gap-4">
                      {/* Card 1 */}
                      <div className="p-3 bg-[#08090B] border border-[#282E3A] rounded space-y-2">
                        <span className="font-bold text-[#f2ca50] block">Card 1: Perícia</span>
                        <div>
                          <label className="text-[#9CA3AF] text-[10px] block mb-0.5">Título:</label>
                          <input
                            type="text"
                            value={siteConfig.benefit1Title || ''}
                            onChange={(e) => setSiteConfig({ ...siteConfig, benefit1Title: e.target.value })}
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-2.5 py-1.5 text-[#F4F1EA] text-xs focus:border-[#f2ca50] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[#9CA3AF] text-[10px] block mb-0.5">Descrição:</label>
                          <textarea
                            rows={3}
                            value={siteConfig.benefit1Desc || ''}
                            onChange={(e) => setSiteConfig({ ...siteConfig, benefit1Desc: e.target.value })}
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-2.5 py-1.5 text-[#F4F1EA] text-xs focus:border-[#f2ca50] outline-none"
                          />
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="p-3 bg-[#08090B] border border-[#282E3A] rounded space-y-2">
                        <span className="font-bold text-[#f2ca50] block">Card 2: Transporte Especial</span>
                        <div>
                          <label className="text-[#9CA3AF] text-[10px] block mb-0.5">Título:</label>
                          <input
                            type="text"
                            value={siteConfig.benefit2Title || ''}
                            onChange={(e) => setSiteConfig({ ...siteConfig, benefit2Title: e.target.value })}
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-2.5 py-1.5 text-[#F4F1EA] text-xs focus:border-[#f2ca50] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[#9CA3AF] text-[10px] block mb-0.5">Descrição:</label>
                          <textarea
                            rows={3}
                            value={siteConfig.benefit2Desc || ''}
                            onChange={(e) => setSiteConfig({ ...siteConfig, benefit2Desc: e.target.value })}
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-2.5 py-1.5 text-[#F4F1EA] text-xs focus:border-[#f2ca50] outline-none"
                          />
                        </div>
                      </div>

                      {/* Card 3 */}
                      <div className="p-3 bg-[#08090B] border border-[#282E3A] rounded space-y-2">
                        <span className="font-bold text-[#f2ca50] block">Card 3: Nota Fiscal / Cartório</span>
                        <div>
                          <label className="text-[#9CA3AF] text-[10px] block mb-0.5">Título:</label>
                          <input
                            type="text"
                            value={siteConfig.benefit3Title || ''}
                            onChange={(e) => setSiteConfig({ ...siteConfig, benefit3Title: e.target.value })}
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-2.5 py-1.5 text-[#F4F1EA] text-xs focus:border-[#f2ca50] outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[#9CA3AF] text-[10px] block mb-0.5">Descrição:</label>
                          <textarea
                            rows={3}
                            value={siteConfig.benefit3Desc || ''}
                            onChange={(e) => setSiteConfig({ ...siteConfig, benefit3Desc: e.target.value })}
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-2.5 py-1.5 text-[#F4F1EA] text-xs focus:border-[#f2ca50] outline-none"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PAINEL 8: CERTIFICADO DE AUTENTICIDADE & LAUDO OFICIAL (PÁGINA DO PRODUTO) */}
              <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
                <div className="border-b border-[#282E3A] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f2ca50] text-lg">verified</span>
                    <div>
                      <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                        8. Certificado de Autenticidade &amp; Laudo Oficial (Página do Produto)
                      </h3>
                      <p className="text-[11px] text-[#9CA3AF] font-['Manrope']">
                        Quadro com selo oficial de autenticidade vitalícia e botão para baixar o Laudo Pericial em PDF.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['Space_Grotesk'] ${
                        siteConfig.showProductCertificateBanner !== false
                          ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                          : 'bg-[#282E3A] text-[#9CA3AF]'
                      }`}
                    >
                      {siteConfig.showProductCertificateBanner !== false ? '🟢 Exibido no Produto' : '⚪ Removido da Página'}
                    </span>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={siteConfig.showProductCertificateBanner !== false}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, showProductCertificateBanner: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-[#9CA3AF]">
                    {siteConfig.showProductCertificateBanner !== false
                      ? 'Este quadro está visível na página de detalhes da peça, permitindo aos clientes baixar o laudo em PDF.'
                      : 'Este quadro foi desativado e não aparecerá para os clientes na página da peça.'}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setSiteConfig({
                        ...siteConfig,
                        showProductCertificateBanner: !(siteConfig.showProductCertificateBanner !== false),
                      })
                    }
                    className="text-[11px] font-bold text-[#f2ca50] hover:underline shrink-0 ml-2 cursor-pointer"
                  >
                    {siteConfig.showProductCertificateBanner !== false ? 'Remover Janela' : 'Reativar Janela'}
                  </button>
                </div>

                {siteConfig.showProductCertificateBanner !== false && (
                  <div className="space-y-4 text-xs font-['Space_Grotesk'] pt-1 animate-fadeIn">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">
                          Título do Certificado:
                        </label>
                        <input
                          type="text"
                          value={siteConfig.productCertificateTitle ?? ''}
                          onChange={(e) =>
                            setSiteConfig({ ...siteConfig, productCertificateTitle: e.target.value })
                          }
                          placeholder="Ex: Certificado de Autenticidade Vitalício #COA-9801"
                          className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>

                      <div>
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">
                          Texto do Botão de Download:
                        </label>
                        <input
                          type="text"
                          value={siteConfig.productCertificateBtnText ?? ''}
                          onChange={(e) =>
                            setSiteConfig({ ...siteConfig, productCertificateBtnText: e.target.value })
                          }
                          placeholder="Ex: Baixar Laudo Oficial (PDF)"
                          className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>

                      <div className="sm:col-span-2">
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">
                          Subtítulo / Descrição do Laudo Pericial:
                        </label>
                        <textarea
                          rows={2}
                          value={siteConfig.productCertificateSubtitle ?? ''}
                          onChange={(e) =>
                            setSiteConfig({ ...siteConfig, productCertificateSubtitle: e.target.value })
                          }
                          placeholder="Ex: Laudo pericial com espectrometria molecular e correspondência fotográfica do jogo."
                          className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>
                    </div>

                    {/* Pré-visualização Fiel em Tempo Real */}
                    <div className="pt-2 border-t border-[#282E3A]">
                      <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block mb-2">
                        Pré-visualização em Tempo Real na Página da Peça:
                      </span>
                      <div className="bg-[#08090B] border border-[#282E3A] rounded-lg p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded bg-[#12151B] border border-[#C59B27] flex items-center justify-center text-[#f2ca50] shrink-0">
                            <span className="material-symbols-outlined text-2xl">verified</span>
                          </div>
                          <div>
                            <h4 className="text-xs font-bold text-[#F4F1EA] uppercase font-['Space_Grotesk']">
                              {siteConfig.productCertificateTitle || 'Certificado de Autenticidade Vitalício #COA-9801'}
                            </h4>
                            <p className="text-[11px] text-[#9CA3AF] font-['Manrope']">
                              {siteConfig.productCertificateSubtitle || 'Laudo pericial com espectrometria molecular e correspondência fotográfica do jogo.'}
                            </p>
                          </div>
                        </div>

                        <div className="px-4 py-2 bg-[#1A1E26] border border-[#C59B27] text-[#f2ca50] text-xs font-['Space_Grotesk'] font-semibold rounded flex items-center gap-1.5 shrink-0 opacity-90 select-none">
                          <span className="material-symbols-outlined text-base">download</span>
                          <span>{siteConfig.productCertificateBtnText || 'Baixar Laudo Oficial (PDF)'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* PAINEL 9: FRETE, SELOS DE GARANTIA & CONCIERGE WHATSAPP (PÁGINA DO PRODUTO) */}
              <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-6">
                <div className="border-b border-[#282E3A] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#f2ca50] text-lg">local_shipping</span>
                    <div>
                      <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                        9. Frete, Selos de Garantia &amp; Concierge WhatsApp (Página da Peça)
                      </h3>
                      <p className="text-[11px] text-[#9CA3AF] font-['Manrope']">
                        Personalize textos, ative ou oculte o simulador de frete, os selos de segurança e o botão com link direto para WhatsApp com número de celular.
                      </p>
                    </div>
                  </div>
                </div>

                {/* SUB-BLOCO 9.1: Simulador de Frete */}
                <div className="p-4 bg-[#08090B] border border-[#282E3A] rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#10B981] text-base">local_shipping</span>
                      <span className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase">
                        9.1 Simulador de Frete e Entrega Segura
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['Space_Grotesk'] ${
                          siteConfig.showProductFreightSimulator !== false
                            ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                            : 'bg-[#282E3A] text-[#9CA3AF]'
                        }`}
                      >
                        {siteConfig.showProductFreightSimulator !== false ? '🟢 Visível' : '⚪ Ocultado'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={siteConfig.showProductFreightSimulator !== false}
                          onChange={(e) =>
                            setSiteConfig({ ...siteConfig, showProductFreightSimulator: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                    </div>
                  </div>

                  {siteConfig.showProductFreightSimulator !== false && (
                    <div className="space-y-4 text-xs font-['Space_Grotesk'] pt-1 animate-fadeIn">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="sm:col-span-2">
                          <label className="text-[#9CA3AF] block mb-1 font-semibold">
                            Título do Simulador de Frete:
                          </label>
                          <input
                            type="text"
                            value={siteConfig.productFreightTitle ?? ''}
                            onChange={(e) =>
                              setSiteConfig({ ...siteConfig, productFreightTitle: e.target.value })
                            }
                            placeholder="Ex: SIMULADOR DE FRETE E ENTREGA SEGURA"
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                          />
                        </div>
                        <div>
                          <label className="text-[#9CA3AF] block mb-1 font-semibold">
                            Texto do Botão:
                          </label>
                          <input
                            type="text"
                            value={siteConfig.productFreightBtnText ?? ''}
                            onChange={(e) =>
                              setSiteConfig({ ...siteConfig, productFreightBtnText: e.target.value })
                            }
                            placeholder="Ex: Calcular"
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[#9CA3AF] block mb-1 font-semibold">
                            Texto de Dica / Placeholder do Campo de CEP:
                          </label>
                          <input
                            type="text"
                            value={siteConfig.productFreightPlaceholder ?? ''}
                            onChange={(e) =>
                              setSiteConfig({ ...siteConfig, productFreightPlaceholder: e.target.value })
                            }
                            placeholder="Ex: Digite seu CEP (ex: 01310-100)"
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                          />
                        </div>
                        <div>
                          <label className="text-[#9CA3AF] block mb-1 font-semibold">
                            Mensagem de Erro (CEP Inválido):
                          </label>
                          <input
                            type="text"
                            value={siteConfig.productFreightInvalidText ?? ''}
                            onChange={(e) =>
                              setSiteConfig({ ...siteConfig, productFreightInvalidText: e.target.value })
                            }
                            placeholder="Ex: Por favor, digite um CEP válido com 8 dígitos."
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">
                          Texto do Resultado do Frete (Após o Cálculo):
                        </label>
                        <input
                          type="text"
                          value={siteConfig.productFreightResultText ?? ''}
                          onChange={(e) =>
                            setSiteConfig({ ...siteConfig, productFreightResultText: e.target.value })
                          }
                          placeholder="Ex: Transporte Especializado: Grátis (Prazo estimado: 2 a 4 dias úteis com seguro total Lloyd's)"
                          className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* SUB-BLOCO 9.2: Selos de Confiança */}
                <div className="p-4 bg-[#08090B] border border-[#282E3A] rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#f2ca50] text-base">shield</span>
                      <span className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase">
                        9.2 Selos de Confiança &amp; Garantia Vitalícia
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['Space_Grotesk'] ${
                          siteConfig.showProductTrustBadges !== false
                            ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                            : 'bg-[#282E3A] text-[#9CA3AF]'
                        }`}
                      >
                        {siteConfig.showProductTrustBadges !== false ? '🟢 Visível' : '⚪ Ocultado'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={siteConfig.showProductTrustBadges !== false}
                          onChange={(e) =>
                            setSiteConfig({ ...siteConfig, showProductTrustBadges: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                    </div>
                  </div>

                  {siteConfig.showProductTrustBadges !== false && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-['Space_Grotesk'] pt-1 animate-fadeIn">
                      <div className="space-y-2 p-3 bg-[#12151B] rounded border border-[#282E3A]">
                        <span className="text-[11px] text-[#f2ca50] font-bold block">Selo 1 (Segurança / Seguro):</span>
                        <div>
                          <label className="text-[#9CA3AF] block mb-1 text-[11px]">Título:</label>
                          <input
                            type="text"
                            value={siteConfig.productTrustBadge1Title ?? ''}
                            onChange={(e) =>
                              setSiteConfig({ ...siteConfig, productTrustBadge1Title: e.target.value })
                            }
                            placeholder="Ex: Seguro Total"
                            className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                          />
                        </div>
                        <div>
                          <label className="text-[#9CA3AF] block mb-1 text-[11px]">Subtítulo:</label>
                          <input
                            type="text"
                            value={siteConfig.productTrustBadge1Subtitle ?? ''}
                            onChange={(e) =>
                              setSiteConfig({ ...siteConfig, productTrustBadge1Subtitle: e.target.value })
                            }
                            placeholder="Ex: Apólice Lloyd's"
                            className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                          />
                        </div>
                      </div>

                      <div className="space-y-2 p-3 bg-[#12151B] rounded border border-[#282E3A]">
                        <span className="text-[11px] text-[#10B981] font-bold block">Selo 2 (Autenticidade / Garantia):</span>
                        <div>
                          <label className="text-[#9CA3AF] block mb-1 text-[11px]">Título:</label>
                          <input
                            type="text"
                            value={siteConfig.productTrustBadge2Title ?? ''}
                            onChange={(e) =>
                              setSiteConfig({ ...siteConfig, productTrustBadge2Title: e.target.value })
                            }
                            placeholder="Ex: Garantia Vitalícia"
                            className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                          />
                        </div>
                        <div>
                          <label className="text-[#9CA3AF] block mb-1 text-[11px]">Subtítulo:</label>
                          <input
                            type="text"
                            value={siteConfig.productTrustBadge2Subtitle ?? ''}
                            onChange={(e) =>
                              setSiteConfig({ ...siteConfig, productTrustBadge2Subtitle: e.target.value })
                            }
                            placeholder="Ex: Autenticidade Forense"
                            className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* SUB-BLOCO 9.3: Atendimento VIP & Concierge WhatsApp */}
                <div className="p-4 bg-[#08090B] border border-[#282E3A] rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[#f2ca50] text-base">support_agent</span>
                      <span className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase">
                        9.3 Atendimento VIP &amp; Concierge (Link WhatsApp Direto)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['Space_Grotesk'] ${
                          siteConfig.showProductConcierge !== false
                            ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                            : 'bg-[#282E3A] text-[#9CA3AF]'
                        }`}
                      >
                        {siteConfig.showProductConcierge !== false ? '🟢 Visível' : '⚪ Ocultado'}
                      </span>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={siteConfig.showProductConcierge !== false}
                          onChange={(e) =>
                            setSiteConfig({ ...siteConfig, showProductConcierge: e.target.checked })
                          }
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                      </label>
                    </div>
                  </div>

                  {siteConfig.showProductConcierge !== false && (
                    <div className="space-y-4 text-xs font-['Space_Grotesk'] pt-1 animate-fadeIn">
                      <div className="p-3 bg-[#12151B] border border-[#C59B27]/40 rounded-lg space-y-3">
                        <div className="flex items-center gap-2 text-[#25D366]">
                          <span className="material-symbols-outlined text-lg">chat</span>
                          <span className="font-bold uppercase tracking-wider text-xs">
                            Configuração do Celular / WhatsApp de Atendimento:
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[#9CA3AF] block mb-1 font-semibold">
                              Número de Celular / WhatsApp (com DDD):
                            </label>
                            <input
                              type="text"
                              value={siteConfig.productConciergePhone ?? ''}
                              onChange={(e) =>
                                setSiteConfig({ ...siteConfig, productConciergePhone: e.target.value })
                              }
                              placeholder="Ex: +55 (11) 99842-1970 ou 11998421970"
                              className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#25D366]"
                            />
                            <p className="text-[10px] text-[#9CA3AF] mt-1 font-['Manrope']">
                              Ao clicar em &quot;Falar Agora&quot;, o cliente abrirá diretamente a conversa no WhatsApp deste número.
                            </p>
                          </div>

                          <div>
                            <label className="text-[#9CA3AF] block mb-1 font-semibold">
                              Mensagem Padrão que o Cliente Enviará:
                            </label>
                            <input
                              type="text"
                              value={siteConfig.productConciergeWhatsappMessage ?? ''}
                              onChange={(e) =>
                                setSiteConfig({ ...siteConfig, productConciergeWhatsappMessage: e.target.value })
                              }
                              placeholder="Ex: Olá! Gostaria de atendimento VIP sobre uma peça no acervo da Diamond Relics."
                              className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#25D366]"
                            />
                            <p className="text-[10px] text-[#9CA3AF] mt-1 font-['Manrope']">
                              Texto pré-preenchido que aparecerá na tela do WhatsApp do cliente.
                            </p>
                          </div>

                          <div>
                            <label className="text-[#9CA3AF] block mb-1 font-semibold">
                              Rótulo do WhatsApp no Card:
                            </label>
                            <input
                              type="text"
                              value={siteConfig.productConciergePhoneLabel ?? ''}
                              onChange={(e) =>
                                setSiteConfig({ ...siteConfig, productConciergePhoneLabel: e.target.value })
                              }
                              placeholder="Ex: WhatsApp:"
                              className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#25D366]"
                            />
                          </div>

                          <div className="flex items-center justify-between p-3 bg-[#08090B] rounded border border-[#282E3A]">
                            <div>
                              <span className="text-[#F4F1EA] font-semibold block text-xs">Exibir Linha do WhatsApp no Card</span>
                              <span className="text-[10px] text-[#9CA3AF]">Mostra o número/WhatsApp logo abaixo da descrição</span>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                              <input
                                type="checkbox"
                                checked={siteConfig.showProductConciergePhoneLine !== false}
                                onChange={(e) =>
                                  setSiteConfig({ ...siteConfig, showProductConciergePhoneLine: e.target.checked })
                                }
                                className="sr-only peer"
                              />
                              <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                            </label>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-[#9CA3AF] block mb-1 font-semibold">
                            Título do Atendimento:
                          </label>
                          <input
                            type="text"
                            value={siteConfig.productConciergeTitle ?? ''}
                            onChange={(e) =>
                              setSiteConfig({ ...siteConfig, productConciergeTitle: e.target.value })
                            }
                            placeholder="Ex: Atendimento VIP & Concierge"
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                          />
                        </div>

                        <div>
                          <label className="text-[#9CA3AF] block mb-1 font-semibold">
                            Texto do Botão:
                          </label>
                          <input
                            type="text"
                            value={siteConfig.productConciergeBtnText ?? ''}
                            onChange={(e) =>
                              setSiteConfig({ ...siteConfig, productConciergeBtnText: e.target.value })
                            }
                            placeholder="Ex: Falar Agora"
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                          />
                        </div>

                        <div className="sm:col-span-3">
                          <label className="text-[#9CA3AF] block mb-1 font-semibold">
                            Subtítulo / Descrição:
                          </label>
                          <input
                            type="text"
                            value={siteConfig.productConciergeSubtitle ?? ''}
                            onChange={(e) =>
                              setSiteConfig({ ...siteConfig, productConciergeSubtitle: e.target.value })
                            }
                            placeholder="Ex: Dúvidas sobre o produto ou agendamento de inspeção presencial."
                            className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Pré-visualização Fiel em Tempo Real (Fiel ao print do usuário) */}
                <div className="pt-3 border-t border-[#282E3A]">
                  <span className="text-[10px] text-[#9CA3AF] uppercase font-bold block mb-2">
                    Pré-visualização em Tempo Real na Página da Peça:
                  </span>

                  <div className="bg-[#08090B] border border-[#282E3A] rounded-lg p-5 space-y-4 max-w-xl">
                    {/* Preview Simulador de Frete */}
                    {siteConfig.showProductFreightSimulator !== false ? (
                      <div className="space-y-2">
                        <span className="text-xs font-['Space_Grotesk'] font-bold text-[#F4F1EA] uppercase flex items-center gap-1.5">
                          <span className="material-symbols-outlined text-sm text-[#10B981]">local_shipping</span>
                          {siteConfig.productFreightTitle || 'SIMULADOR DE FRETE E ENTREGA SEGURA'}
                        </span>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            readOnly
                            placeholder={siteConfig.productFreightPlaceholder || 'Digite seu CEP (ex: 01310-100)'}
                            value="94824180"
                            className="flex-1 bg-[#08090B] border border-[#282E3A] text-xs font-['Space_Grotesk'] text-[#F4F1EA] rounded px-3 py-2 cursor-default"
                          />
                          <button
                            type="button"
                            className="px-4 py-2 bg-[#1A1E26] border border-[#282E3A] text-xs font-['Space_Grotesk'] font-semibold text-[#F4F1EA] rounded"
                          >
                            {siteConfig.productFreightBtnText || 'Calcular'}
                          </button>
                        </div>
                        <p className="text-xs font-['Space_Grotesk'] text-[#10B981] bg-[#10B981]/10 p-2.5 rounded border border-[#10B981]/20">
                          {siteConfig.productFreightResultText ||
                            "Transporte Especializado: Grátis (Prazo estimado: 2 a 4 dias úteis com seguro total Lloyd's)"}
                        </p>
                      </div>
                    ) : (
                      <div className="p-2 border border-dashed border-[#282E3A] rounded text-[11px] text-[#9CA3AF] text-center">
                        Simulador de Frete: Ocultado na Loja
                      </div>
                    )}

                    {/* Preview Selos de Confiança */}
                    {siteConfig.showProductTrustBadges !== false ? (
                      <div className="grid grid-cols-2 gap-3 text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                        <div className="p-3 bg-[#08090B] rounded border border-[#282E3A] flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#f2ca50] text-lg">shield</span>
                          <div>
                            <strong className="text-[#F4F1EA] block text-[11px]">
                              {siteConfig.productTrustBadge1Title || 'Seguro Total'}
                            </strong>
                            <span className="text-[10px]">
                              {siteConfig.productTrustBadge1Subtitle || "Apólice Lloyd's"}
                            </span>
                          </div>
                        </div>

                        <div className="p-3 bg-[#08090B] rounded border border-[#282E3A] flex items-center gap-2">
                          <span className="material-symbols-outlined text-[#10B981] text-lg">policy</span>
                          <div>
                            <strong className="text-[#F4F1EA] block text-[11px]">
                              {siteConfig.productTrustBadge2Title || 'Garantia Vitalícia'}
                            </strong>
                            <span className="text-[10px]">
                              {siteConfig.productTrustBadge2Subtitle || 'Autenticidade Forense'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 border border-dashed border-[#282E3A] rounded text-[11px] text-[#9CA3AF] text-center">
                        Selos de Garantia: Ocultados na Loja
                      </div>
                    )}

                    {/* Preview Concierge VIP com botão WhatsApp */}
                    {siteConfig.showProductConcierge !== false ? (
                      <div className="p-4 bg-gradient-to-r from-[#1A1E26] to-[#12151B] border border-[#C59B27]/40 rounded-lg flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[#f2ca50]">support_agent</span>
                          <div>
                            <h5 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk']">
                              {siteConfig.productConciergeTitle || 'Atendimento VIP & Concierge'}
                            </h5>
                            <p className="text-[11px] text-[#9CA3AF]">
                              {siteConfig.productConciergeSubtitle ||
                                'Dúvidas sobre o produto ou agendamento de inspeção presencial.'}
                            </p>
                            {siteConfig.showProductConciergePhoneLine !== false && (
                              <span className="text-[10px] text-[#25D366] flex items-center gap-1 mt-0.5 font-['Space_Grotesk']">
                                <span className="material-symbols-outlined text-xs">phone</span>
                                {siteConfig.productConciergePhoneLabel || 'WhatsApp:'}{' '}
                                {siteConfig.productConciergePhone || siteConfig.contactPhone || '+55 (11) 99842-1970'}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="px-3.5 py-2 bg-[#08090B] border border-[#C59B27] text-xs font-['Space_Grotesk'] font-bold text-[#f2ca50] rounded shrink-0 flex items-center gap-1.5 shadow-sm">
                          <span>{siteConfig.productConciergeBtnText || 'Falar Agora'}</span>
                          <span className="material-symbols-outlined text-sm text-[#25D366]">chat</span>
                        </div>
                      </div>
                    ) : (
                      <div className="p-2 border border-dashed border-[#282E3A] rounded text-[11px] text-[#9CA3AF] text-center">
                        Atendimento VIP &amp; Concierge: Ocultado na Loja
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Botão de Salvar Rodapé */}
            <div className="p-4 bg-[#1A1E26] border border-[#282E3A] rounded-lg flex items-center justify-between">
              <span className="text-xs text-[#9CA3AF] font-['Manrope']">
                As configurações de painéis entram em vigor imediatamente após salvar.
              </span>
              <button
                type="submit"
                disabled={!isUserAdmin}
                className={`px-6 py-2.5 font-['Space_Grotesk'] font-bold text-xs uppercase rounded flex items-center gap-1.5 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed ${
                  saveConfigSuccess
                    ? 'bg-[#10B981] text-[#08090B]'
                    : 'bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B]'
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {saveConfigSuccess ? 'task_alt' : 'save'}
                </span>
                {saveConfigSuccess ? '✓ Alterações Salvas com Sucesso!' : 'Salvar Alterações dos Painéis'}
              </button>
            </div>
          </form>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: EDITOR VISUAL DE TEXTOS & ABAS (CMS TOTALMENTE EDITÁVEL) */}
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

            {/* SEÇÃO 3.1: Configurações do Carrossel das Peças em Destaque */}
            <div className="bg-[#12151B] border border-[#f2ca50]/50 rounded-lg p-5 space-y-5 shadow-[0_0_25px_rgba(242,202,80,0.08)]">
              <div className="border-b border-[#282E3A] pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f2ca50] text-xl">view_carousel</span>
                  <div>
                    <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                      Carrossel &amp; Transição das Peças em Destaque
                    </h3>
                    <p className="text-[11px] text-[#9CA3AF] font-['Manrope']">
                      Controle a alternância automática de fotos e o tempo de cada imagem nas peças em destaque.
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-1 bg-[#f2ca50]/20 text-[#f2ca50] border border-[#f2ca50]/40 rounded text-[10px] font-bold uppercase font-['Space_Grotesk'] self-start sm:self-center">
                  Controle Dinâmico
                </span>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {/* 1. Ativar / Desativar Carrossel Automático */}
                <div className="p-4 bg-[#08090B] border border-[#282E3A] rounded-lg space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <span className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] block">
                        Carrossel Automático no Destaque
                      </span>
                      <span className="text-[11px] text-[#9CA3AF] font-['Manrope'] block mt-0.5">
                        {siteConfig.featuredAutoPlay ?? true
                          ? 'As imagens cadastradas da peça em destaque passarão sozinhas continuamente.'
                          : 'Carrossel automático desligado. A troca de imagens ocorre apenas pelo clique do visitante.'}
                      </span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={siteConfig.featuredAutoPlay ?? true}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, featuredAutoPlay: e.target.checked })
                        }
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                    </label>
                  </div>

                  <div className="pt-2 border-t border-[#282E3A]/60 flex items-center justify-between text-[11px] font-['Space_Grotesk']">
                    <span className="text-[#9CA3AF]">Status da Rotação:</span>
                    <span
                      className={`font-bold px-2 py-0.5 rounded text-[10px] uppercase ${
                        siteConfig.featuredAutoPlay ?? true
                          ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                          : 'bg-[#282E3A] text-[#9CA3AF]'
                      }`}
                    >
                      {siteConfig.featuredAutoPlay ?? true ? 'Ativado (Girando)' : 'Pausado Manual'}
                    </span>
                  </div>
                </div>

                {/* 2. Controle de Tempo por Imagem */}
                <div className="p-4 bg-[#08090B] border border-[#282E3A] rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] block">
                        Tempo de Cada Imagem
                      </span>
                      <span className="text-[11px] text-[#9CA3AF] font-['Manrope']">
                        Duração de exibição antes de mudar para a próxima foto.
                      </span>
                    </div>

                    <div className="px-3 py-1 bg-[#12151B] border border-[#f2ca50] text-[#f2ca50] font-bold text-xs rounded font-['Space_Grotesk']">
                      {siteConfig.featuredIntervalSeconds || 4}s
                    </div>
                  </div>

                  <div className="space-y-1.5 pt-1">
                    <input
                      type="range"
                      min="2"
                      max="15"
                      step="1"
                      value={siteConfig.featuredIntervalSeconds || 4}
                      onChange={(e) =>
                        setSiteConfig({
                          ...siteConfig,
                          featuredIntervalSeconds: parseInt(e.target.value, 10) || 4,
                        })
                      }
                      className="w-full accent-[#f2ca50] cursor-pointer"
                    />
                    <div className="flex justify-between text-[10px] text-[#9CA3AF] font-['Space_Grotesk']">
                      <span>Mais Rápido (2s)</span>
                      <span>Recomendado (4s - 5s)</span>
                      <span>Mais Lento (15s)</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#282E3A]/60 flex items-center justify-between text-[11px] font-['Space_Grotesk']">
                    <span className="text-[#9CA3AF]">Ajuste Numérico Preciso:</span>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        min="2"
                        max="30"
                        value={siteConfig.featuredIntervalSeconds || 4}
                        onChange={(e) =>
                          setSiteConfig({
                            ...siteConfig,
                            featuredIntervalSeconds: Math.max(2, parseInt(e.target.value, 10) || 2),
                          })
                        }
                        className="w-16 bg-[#12151B] border border-[#282E3A] rounded px-2 py-0.5 text-center text-[#F4F1EA] font-bold text-xs focus:border-[#f2ca50] outline-none"
                      />
                      <span className="text-[#9CA3AF] text-xs">segundos</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Informação sobre Auto-Ajuste sem Cortes & Pausa com o Mouse */}
              <div className="p-3 bg-[#12151B]/80 border border-[#282E3A] rounded flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-['Space_Grotesk'] text-[#9CA3AF]">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#10B981] text-lg">check_circle</span>
                  <span>
                    <strong>Auto-Ajuste Ativo:</strong> As imagens na vitrine e nos destaques nunca sofrem cortes, exibindo 100% da peça com acabamento de luxo.
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-[11px] text-[#C59B27] shrink-0">
                  <span className="material-symbols-outlined text-sm">touch_app</span>
                  <span>Pausa automática ao passar o mouse</span>
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

            {/* SEÇÃO 4.1: Certificado de Autenticidade & Laudo Oficial */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
              <div className="border-b border-[#282E3A] pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f2ca50] text-lg">verified</span>
                  <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                    Certificado de Autenticidade &amp; Laudo Oficial (Página da Peça)
                  </h3>
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['Space_Grotesk'] ${
                    siteConfig.showProductCertificateBanner !== false
                      ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                      : 'bg-[#282E3A] text-[#9CA3AF]'
                  }`}
                >
                  {siteConfig.showProductCertificateBanner !== false ? '🟢 Ativo' : '⚪ Ocultado'}
                </span>
              </div>

              <div className="space-y-4 text-xs font-['Space_Grotesk']">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-[#9CA3AF] block mb-1 font-semibold">
                      Título do Certificado:
                    </label>
                    <input
                      type="text"
                      value={siteConfig.productCertificateTitle ?? ''}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, productCertificateTitle: e.target.value })
                      }
                      placeholder="Ex: Certificado de Autenticidade Vitalício #COA-9801"
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] block mb-1 font-semibold">
                      Texto do Botão de Download:
                    </label>
                    <input
                      type="text"
                      value={siteConfig.productCertificateBtnText ?? ''}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, productCertificateBtnText: e.target.value })
                      }
                      placeholder="Ex: Baixar Laudo Oficial (PDF)"
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="text-[#9CA3AF] block mb-1 font-semibold">
                      Subtítulo / Descrição do Laudo Pericial:
                    </label>
                    <textarea
                      rows={2}
                      value={siteConfig.productCertificateSubtitle ?? ''}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, productCertificateSubtitle: e.target.value })
                      }
                      placeholder="Ex: Laudo pericial com espectrometria molecular e correspondência fotográfica do jogo."
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* SEÇÃO 4.2: Simulador de Frete e Entrega Segura */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
              <div className="border-b border-[#282E3A] pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#10B981] text-lg">local_shipping</span>
                  <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                    4.2 Simulador de Frete e Entrega Segura (Página da Peça)
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['Space_Grotesk'] ${
                      siteConfig.showProductFreightSimulator !== false
                        ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                        : 'bg-[#282E3A] text-[#9CA3AF]'
                    }`}
                  >
                    {siteConfig.showProductFreightSimulator !== false ? '🟢 Ativo' : '⚪ Ocultado'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteConfig.showProductFreightSimulator !== false}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, showProductFreightSimulator: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                  </label>
                </div>
              </div>

              {siteConfig.showProductFreightSimulator !== false && (
                <div className="space-y-4 text-xs font-['Space_Grotesk']">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-2">
                      <label className="text-[#9CA3AF] block mb-1 font-semibold">
                        Título do Simulador de Frete:
                      </label>
                      <input
                        type="text"
                        value={siteConfig.productFreightTitle ?? ''}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, productFreightTitle: e.target.value })
                        }
                        placeholder="Ex: SIMULADOR DE FRETE E ENTREGA SEGURA"
                        className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>
                    <div>
                      <label className="text-[#9CA3AF] block mb-1 font-semibold">
                        Texto do Botão:
                      </label>
                      <input
                        type="text"
                        value={siteConfig.productFreightBtnText ?? ''}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, productFreightBtnText: e.target.value })
                        }
                        placeholder="Ex: Calcular"
                        className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[#9CA3AF] block mb-1 font-semibold">
                        Texto de Dica / Placeholder do Campo de CEP:
                      </label>
                      <input
                        type="text"
                        value={siteConfig.productFreightPlaceholder ?? ''}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, productFreightPlaceholder: e.target.value })
                        }
                        placeholder="Ex: Digite seu CEP (ex: 01310-100)"
                        className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>
                    <div>
                      <label className="text-[#9CA3AF] block mb-1 font-semibold">
                        Mensagem de Erro (CEP Inválido):
                      </label>
                      <input
                        type="text"
                        value={siteConfig.productFreightInvalidText ?? ''}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, productFreightInvalidText: e.target.value })
                        }
                        placeholder="Ex: Por favor, digite um CEP válido com 8 dígitos."
                        className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[#9CA3AF] block mb-1 font-semibold">
                      Texto do Resultado do Cálculo de Frete:
                    </label>
                    <input
                      type="text"
                      value={siteConfig.productFreightResultText ?? ''}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, productFreightResultText: e.target.value })
                      }
                      placeholder="Ex: Transporte Especializado: Grátis (Prazo estimado: 2 a 4 dias úteis com seguro total Lloyd's)"
                      className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* SEÇÃO 4.3: Selos de Confiança e Garantias */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
              <div className="border-b border-[#282E3A] pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f2ca50] text-lg">shield</span>
                  <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                    4.3 Selos de Confiança &amp; Garantias (Página da Peça)
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['Space_Grotesk'] ${
                      siteConfig.showProductTrustBadges !== false
                        ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                        : 'bg-[#282E3A] text-[#9CA3AF]'
                    }`}
                  >
                    {siteConfig.showProductTrustBadges !== false ? '🟢 Ativo' : '⚪ Ocultado'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteConfig.showProductTrustBadges !== false}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, showProductTrustBadges: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                  </label>
                </div>
              </div>

              {siteConfig.showProductTrustBadges !== false && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-['Space_Grotesk']">
                  <div className="space-y-2 p-3 bg-[#08090B] rounded border border-[#282E3A]">
                    <span className="text-[11px] text-[#f2ca50] font-bold block">Selo 1 (Seguro):</span>
                    <div>
                      <label className="text-[#9CA3AF] block mb-1 text-[11px]">Título:</label>
                      <input
                        type="text"
                        value={siteConfig.productTrustBadge1Title ?? ''}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, productTrustBadge1Title: e.target.value })
                        }
                        placeholder="Ex: Seguro Total"
                        className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>
                    <div>
                      <label className="text-[#9CA3AF] block mb-1 text-[11px]">Subtítulo:</label>
                      <input
                        type="text"
                        value={siteConfig.productTrustBadge1Subtitle ?? ''}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, productTrustBadge1Subtitle: e.target.value })
                        }
                        placeholder="Ex: Apólice Lloyd's"
                        className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>
                  </div>

                  <div className="space-y-2 p-3 bg-[#08090B] rounded border border-[#282E3A]">
                    <span className="text-[11px] text-[#10B981] font-bold block">Selo 2 (Garantia):</span>
                    <div>
                      <label className="text-[#9CA3AF] block mb-1 text-[11px]">Título:</label>
                      <input
                        type="text"
                        value={siteConfig.productTrustBadge2Title ?? ''}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, productTrustBadge2Title: e.target.value })
                        }
                        placeholder="Ex: Garantia Vitalícia"
                        className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>
                    <div>
                      <label className="text-[#9CA3AF] block mb-1 text-[11px]">Subtítulo:</label>
                      <input
                        type="text"
                        value={siteConfig.productTrustBadge2Subtitle ?? ''}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, productTrustBadge2Subtitle: e.target.value })
                        }
                        placeholder="Ex: Autenticidade Forense"
                        className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* SEÇÃO 4.4: Atendimento VIP & Concierge (Link Direto WhatsApp) */}
            <div className="bg-[#12151B] border border-[#282E3A] rounded-lg p-5 space-y-4">
              <div className="border-b border-[#282E3A] pb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#f2ca50] text-lg">support_agent</span>
                  <h3 className="text-xs font-bold text-[#F4F1EA] font-['Space_Grotesk'] uppercase tracking-wider">
                    4.4 Atendimento VIP &amp; Concierge WhatsApp (Página da Peça)
                  </h3>
                </div>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase font-['Space_Grotesk'] ${
                      siteConfig.showProductConcierge !== false
                        ? 'bg-[#10B981]/20 text-[#10B981] border border-[#10B981]/40'
                        : 'bg-[#282E3A] text-[#9CA3AF]'
                    }`}
                  >
                    {siteConfig.showProductConcierge !== false ? '🟢 Ativo' : '⚪ Ocultado'}
                  </span>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteConfig.showProductConcierge !== false}
                      onChange={(e) =>
                        setSiteConfig({ ...siteConfig, showProductConcierge: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                  </label>
                </div>
              </div>

              {siteConfig.showProductConcierge !== false && (
                <div className="space-y-4 text-xs font-['Space_Grotesk']">
                  <div className="p-3 bg-[#08090B] border border-[#C59B27]/40 rounded-lg space-y-3">
                    <div className="flex items-center gap-2 text-[#25D366]">
                      <span className="material-symbols-outlined text-lg">chat</span>
                      <span className="font-bold uppercase tracking-wider text-xs">
                        Configuração do WhatsApp para Atendimento:
                      </span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">
                          Celular / WhatsApp (com DDD):
                        </label>
                        <input
                          type="text"
                          value={siteConfig.productConciergePhone ?? ''}
                          onChange={(e) =>
                            setSiteConfig({ ...siteConfig, productConciergePhone: e.target.value })
                          }
                          placeholder="Ex: +55 (11) 99842-1970"
                          className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#25D366]"
                        />
                        <p className="text-[10px] text-[#9CA3AF] mt-1 font-['Manrope']">
                          O botão &quot;Falar Agora&quot; abre diretamente a conversa do WhatsApp neste celular.
                        </p>
                      </div>

                      <div>
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">
                          Mensagem Inicial Pré-definida:
                        </label>
                        <input
                          type="text"
                          value={siteConfig.productConciergeWhatsappMessage ?? ''}
                          onChange={(e) =>
                            setSiteConfig({ ...siteConfig, productConciergeWhatsappMessage: e.target.value })
                          }
                          placeholder="Ex: Olá! Gostaria de atendimento VIP sobre uma peça no acervo da Diamond Relics."
                          className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#25D366]"
                        />
                        <p className="text-[10px] text-[#9CA3AF] mt-1 font-['Manrope']">
                          Texto que aparecerá pronto para o cliente enviar.
                        </p>
                      </div>

                      <div>
                        <label className="text-[#9CA3AF] block mb-1 font-semibold">
                          Rótulo do WhatsApp no Card:
                        </label>
                        <input
                          type="text"
                          value={siteConfig.productConciergePhoneLabel ?? ''}
                          onChange={(e) =>
                            setSiteConfig({ ...siteConfig, productConciergePhoneLabel: e.target.value })
                          }
                          placeholder="Ex: WhatsApp:"
                          className="w-full bg-[#12151B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#25D366]"
                        />
                      </div>

                      <div className="flex items-center justify-between p-3 bg-[#12151B] rounded border border-[#282E3A]">
                        <div>
                          <span className="text-[#F4F1EA] font-semibold block text-xs">Exibir Linha do WhatsApp no Card</span>
                          <span className="text-[10px] text-[#9CA3AF]">Mostra o número logo abaixo da descrição</span>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={siteConfig.showProductConciergePhoneLine !== false}
                            onChange={(e) =>
                              setSiteConfig({ ...siteConfig, showProductConciergePhoneLine: e.target.checked })
                            }
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-[#282E3A] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#10B981]"></div>
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <label className="text-[#9CA3AF] block mb-1 font-semibold">
                        Título do Card:
                      </label>
                      <input
                        type="text"
                        value={siteConfig.productConciergeTitle ?? ''}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, productConciergeTitle: e.target.value })
                        }
                        placeholder="Ex: Atendimento VIP & Concierge"
                        className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>

                    <div>
                      <label className="text-[#9CA3AF] block mb-1 font-semibold">
                        Texto do Botão:
                      </label>
                      <input
                        type="text"
                        value={siteConfig.productConciergeBtnText ?? ''}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, productConciergeBtnText: e.target.value })
                        }
                        placeholder="Ex: Falar Agora"
                        className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>

                    <div className="sm:col-span-3">
                      <label className="text-[#9CA3AF] block mb-1 font-semibold">
                        Subtítulo / Descrição:
                      </label>
                      <input
                        type="text"
                        value={siteConfig.productConciergeSubtitle ?? ''}
                        onChange={(e) =>
                          setSiteConfig({ ...siteConfig, productConciergeSubtitle: e.target.value })
                        }
                        placeholder="Ex: Dúvidas sobre o produto ou agendamento de inspeção presencial."
                        className="w-full bg-[#08090B] border border-[#282E3A] rounded px-3 py-2 text-[#F4F1EA] focus:outline-none focus:border-[#f2ca50]"
                      />
                    </div>
                  </div>
                </div>
              )}
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

                <div>
                  <label className="text-[#9CA3AF] block mb-1 font-semibold">
                    Botão &quot;Limpar / Esvaziar Carrinho&quot;:
                  </label>
                  <input
                    type="text"
                    value={siteConfig.btnClearCart || ''}
                    onChange={(e) => setSiteConfig({ ...siteConfig, btnClearCart: e.target.value })}
                    placeholder="Esvaziar Carrinho"
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

            {/* Mensagem de Sucesso visível diretamente no Rodapé do formulário */}
            {saveConfigSuccess && (
              <div className="bg-[#10B981]/20 border border-[#10B981] p-4 rounded-lg flex items-center justify-between text-[#10B981] animate-fadeIn">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-xl">check_circle</span>
                  <span className="font-['Space_Grotesk'] text-sm font-bold">
                    ✓ Alterações salvas com sucesso! Todas as configurações foram atualizadas e já estão ativas no site.
                  </span>
                </div>
                <Link
                  href="/"
                  className="px-3 py-1 bg-[#10B981] text-[#08090B] font-bold text-xs rounded uppercase font-['Space_Grotesk']"
                >
                  Ver Home ao Vivo
                </Link>
              </div>
            )}

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
                className={`px-6 py-2.5 font-['Space_Grotesk'] font-bold text-xs uppercase rounded flex items-center gap-2 transition-all shadow-lg disabled:opacity-40 disabled:cursor-not-allowed ${
                  saveConfigSuccess
                    ? 'bg-[#10B981] text-[#08090B]'
                    : 'bg-[#f2ca50] hover:bg-[#E5C875] text-[#08090B]'
                }`}
              >
                <span className="material-symbols-outlined text-base">
                  {saveConfigSuccess ? 'task_alt' : 'check_circle'}
                </span>
                {saveConfigSuccess ? '✓ Alterações Salvas com Sucesso!' : 'Salvar Todas as Alterações do Site'}
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

      {/* Toast Flutuante de Confirmação de Salvamento */}
      {saveConfigSuccess && (
        <div className="fixed bottom-6 right-6 z-[999] bg-[#10B981] text-[#08090B] px-5 py-3.5 rounded-xl shadow-[0_10px_35px_rgba(16,185,129,0.45)] flex items-center gap-3 font-['Space_Grotesk'] font-bold text-xs border border-[#10B981]/60 animate-fadeIn">
          <span className="material-symbols-outlined text-2xl">task_alt</span>
          <div>
            <p className="leading-tight text-sm font-extrabold">Alterações Salvas com Sucesso!</p>
            <p className="text-[11px] font-medium opacity-90 font-['Manrope'] mt-0.5">
              Todas as configurações foram salvas e já estão ativas no site.
            </p>
          </div>
        </div>
      )}

      {/* Rodapé Oficial */}
      <Footer />
    </div>
  );
}
