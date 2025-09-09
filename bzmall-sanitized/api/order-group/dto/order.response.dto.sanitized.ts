/**
 * Sanitized for portfolio use.
 * Focus: Group Order (multi-order) API.
 * - Non-group order logic bodies are redacted.
 * - Internal imports (@rsteam, @rs-team, @rstful) are masked.
 * - DB calls remain illustrative or are stubbed; not intended to run.
 */

import { TotalCountDto } from "@libs/common";
import {
  BrandEntity,
  CouponEntity,
  OrderEntity,
  OrderGroupEntity,
  ProductEntity,
  SendHistoryEntity,
} from "@libs/model";
import { ApiProperty, IntersectionType, PickType } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import { ValidateNested } from "class-validator";

class OrderResponseDto extends OrderEntity {
  @ApiProperty({ description: "상품" })
  @Type(() => ProductEntity)
  @ValidateNested()
  @Expose()
  product!: ProductEntity;

  @ApiProperty({ description: "브랜드" })
  @Type(() => BrandEntity)
  @ValidateNested()
  @Expose()
  brand!: BrandEntity;
}

export class ApiGetOrdersResponse extends TotalCountDto {
  @ApiProperty({ description: "주문" })
  @Type(() => OrderResponseDto)
  @ValidateNested({ each: true })
  @Expose()
  orders!: OrderResponseDto[];
}

class ApiGetOrderSendHistoryDto extends IntersectionType(
  SendHistoryEntity,
  PickType(CouponEntity, ["pin", "resendLimit"])
) {
  @ApiProperty({ description: "표시용 상태 (발급실패/발급대기중/발송실패/발송대기중/발송성공)" })
  @Expose()
  displayStatus!: string;

  @ApiProperty({ description: "표시용 실패 사유 (발송실패 시에만 존재)", required: false })
  @Expose()
  displayFailureReason?: string | null;
}

export class ApiGetOrderResponse extends OrderResponseDto {
  @ApiProperty({ description: "발송이력" })
  @Type(() => ApiGetOrderSendHistoryDto)
  @ValidateNested({ each: true })
  @Expose()
  sendHistories!: ApiGetOrderSendHistoryDto[];
}

export class ApiOrderResponse extends OrderEntity {
  @ApiProperty({ description: "상품" })
  @Type(() => ProductEntity)
  @ValidateNested()
  @Expose()
  product!: ProductEntity;

  @ApiProperty({ description: "브랜드" })
  @Type(() => BrandEntity)
  @ValidateNested()
  @Expose()
  brand!: BrandEntity;
}

export class ApiGroupOrderResponse {
  @ApiProperty({ description: "주문 그룹" })
  @Type(() => OrderGroupEntity)
  @Expose()
  group!: OrderGroupEntity;

  @ApiProperty({ description: "개별 주문들", type: [ApiOrderResponse] })
  @Type(() => ApiOrderResponse)
  @Expose()
  orders!: ApiOrderResponse[];
}
