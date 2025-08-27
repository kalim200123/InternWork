// src/utils/cart.ts

/** 장바구니에 저장될 아이템 타입 */
export type CartItem = {
  key: string; // 고유 키 (id/slug/code 또는 합성키)
  name: string;
  price: number;
  imageUrl?: string;
  quantity: number;
};

/** 장바구니에 담을 때 필요한 최소 제품 정보 */
export type ProductLike = {
  name: string;
  price: number;
  imageUrl?: string;
  /** 있으면 사용, 없어도 됨 */
  id?: string | number;
  slug?: string;
  code?: string;
};

const KEY = "cart";

/** 안전한 JSON 읽기 */
function read(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as CartItem[]) : [];
  } catch {
    return [];
  }
}

/** 저장 + 업데이트 이벤트 발생 */
function write(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  window.dispatchEvent(new Event("cart:updated"));
}

/** 제품에서 장바구니 키 만들기 (any 사용 X) */
function getKey(p: ProductLike): string {
  if (p.id !== undefined && p.id !== null) return String(p.id);
  if (p.slug) return p.slug;
  if (p.code) return p.code;
  // 마지막 수단: 합성키 (이 조합이 바뀌면 다른 상품으로 봄)
  return `${p.name}|${p.imageUrl ?? ""}|${p.price}`;
}

export function getCart(): CartItem[] {
  return read();
}

export function getCount(): number {
  return read().reduce((sum, it) => sum + it.quantity, 0);
}

export function addToCart(product: ProductLike, qty = 1) {
  const items = read();
  const key = getKey(product);
  const idx = items.findIndex((it) => it.key === key);

  if (idx >= 0) {
    items[idx].quantity += qty;
  } else {
    items.push({
      key,
      name: product.name,
      price: product.price,
      imageUrl: product.imageUrl,
      quantity: qty,
    });
  }
  write(items);
}

/** key는 문자열로 통일 */
export function updateQty(key: string, qty: number) {
  const safeQty = Math.max(1, qty);
  const items = read().map((it) => (it.key === key ? { ...it, quantity: safeQty } : it));
  write(items);
}

export function removeItem(key: string) {
  const items = read().filter((it) => it.key !== key);
  write(items);
}

export function clearCart() {
  write([]);
}
