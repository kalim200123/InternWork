/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { Injectable } from "@nestjs/common";
import { DrizzleClsService } from "redacted/drizzle";
import { sql } from "drizzle-orm";

export type PopularProductCacheRow = {
  product_id: number;
  rank: number;
  name: string | null;
  thumbnail_path: string | null;
  sale_price: number | null;
};

// ===== 점수 상수 (요구사항) =====
const POINT_SALE = 4; // 판매 수량 1개당 4점
const POINT_VIEW = 1; // 조회(유저/일) 1건당 1점
const POINT_WISHLIST = 2; // 찜 ADD 1건당 2점
const POINT_CART = 3; // 장바구니 ADD 1건당 3점

type Metrics = {
  sales_count: number;
  sales_score: number;
  view_count: number;
  view_score: number;
  wishlist_count: number;
  wishlist_score: number;
  cart_add_count: number;
  cart_score: number;
  total_score: number;
};

function toRows<T>(ret: any): T[] {
  // mysql2: [rows, fields]
  if (Array.isArray(ret)) return (ret[0] ?? []) as T[];
  // pg/neon: { rows }
  if (ret && typeof ret === "object" && "rows" in ret) return (ret.rows ?? []) as T[];
  // fallback
  return (ret ?? []) as T[];
}

@Injectable()
export class PopularProductRepository {
  constructor(private readonly drizzle: DrizzleClsService) {}

  private get dbOrTx() {
    // DrizzleClsService 구현에 따라 .tx가 없을 수 있으니 안전하게 폴백
    const anyDrizzle = this.drizzle as any;
    return anyDrizzle.tx ?? anyDrizzle.db;
  }

  /**
   * 최근 30일 지표를 집계 → total_score 계산 → 동점이면 tn_product.created_at DESC로 정렬
   */
  async aggregateLast30d(now = new Date()) {
    const db = this.dbOrTx;

    // 1) 판매수량 (tn_order)
    const salesRet = await db.execute(sql`
  SELECT
    o.product_id,
    COALESCE(SUM(o.quantity), 0)                 AS sales_count,
    COALESCE(SUM(o.quantity), 0) * ${POINT_SALE} AS sales_score
  FROM tn_order o
  WHERE o.created_at >= (NOW() - INTERVAL 30 DAY)
  GROUP BY o.product_id
`);

    // 2) 조회수 (tn_product_view_log) — user_id, view_date 기준 1일 1회
    const views = await db.execute(sql`
      SELECT
        v.product_id,
        COUNT(DISTINCT v.user_id, v.view_date)              AS view_count,
        COUNT(DISTINCT v.user_id, v.view_date) * ${POINT_VIEW} AS view_score
      FROM tn_product_view_log v
      WHERE v.view_date >= (CURDATE() - INTERVAL 30 DAY)
      GROUP BY v.product_id
    `);

    // 3) 찜/장바구니 (tn_user_product_log) — action='ADD'만 집계
    const wishCart = await db.execute(sql`
      SELECT
        l.product_id,
        SUM(CASE WHEN l.type='WISHLIST' AND l.action='ADD' THEN 1 ELSE 0 END)                    AS wishlist_count,
        SUM(CASE WHEN l.type='WISHLIST' AND l.action='ADD' THEN ${POINT_WISHLIST} ELSE 0 END)    AS wishlist_score,
        SUM(CASE WHEN l.type='CART'     AND l.action='ADD' THEN 1 ELSE 0 END)                    AS cart_add_count,
        SUM(CASE WHEN l.type='CART'     AND l.action='ADD' THEN ${POINT_CART} ELSE 0 END)        AS cart_score
      FROM tn_user_product_log l
      WHERE l.created_at >= (NOW() - INTERVAL 30 DAY)
      GROUP BY l.product_id
    `);

    // 합치기
    const map = new Map<number, Metrics>();
    const ensure = (pid: number) => {
      if (!map.has(pid)) {
        map.set(pid, {
          sales_count: 0,
          sales_score: 0,
          view_count: 0,
          view_score: 0,
          wishlist_count: 0,
          wishlist_score: 0,
          cart_add_count: 0,
          cart_score: 0,
          total_score: 0,
        });
      }
      return map.get(pid)!;
    };

    for (const r of toRows<{
      product_id: number;
      sales_count: number;
      sales_score: number;
    }>(salesRet)) {
      const m = ensure(r.product_id);
      m.sales_count = Number(r.sales_count || 0);
      m.sales_score = Number(r.sales_score || 0);
      m.total_score += m.sales_score;
    }

    for (const r of toRows<{
      product_id: number;
      view_count: number;
      view_score: number;
    }>(views)) {
      const m = ensure(r.product_id);
      m.view_count = Number(r.view_count || 0);
      m.view_score = Number(r.view_score || 0);
      m.total_score += m.view_score;
    }

    for (const r of toRows<{
      product_id: number;
      wishlist_count: number;
      wishlist_score: number;
      cart_add_count: number;
      cart_score: number;
    }>(wishCart)) {
      const m = ensure(r.product_id);
      m.wishlist_count = Number(r.wishlist_count || 0);
      m.wishlist_score = Number(r.wishlist_score || 0);
      m.cart_add_count = Number(r.cart_add_count || 0);
      m.cart_score = Number(r.cart_score || 0);
      m.total_score += m.wishlist_score + m.cart_score;
    }

    const productIds = Array.from(map.keys());
    // tn_product.created_at (타이브레이커용) + 목록 표시용 컬럼
    const prodInfoRet = productIds.length
      ? await db.execute(sql`
          SELECT
            p.id AS product_id,
            p.created_at,
            p.name,
            p.sale_price,
            p.thumbnail_path
          FROM tn_product p
          WHERE p.id IN (${sql.join(productIds, sql`,`)})
        `)
      : [];

    const createdAtMap = new Map<number, number>();
    const nameMap = new Map<number, string | null>();
    const priceMap = new Map<number, number | null>();
    const imageMap = new Map<number, string | null>();

    for (const r of toRows<{
      product_id: number;
      created_at: Date | string | null;
      name: string | null;
      sale_price: number | null;
      thumbnail_path: string | null;
    }>(prodInfoRet)) {
      const ms = r.created_at ? new Date(r.created_at as any).getTime() : 0;
      createdAtMap.set(r.product_id, ms);
      nameMap.set(r.product_id, r.name ?? null);
      priceMap.set(r.product_id, r.sale_price ?? null);
      imageMap.set(r.product_id, r.thumbnail_path ?? null);
    }

    // rows 생성 + 정렬
    const rows = productIds.map((pid) => {
      const m = map.get(pid)!;
      return {
        productId: pid,
        rank: 0,
        salesCount30d: m.sales_count,
        viewCount30d: m.view_count,
        wishlistCount30d: m.wishlist_count,
        cartAddCount30d: m.cart_add_count,
        total_score: m.total_score,
        _createdAtMs: createdAtMap.get(pid) ?? 0,
        _name: nameMap.get(pid) ?? null,
        _price: priceMap.get(pid) ?? null,
        _image: imageMap.get(pid) ?? null,
      };
    });

    rows.sort((a, b) => b.total_score - a.total_score || b._createdAtMs - a._createdAtMs || a.productId - b.productId);
    rows.forEach((r, i) => (r.rank = i + 1));

    return rows;
  }

