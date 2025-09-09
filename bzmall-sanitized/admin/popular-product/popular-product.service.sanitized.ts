/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { PopularProductListQueryDto } from "./dto/popular-product.request.dto";
import { PopularProductAdminItem, PopularProductAdminListResDto } from "./dto/popular-product.response.dto";
import type { PopularProductCacheRow } from "./popular-product.repository";
import { PopularProductRepository } from "./popular-product.repository";

@Injectable()
export class PopularProductService {
  private readonly logger = new Logger(PopularProductService.name);

  constructor(private readonly repo: PopularProductRepository) {}

  // 매일 00:00 (Asia/Seoul) 재계산, but 서버가 꺼져있으면 실행 안됨
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: "Asia/Seoul" })
  async rebuildDaily() {
    this.logger.log("Rebuilding popular products (daily cron)");
    const rows = await this.repo.aggregateLast30d();
    await this.repo.replacePopularCache(rows);
    this.logger.log(`Rebuilt ${rows.length} rows`);
  }

  // 수동 재계산
  async rebuildNow() {
    const rows = await this.repo.aggregateLast30d();
    await this.repo.replacePopularCache(rows);
  }

  // 목록 조회 (운영용 지표)
  async list(q: PopularProductListQueryDto): Promise<PopularProductAdminListResDto> {
    const page = Math.max(1, Number(q.page ?? 1));
    const limit = Math.max(1, Number(q.limit ?? 20));
    const { total, items } = await this.repo.listFromCache({ page, limit, q: q.q });

    const mapped: PopularProductAdminItem[] = (items as PopularProductCacheRow[]).map((it) => ({
      productId: it.product_id,
      rank: it.rank,
      name: it.name ?? null,
      salesCount30d: Number(it.sales_count ?? 0),
      viewCount30d: Number(it.view_count ?? 0),
      wishlistCount30d: Number(it.wishlist_count ?? 0),
      cartAddCount30d: Number(it.cart_add_count ?? 0),
      totalScore: Number(it.total_score ?? 0),
    }));

    return { items: mapped, page, limit, total };
  }
}
