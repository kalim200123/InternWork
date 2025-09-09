/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { Controller, Get, Query, UsePipes, ValidationPipe } from "@nestjs/common";
import { ApiBearerAuth, ApiOkResponse, ApiOperation, ApiQuery, ApiTags } from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import { ProductDisplayType } from "libs/model";
import { ListProductDisplaysRequest } from "./dto/product-display.request.dto";
import { PublicRecommendedListResponse } from "./dto/product-display.response.dto";
import { PublicProductDisplayService } from "./product-display.service";

@ApiTags("추천 상품")
@ApiBearerAuth()
@Controller("products")
export class PublicProductController {
  constructor(private readonly service: PublicProductDisplayService) {}

  @Get("recommended")
  @ApiOperation({ summary: "메인 추천 노출(사용자)" })
  @ApiQuery({ name: "type", enum: ProductDisplayType, required: true, example: ProductDisplayType.RECOMMEND })
  @ApiQuery({ name: "limit", required: false, schema: { type: "number", default: 10, minimum: 1, maximum: 50 } })
  @ApiOkResponse({ type: PublicRecommendedListResponse })
  @UsePipes(new ValidationPipe({ transform: true, transformOptions: { enableImplicitConversion: true } }))
  async listRecommended(@Query() q: ListProductDisplaysRequest): Promise<PublicRecommendedListResponse> {
    const limit = q.limit ?? 10;
    const items = await this.service.findPublicRecommended(q.type, limit);

    return plainToInstance(PublicRecommendedListResponse, { items });
  }
}
