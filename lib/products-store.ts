'use client';

import { CATALOG_RELICS, RelicItem } from './relics-data';

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
  } catch (err) {
    console.error('Erro ao salvar produtos:', err);
  }
}

export function addStoredProduct(product: RelicItem): RelicItem[] {
  const current = getStoredProducts();
  const updated = [product, ...current];
  saveStoredProducts(updated);
  return updated;
}

export function updateStoredProduct(updatedProduct: RelicItem): RelicItem[] {
  const current = getStoredProducts();
  const updated = current.map((p) => (p.id === updatedProduct.id ? updatedProduct : p));
  saveStoredProducts(updated);
  return updated;
}

export function removeStoredProduct(productId: string): RelicItem[] {
  const current = getStoredProducts();
  const updated = current.filter((p) => p.id !== productId);
  saveStoredProducts(updated);
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
    if (!raw) {
      // Começa vazio: SEM VENDAS FICTÍCIAS
      return [];
    }
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
  return updated;
}

export function clearStoredOrders(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ORDERS_KEY);
  window.dispatchEvent(new Event('diamond_orders_updated'));
}