  // popular-product.repository.ts
  async withLock<T>(fn: () => Promise<T>): Promise<T> {
    const db = this.drizzle.tx;

    // 1) 락 획득 시도 (1초)
    const gotRes = await db.execute<{ got: number }>(sql`
    SELECT GET_LOCK('popular_rebuild', 1) AS got
  `);
    const got = (Array.isArray(gotRes) ? gotRes[0] : (gotRes as any).rows)?.[0]?.got ?? 0;
    if (Number(got) !== 1) {
      throw new Error("Failed to acquire lock: popular_rebuild");
    }

    try {
      return await fn();
    } finally {
      // 2) 락 해제 (SELECT 사용이 가장 호환 좋음)
      await db.execute(sql`SELECT RELEASE_LOCK('popular_rebuild')`);
    }
  }

  /**
   * 캐시 테이블 갈아끼우기 (tn_popular_product)
   * 컬럼: id, product_id, rank, sales_count, view_count, wishlist_count, cart_add_count, total_score, calculated_at
   */
  async replacePopularCache(
    rows: Array<{
      productId: number;
      rank: number;
      salesCount30d: number;
      viewCount30d: number;
      wishlistCount30d: number;
      cartAddCount30d: number;
      total_score: number;
    }>
  ) {
    const db = this.drizzle.tx;
    await db.transaction(async (tx) => {
      await tx.execute(sql`DELETE FROM tn_popular_product`);
      if (rows.length === 0) return;

      const vals = rows.map(
        (r) =>
          sql`(${r.productId}, ${r.rank}, ${r.salesCount30d}, ${r.viewCount30d}, ${r.wishlistCount30d}, ${r.cartAddCount30d}, ${r.total_score}, NOW())`
      );
      //rank 백틱으로 감싸기
      await tx.execute(sql`
        INSERT INTO tn_popular_product
          (product_id, \`rank\`, sales_count, view_count, wishlist_count, cart_add_count, total_score, calculated_at)
        VALUES ${sql.join(vals, sql`, `)}
      `);
    });
  }

  /**
   * 캐시에서 목록 조회 (상품 정보 조인)
   */
  async listFromCache(params: {
    page: number;
    limit: number;
    q?: string;
  }): Promise<{ total: number; items: PopularProductCacheRow[] }> {
    const { page, limit, q } = params;
    const db = this.drizzle.tx;
    const offset = (page - 1) * limit;

    const totalRes = await db.execute<{ total: number }>(sql`
    SELECT COUNT(*) AS total
    FROM tn_popular_product pp
    JOIN tn_product p ON p.id = pp.product_id
    ${q ? sql`WHERE p.name LIKE ${"%" + q + "%"}` : sql``}
  `);
    const totalRows = toRows<{ total: number }>(totalRes);
    const total = Number(totalRows[0]?.total ?? 0);

    const itemsRet = await db.execute<PopularProductCacheRow>(sql`
    SELECT
      pp.product_id, pp.\`rank\`,
      p.name,
      p.thumbnail_path,
      p.sale_price,
      pp.sales_count, pp.view_count, pp.wishlist_count, pp.cart_add_count,
      pp.total_score
    FROM tn_popular_product pp
    JOIN tn_product p ON p.id = pp.product_id
    ${q ? sql`WHERE COALESCE(p.name, '') LIKE ${"%" + q + "%"}` : sql``}
    ORDER BY pp.\`rank\` ASC
    LIMIT ${limit} OFFSET ${offset}
    `);

    const items = toRows<PopularProductCacheRow>(itemsRet);
    return { total, items };
  }
}
