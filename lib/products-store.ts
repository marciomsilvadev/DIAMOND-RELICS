'use client';

import { CATALOG_RELICS, RelicItem } from './relics-data';
import { getSupabase, isSupabaseConfigured, safeExecute } from './supabase';


export interface OrderItem {
  id: string;
  productTitle: string;
  productId: string;
  sku: string;
  buyerName: string;
  buyerDoc: string;
  buyerEmail: string;
  buyerPhone: string;
  city: string;
  state: string;
  date: string;
  totalBRL: number;
  paymentMethod: string;
  status: string;
  statusColor: string;
}

const PRODUCTS_KEY = 'diamond_relics_products_v1';
const ORDERS_KEY = 'diamond_relics_orders_v1';

// Conversão entre modelo da aplicação e tabela do Supabase
export function mapRelicToDb(p: RelicItem) {
  return {
    id: p.id,
    sku: p.sku,
    title: p.title,
    athlete: p.athlete,
    sport: p.sport,
    category: p.category,
    description: p.description,
    year: p.year,
    grade: p.grade,
    price_brl: p.priceBRL,
    valuation_brl: p.valuationBRL,
    installments: p.installments,
    status: p.status,
    status_label: p.statusLabel,
    stock_count: p.stockCount,
    custodian: p.custodian,
    custodian_facility: p.custodianFacility,
    insurance_policy: p.insurancePolicy,
    sha256_hash: p.sha256Hash,
    image_url: p.imageUrl,
    gallery: p.gallery || [],
    featured: Boolean(p.featured),
    alt_text: p.altText,
    verified_method: p.verifiedMethod,
    updated_at: new Date().toISOString(),
  };
}

export function mapDbToRelic(row: any): RelicItem {
  return {
    id: row.id,
    sku: row.sku || '',
    title: row.title || '',
    athlete: row.athlete || '',
    sport: row.sport || 'futebol',
    category: row.category || '',
    description: row.description || '',
    year: Number(row.year) || 1970,
    grade: row.grade || 'Grau COA 9.8 Museu',
    priceBRL: Number(row.price_brl) || 0,
    valuationBRL: Number(row.valuation_brl) || Number(row.price_brl) || 0,
    installments: row.installments || '',
    status: row.status || 'available',
    statusLabel: row.status_label || 'Peça Única • Disponível',
    stockCount: Number(row.stock_count) || 1,
    custodian: row.custodian || 'Cofre São Paulo',
    custodianFacility: row.custodian_facility || '',
    insurancePolicy: row.insurance_policy || '',
    sha256Hash: row.sha256_hash || '',
    imageUrl: row.image_url || '',
    gallery: Array.isArray(row.gallery) ? row.gallery : [],
    featured: Boolean(row.featured),
    altText: row.alt_text || row.title || '',
    verifiedMethod: row.verified_method || 'Laudo Pericial Forense',
  };
}

export function mapOrderToDb(o: OrderItem) {
  return {
    id: o.id,
    product_title: o.productTitle,
    product_id: o.productId,
    sku: o.sku,
    buyer_name: o.buyerName,
    buyer_doc: o.buyerDoc,
    buyer_email: o.buyerEmail,
    buyer_phone: o.buyerPhone,
    city: o.city,
    state: o.state,
    date: o.date,
    total_brl: o.totalBRL,
    payment_method: o.paymentMethod,
    status: o.status,
    status_color: o.statusColor,
  };
}

export function mapDbToOrder(row: any): OrderItem {
  return {
    id: row.id,
    productTitle: row.product_title || '',
    productId: row.product_id || '',
    sku: row.sku || '',
    buyerName: row.buyer_name || '',
    buyerDoc: row.buyer_doc || '',
    buyerEmail: row.buyer_email || '',
    buyerPhone: row.buyer_phone || '',
    city: row.city || '',
    state: row.state || '',
    date: row.date || '',
    totalBRL: Number(row.total_brl) || 0,
    paymentMethod: row.payment_method || '',
    status: row.status || 'Aguardando Pagamento',
    statusColor: row.status_color || 'amber',
  };
}

/**
 * Sincroniza produtos com a nuvem Supabase em segundo plano
 */
export async function syncProductsFromSupabase(): Promise<RelicItem[]> {
  const supabase = getSupabase();
  if (!supabase) return getStoredProducts();

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Aviso ao sincronizar com Supabase:', error.message);
      return getStoredProducts();
    }

    if (Array.isArray(data) && data.length > 0) {
      const relics = data.map(mapDbToRelic);
      if (typeof window !== 'undefined') {
        localStorage.setItem(PRODUCTS_KEY, JSON.stringify(relics));
        window.dispatchEvent(new Event('diamond_products_updated'));
      }
      return relics;
    } else if (Array.isArray(data) && data.length === 0) {
      // Se o banco estiver vazio, enviar os produtos locais existentes para lá
      const local = getStoredProducts();
      if (local.length > 0) {
        const rows = local.map(mapRelicToDb);
        await supabase.from('products').upsert(rows);
      }
    }
    return getStoredProducts();
  } catch (err) {
    console.error('Erro na sincronização Supabase:', err);
    return getStoredProducts();
  }
}

