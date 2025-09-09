/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { Controller, Get, HttpCode, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PopularProductListQueryDto } from "./dto/popular-product.request.dto";
import { PopularProductAdminItem, PopularProductAdminListResDto } from "./dto/popular-product.response.dto";
import { PopularProductService } from "./popular-product.service";

@ApiTags("인기 상품")
@ApiBearerAuth()
@Controller("popular-products")
export class PopularProductController {
  constructor(private readonly service: PopularProductService) {}

  @Get()
  @ApiOperation({ summary: "인기 상품 목록(관리자)" })
  @ApiOkResponse({ type: PopularProductAdminItem })
  async list(@Query() dto: PopularProductListQueryDto): Promise<PopularProductAdminListResDto> {
    return this.service.list(dto);
  }

  @Post("rebuild")
  @HttpCode(200)
  @ApiOperation({ summary: "인기 상품 재계산(수동)" })
  async rebuild(): Promise<{ ok: true }> {
    await this.service.rebuildNow();
    return { ok: true };
  }
}
