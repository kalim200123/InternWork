/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { ApiProperty } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { DisplayType } from "./product-display.request.dto";

export class AdminProductDisplayItemResponse {
  @ApiProperty() id!: number;
  @ApiProperty() productId!: number;
  @ApiProperty({ enum: DisplayType }) type!: DisplayType;
  @ApiProperty() sortOrder!: number;
  @ApiProperty() isShow!: boolean;
  @ApiProperty({ nullable: true }) startDate!: string | null;
  @ApiProperty({ nullable: true }) endDate!: string | null;

  // 조인 상품 정보(관리자가 보기 좋게)
  @ApiProperty() name!: string;
  @ApiProperty({ nullable: true }) thumbnailPath!: string | null;
  @ApiProperty() price!: number;
  @ApiProperty({ required: false }) code?: string;
}

export class AdminListProductDisplaysResponse {
  @ApiProperty({ type: [AdminProductDisplayItemResponse] })
  items!: AdminProductDisplayItemResponse[];

  @ApiProperty() total!: number;
  @ApiProperty() page!: number;
  @ApiProperty() limit!: number;
}

export class IdResponse {
  @ApiProperty() id!: number;
}

export class OkResponse {
  @ApiProperty({ example: true }) ok!: true;
}

/** 사용자 홈 탭에서 쓰는 간단 응답 */
export class PublicRecommendedProductItem {
  @ApiProperty() @Expose() id!: number;
  @ApiProperty() @Expose() name!: string;
  @ApiProperty() @Expose() price!: number;
  @ApiProperty() @Expose() thumbnailPath!: string; // 필드명은 레포에서 select한 alias와 일치해야 함
  @ApiProperty() @Expose() code!: string;
}

export class PublicRecommendedListResponse {
  @ApiProperty({ type: PublicRecommendedProductItem, isArray: true })
  @Expose()
  @Type(() => PublicRecommendedProductItem)
  items!: PublicRecommendedProductItem[];
}