/**
 * Sincroniza pedidos com a nuvem Supabase em segundo plano
 */
export async function syncOrdersFromSupabase(): Promise<OrderItem[]> {
  const supabase = getSupabase();
  if (!supabase) return getStoredOrders();

  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Aviso ao sincronizar pedidos:', error.message);
      return getStoredOrders();
    }

    if (Array.isArray(data)) {
      const orders = data.map(mapDbToOrder);
      if (typeof window !== 'undefined') {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
        window.dispatchEvent(new Event('diamond_orders_updated'));
      }
      return orders;
    }
    return getStoredOrders();
  } catch (err) {
    console.error('Erro na sincronização de pedidos:', err);
    return getStoredOrders();
  }
}

// Inicia sincronização automática no carregamento em browsers
if (typeof window !== 'undefined') {
  setTimeout(() => {
    if (isSupabaseConfigured()) {
      syncProductsFromSupabase();
      syncOrdersFromSupabase();
    }
  }, 100);
}

export function getStoredProducts(): RelicItem[] {
  if (typeof window === 'undefined') return CATALOG_RELICS;
  try {
    const raw = localStorage.getItem(PRODUCTS_KEY);
    if (!raw) {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(CATALOG_RELICS));
      return CATALOG_RELICS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return CATALOG_RELICS;
    return parsed.map((p: any) => {
      const defaultItem = CATALOG_RELICS.find((c) => c.id === p.id);
      return {
        ...p,
        featured: p.featured !== undefined ? p.featured : (defaultItem?.featured ?? false),
      };
    });
  } catch (err) {
    console.error('Erro ao ler produtos:', err);
    return CATALOG_RELICS;
  }
}

export function saveStoredProducts(products: RelicItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(products));
    window.dispatchEvent(new Event('diamond_products_updated'));

    // Sincronizar em lote com Supabase caso esteja configurado
    const supabase = getSupabase();
    if (supabase) {
      const rows = products.map(mapRelicToDb);
      safeExecute(supabase.from('products').upsert(rows));
    }
  } catch (err) {
    console.error('Erro ao salvar produtos:', err);
  }
}

export function addStoredProduct(product: RelicItem): RelicItem[] {
  const current = getStoredProducts();
  const updated = [product, ...current];
  saveStoredProducts(updated);

  const supabase = getSupabase();
  if (supabase) {
    safeExecute(supabase.from('products').upsert(mapRelicToDb(product)));
  }

  return updated;
}

export function updateStoredProduct(updatedProduct: RelicItem): RelicItem[] {
  const current = getStoredProducts();
  const updated = current.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
  saveStoredProducts(updated);

  const supabase = getSupabase();
  if (supabase) {
    safeExecute(supabase.from('products').upsert(mapRelicToDb(updatedProduct)));
  }

  return updated;
}

export function removeStoredProduct(productId: string): RelicItem[] {
  const current = getStoredProducts();
  const updated = current.filter((p) => p.id !== productId);
  if (typeof window !== 'undefined') {
    localStorage.setItem(PRODUCTS_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event('diamond_products_updated'));
  }

  const supabase = getSupabase();
  if (supabase) {
    safeExecute(supabase.from('products').delete().eq('id', productId));
  }

  return updated;
}

export function resetStoredProducts(): RelicItem[] {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(PRODUCTS_KEY);
  }
  return getStoredProducts();
}

export function getStoredOrders(): OrderItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(ORDERS_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (err) {
    console.error('Erro ao ler pedidos:', err);
    return [];
  }
}

export function saveStoredOrders(orders: OrderItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    window.dispatchEvent(new Event('diamond_orders_updated'));
  } catch (err) {
    console.error('Erro ao salvar pedidos:', err);
  }
}

export function addStoredOrder(order: OrderItem): OrderItem[] {
  const current = getStoredOrders();
  const updated = [order, ...current];
  saveStoredOrders(updated);

  const supabase = getSupabase();
  if (supabase) {
    safeExecute(supabase.from('orders').upsert(mapOrderToDb(order)));
  }

  return updated;
}

export function clearStoredOrders(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ORDERS_KEY);
  window.dispatchEvent(new Event('diamond_orders_updated'));

  const supabase = getSupabase();
  if (supabase) {
    safeExecute(supabase.from('orders').delete().neq('id', ''));
  }
}

