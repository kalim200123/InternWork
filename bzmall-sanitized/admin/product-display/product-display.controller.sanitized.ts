/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { plainToInstance } from "class-transformer";
import {
  CreateProductDisplayRequest,
  DisplayType,
  ListProductDisplaysRequest,
  ReorderProductDisplaysRequest,
  UpdateProductDisplayRequest,
} from "./dto/product-display.request.dto";
import {
  AdminListProductDisplaysResponse,
  IdResponse,
  OkResponse,
  PublicRecommendedListResponse,
  PublicRecommendedProductItem,
} from "./dto/product-display.response.dto";
import { ProductDisplayService } from "./product-display.service";

@ApiTags("추천 상품 목록")
@ApiBearerAuth()
@Controller("admin/product-displays")
export class AdminProductDisplayController {
  constructor(private readonly svc: ProductDisplayService) {}

  @Get()
  @ApiOperation({ summary: "추천상품 목록(관리자)" })
  async list(@Query() q: ListProductDisplaysRequest): Promise<AdminListProductDisplaysResponse> {
    const { items, total, page, limit } = await this.svc.list(q);
    return { items: items as any, total, page, limit };
  }

  @Post()
  @ApiOperation({ summary: "추천상품 추가" })
  async create(@Body() dto: CreateProductDisplayRequest): Promise<IdResponse> {
    const id = await this.svc.create(dto);
    return plainToInstance(IdResponse, { id });
  }

  @Patch("reorder")
  @ApiOperation({ summary: "정렬 순서 변경" })
  async reorder(@Body() dto: ReorderProductDisplaysRequest) {
    return this.svc.reorder(dto.type, dto.items);
  }

  @Patch(":id")
  @ApiOperation({ summary: "노출/기간 수정" })
  async update(@Param("id") id: string, @Body() dto: UpdateProductDisplayRequest): Promise<IdResponse> {
    const updatedId = await this.svc.update(Number(id), dto);
    return plainToInstance(IdResponse, { id: updatedId });
  }

  @Delete(":id")
  @ApiOperation({ summary: "추천목록에서 삭제" })
  async remove(@Param("id") id: string): Promise<OkResponse> {
    const res = await this.svc.remove(Number(id));
    return plainToInstance(OkResponse, res);
  }
}

@ApiTags("추천 상품 노출")
@ApiBearerAuth()
@Controller("products")
export class PublicProductController {
  constructor(private readonly svc: ProductDisplayService) {}

  @Get("recommended")
  @ApiOperation({ summary: "메인 추천 노출(사용자)" })
  async listRecommended(@Query("limit") limit = "10"): Promise<PublicRecommendedListResponse> {
    const rows = await this.svc.publicListRecommended(DisplayType.RECOMMEND, Number(limit));
    return plainToInstance(PublicRecommendedListResponse, {
      items: rows.map((r) => plainToInstance(PublicRecommendedProductItem, r)),
    });
  }
}
