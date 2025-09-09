/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { Injectable } from "@nestjs/common";
import { DrizzleClsService } from "redacted/drizzle";
import { and, asc, eq, gte, inArray, isNull, like, lte, or, sql, SQL } from "drizzle-orm";
import { ProductDisplayType, tnProductDisplay } from "libs/model/schemas/product-display.schema";
import { tnProduct } from "libs/model/schemas/product.schema";

type ListParams = {
  type: ProductDisplayType;
  page: number;
  limit: number;
  q?: string;
  isShow?: boolean;
};

function andAll(...conds: (SQL | undefined)[]): SQL | undefined {
  const xs: SQL[] = conds.filter((c): c is SQL => Boolean(c));
  if (xs.length === 0) return undefined;
  let res: SQL = xs[0];
  for (let i = 1; i < xs.length; i++) res = and(res, xs[i])!;
  return res;
}

@Injectable()
export class ProductDisplayRepository {
  constructor(private readonly drizzle: DrizzleClsService) {}

  private get db() {
    return this.drizzle.tx;
  }

  /** 관리자 목록 조회 */
  async findList({ type, page, limit, q, isShow }: ListParams) {
    const offset = (page - 1) * limit;

    const searchCond =
      q && q.trim() ? or(like(tnProduct.name, `%${q.trim()}%`), like(tnProduct.code, `%${q.trim()}%`)) : undefined;

    const showCond = typeof isShow === "boolean" ? eq(tnProductDisplay.isShow, isShow) : undefined;

    const where = andAll(eq(tnProductDisplay.type, type), showCond, searchCond);

    const items = await this.drizzle.tx
      .select({
        id: tnProductDisplay.id,
        productId: tnProductDisplay.productId,
        type: tnProductDisplay.type,
        sortOrder: tnProductDisplay.sortOrder,
        isShow: tnProductDisplay.isShow,
        startDate: tnProductDisplay.startDate,
        endDate: tnProductDisplay.endDate,
        name: tnProduct.name,
        thumbnailPath: tnProduct.thumbnailPath,
        price: tnProduct.salePrice,
        code: tnProduct.code,
      })
      .from(tnProductDisplay)
      .innerJoin(tnProduct, eq(tnProduct.id, tnProductDisplay.productId))
      .where(where)
      .orderBy(asc(tnProductDisplay.sortOrder), asc(tnProductDisplay.id))
      .limit(limit)
      .offset(offset);

    const [{ total }] = await this.drizzle.tx
      .select({ total: sql<number>`COUNT(*)` })
      .from(tnProductDisplay)
      .innerJoin(tnProduct, eq(tnProduct.id, tnProductDisplay.productId))
      .where(where);

    return { items, total };
  }

  /** type별 최대 sort_order */
  async getMaxSortOrder(type: ProductDisplayType): Promise<number> {
    const [{ max }] = await this.drizzle.tx
      .select({ max: sql<number>`COALESCE(MAX(${tnProductDisplay.sortOrder}), 0)` })
      .from(tnProductDisplay)
      .where(eq(tnProductDisplay.type, type));
    return max ?? 0;
  }

  /** (type, productId) 중복 체크 */
  async existsByTypeAndProductId(type: ProductDisplayType, productId: number): Promise<boolean> {
    const [dup] = await this.drizzle.tx
      .select({ id: tnProductDisplay.id })
      .from(tnProductDisplay)
      .where(and(eq(tnProductDisplay.type, type), eq(tnProductDisplay.productId, productId)))
      .limit(1);
    return !!dup;
  }

  /** 추가 */
  async insertOne(values: {
    productId: number;
    type: ProductDisplayType;
    sortOrder: number;
    isShow: boolean;
    startDate: string | null;
    endDate: string | null;
  }): Promise<number> {
    const res = await this.drizzle.tx.insert(tnProductDisplay).values(values).execute();
    return Number((res as any)?.insertId ?? 0);
  }

  /** 부분 수정 */
  async updateOne(
    id: number,
    values: Partial<{ isShow: boolean; startDate: string | null; endDate: string | null }>
  ): Promise<number> {
    await this.drizzle.tx
      .update(tnProductDisplay)
      .set(values as any)
      .where(eq(tnProductDisplay.id, id))
      .execute();
    return id;
  }

  // ⬇️ type 전체 id를 현재 순서대로 가져오기
  async findIdsByType(type: ProductDisplayType): Promise<number[]> {
    const rows = await this.drizzle.tx
      .select({ id: tnProductDisplay.id })
      .from(tnProductDisplay)
      .where(eq(tnProductDisplay.type, type))
      .orderBy(asc(tnProductDisplay.sortOrder), asc(tnProductDisplay.id));
    return rows.map((r) => r.id);
  }

