/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { Controller, Get, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiTags } from "@nestjs/swagger";
import { PopularProductListQueryDto } from "./dto/popular-product.request.dto";
import { PopularProductListResDto } from "./dto/popular-product.response.dto";
import { PopularProductService } from "./popular-product.service";

@ApiTags("인기 상품")
@ApiBearerAuth()
@Controller("popular-products")
export class PopularProductController {
  constructor(private readonly service: PopularProductService) {}

  @Get()
  @ApiOperation({ summary: "인기 상품 목록(사용자)" })
  @ApiOkResponse({ type: PopularProductListResDto })
  async list(@Query() dto: PopularProductListQueryDto): Promise<PopularProductListResDto> {
    return this.service.list(dto);
  }
}
