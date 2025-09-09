/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { Injectable } from "@nestjs/common";
import { DrizzleClsService } from "redacted/drizzle";
import { and, asc, eq, gte, isNull, lte, or, sql } from "drizzle-orm";
import { ProductDisplayType, tnProductDisplay } from "libs/model/schemas/product-display.schema";
import { tnProduct } from "libs/model/schemas/product.schema";

@Injectable()
export class PublicProductDisplayRepository {
  constructor(private readonly drizzle: DrizzleClsService) {}

  private get db() {
    return this.drizzle.tx;
  }

  /** 사용자 추천 노출 목록 */
  async findPublicRecommended(type: ProductDisplayType, limit = 20) {
    const now = sql`NOW()`;
    const dateFilter = and(
      or(isNull(tnProductDisplay.startDate), lte(tnProductDisplay.startDate, now)),
      or(isNull(tnProductDisplay.endDate), gte(tnProductDisplay.endDate, now))
    );

    return this.db
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
          eq(tnProduct.isOnSale, true),
          dateFilter
        )
      )
      .orderBy(asc(tnProductDisplay.sortOrder), asc(tnProductDisplay.id))
      .limit(limit)
      .execute();
  }
}
