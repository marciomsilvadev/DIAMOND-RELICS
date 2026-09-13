'use client';

import { RELIC_IMAGES } from './relics-data';

export interface CartItem {
  id: string;
  productId: string;
  title: string;
  sku: string;
  price: number;
  imageUrl: string;
  details?: string;
  quantity: number;
}

const CART_STORAGE_KEY = 'diamond_cart_items';

export const DEFAULT_CART_ITEMS: CartItem[] = [
  {
    id: 'cart-item-1',
    productId: 'pel-1970',
    title: 'Camisa Oficial Pelé Final Copa 1970',
    sku: 'PROD-1970-MEX-10',
    price: 4850000,
    imageUrl: RELIC_IMAGES.pele1970Catalog,
    details: 'Qtd: 1 un. • Com Laudo Forense e Moldura Anti-UV',
    quantity: 1,
  },
];

export function getStoredCart(): CartItem[] {
  if (typeof window === 'undefined') return DEFAULT_CART_ITEMS;
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (raw === null) {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(DEFAULT_CART_ITEMS));
      return DEFAULT_CART_ITEMS;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Erro ao ler carrinho do localStorage:', err);
    return [];
  }
}

export function saveStoredCart(items: CartItem[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new Event('diamond_cart_updated'));
  } catch (err) {
    console.error('Erro ao salvar carrinho no localStorage:', err);
  }
}

export function addToCart(newItem: CartItem): void {
  const current = getStoredCart();
  const existingIdx = current.findIndex(
    (item) => item.productId === newItem.productId || item.id === newItem.id
  );
  if (existingIdx >= 0) {
    current[existingIdx].quantity += newItem.quantity || 1;
  } else {
    current.push(newItem);
  }
  saveStoredCart(current);
}

export function removeFromCart(itemId: string): void {
  const current = getStoredCart();
  const updated = current.filter((item) => item.id !== itemId && item.productId !== itemId);
  saveStoredCart(updated);
}

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify([]));
    window.dispatchEvent(new Event('diamond_cart_updated'));
  } catch (err) {
    console.error('Erro ao esvaziar carrinho:', err);
  }
}

export function restoreDefaultCart(): void {
  saveStoredCart(DEFAULT_CART_ITEMS);
}

export function getCartCount(): number {
  const items = getStoredCart();
  return items.reduce((total, item) => total + (item.quantity || 1), 0);
}

export function getCartTotal(): number {
  const items = getStoredCart();
  return items.reduce((total, item) => total + item.price * (item.quantity || 1), 0);
}