  async updateSortOrdersAll(type: ProductDisplayType, rows: Array<{ id: number; sortOrder: number }>) {
    if (!rows?.length) return;

    const ids = rows.map((r) => r.id);
    const cases = sql.join(
      rows.map((r) => sql`WHEN ${tnProductDisplay.id} = ${r.id} THEN ${r.sortOrder}`),
      sql` `
    );

    await this.drizzle.tx.transaction(async (trx) => {
      // 1) 해당 type 전부를 크게 밀어 중간 중복 제거
      await trx
        .update(tnProductDisplay)
        .set({ sortOrder: sql`${tnProductDisplay.sortOrder} + 1000000` })
        .where(eq(tnProductDisplay.type, type))
        .execute();

      // 2) 최종 정렬값 한 방에
      await trx
        .update(tnProductDisplay)
        .set({ sortOrder: sql`CASE ${cases} ELSE ${tnProductDisplay.sortOrder} END` })
        .where(and(eq(tnProductDisplay.type, type), inArray(tnProductDisplay.id, ids)))
        .execute();
    });
  }

  /** 정렬 일괄 업데이트 (유니크 충돌 방지: 2단계 업데이트) */
  async updateSortOrders(type: ProductDisplayType, rows: Array<{ id: number; sortOrder: number }>) {
    if (!rows?.length) return;

    // 최종 매핑
    const ids = rows.map((r) => r.id);
    const finalById = new Map(rows.map((r) => [r.id, r.sortOrder]));

    await this.drizzle.tx.transaction(async (trx) => {
      // 1) 임시로 큰 값 오프셋(충돌 회피)
      await trx
        .update(tnProductDisplay)
        .set({ sortOrder: sql`${tnProductDisplay.sortOrder} + 1000000` })
        .where(and(eq(tnProductDisplay.type, type), inArray(tnProductDisplay.id, ids)))
        .execute();

      // 2) 최종 sort_order 일괄 SET (CASE WHEN)
      const cases = sql.join(
        ids.map((id) => sql`WHEN ${tnProductDisplay.id} = ${id} THEN ${finalById.get(id)!}`),
        sql` ` // 공백 구분
      );

      await trx
        .update(tnProductDisplay)
        .set({
          sortOrder: sql`CASE ${cases} ELSE ${tnProductDisplay.sortOrder} END`,
        })
        .where(and(eq(tnProductDisplay.type, type), inArray(tnProductDisplay.id, ids)))
        .execute();
    });
  }

  async findById(id: number) {
    const rows = await this.drizzle.tx.select().from(tnProductDisplay).where(eq(tnProductDisplay.id, id)).limit(1);
    return rows[0] ?? null;
  }

  /** 하드 삭제 */
  async deleteById(id: number) {
    await this.db.delete(tnProductDisplay).where(eq(tnProductDisplay.id, id));
  }

  /** 같은 type 내 정렬번호 1..N 정규화 (UNIQUE 보호 위해 2-phase) */
  async normalizeByType(type: ProductDisplayType) {
    await this.drizzle.tx
      .update(tnProductDisplay)
      .set({ sortOrder: sql`${tnProductDisplay.sortOrder} + 1000` })
      .where(eq(tnProductDisplay.type, type));

    const rows = await this.drizzle.tx
      .select({ id: tnProductDisplay.id })
      .from(tnProductDisplay)
      .where(eq(tnProductDisplay.type, type))
      .orderBy(asc(tnProductDisplay.sortOrder));

    let order = 1;
    for (const r of rows) {
      await this.drizzle.tx.update(tnProductDisplay).set({ sortOrder: order++ }).where(eq(tnProductDisplay.id, r.id));
    }
  }

  /** 사용자 추천 노출 목록 */
  async findPublicRecommended(type: ProductDisplayType, limit = 20) {
    // (start_date IS NULL OR start_date <= NOW()) AND (end_date IS NULL OR end_date >= NOW())
    const now = sql`NOW()`;
    const dateFilter = and(
      or(isNull(tnProductDisplay.startDate), lte(tnProductDisplay.startDate, now)),
      or(isNull(tnProductDisplay.endDate), gte(tnProductDisplay.endDate, now))
    );

    return this.drizzle.tx
      .select({
        id: tnProduct.id,
        name: tnProduct.name,
        price: tnProduct.salePrice,
        thumbnailPath: tnProduct.thumbnailPath,
        code: tnProduct.code,
      })
      .from(tnProductDisplay)
      .innerJoin(tnProduct, eq(tnProduct.id, tnProductDisplay.productId))
      .where(
        and(
          eq(tnProductDisplay.type, type),
          eq(tnProductDisplay.isShow, true),
          eq(tnProduct.isOnSale, true), // 🔹판매중 상품만
          dateFilter
        )
      )
      .orderBy(asc(tnProductDisplay.sortOrder), asc(tnProductDisplay.id))
      .limit(limit)
      .execute();
  }
}
