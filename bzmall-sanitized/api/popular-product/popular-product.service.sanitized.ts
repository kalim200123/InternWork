/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { Injectable } from "@nestjs/common";
import { PopularProductListQueryDto } from "./dto/popular-product.request.dto";
import { PopularProductItemDto, PopularProductListResDto } from "./dto/popular-product.response.dto";
import type { PopularProductCacheRow } from "./popular-product.repository";
import { PopularProductRepository } from "./popular-product.repository";

@Injectable()
export class PopularProductService {
  constructor(private readonly repo: PopularProductRepository) {}

  async list(q: PopularProductListQueryDto): Promise<PopularProductListResDto> {
    const page = Math.max(1, Number(q.page ?? 1));
    const limit = Math.max(1, Number(q.limit ?? 20));
    const { total, items } = await this.repo.listFromCache({ page, limit, q: q.q });

    const mapped: PopularProductItemDto[] = (items as PopularProductCacheRow[]).map((it) => ({
      productId: it.product_id,
      rank: it.rank,
      name: it.name ?? null,
      thumbnail_path: it.thumbnail_path ?? null,
      sale_price: it.sale_price ?? null,
    }));

    return { items: mapped, page, limit, total };
  }
}
