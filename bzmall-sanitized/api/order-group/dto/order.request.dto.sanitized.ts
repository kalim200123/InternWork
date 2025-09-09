/**
 * Sanitized for portfolio use.
 * Focus: Group Order (multi-order) API.
 * - Non-group order logic bodies are redacted.
 * - Internal imports (@rsteam, @rs-team, @rstful) are masked.
 * - DB calls remain illustrative or are stubbed; not intended to run.
 */

import { DateSearchDto, PaginationDto } from "@libs/common";
import { OrderEntity } from "@libs/model";
import { ApiProperty, ApiPropertyOptional, IntersectionType, PickType } from "@nestjs/swagger";
import { Expose, Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsInt,
  IsNotEmpty,
  IsPhoneNumber,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";

export class ApiGetOrdersDto extends IntersectionType(PaginationDto, DateSearchDto) {
  @ApiPropertyOptional({
    description: "검색날짜 타입 (default: createdAt)",
    enum: ["createdAt"],
  })
  dateType = "createdAt";
}

export class OrderDto extends PickType(OrderEntity, ["tid", "productId", "title", "message"]) {
  @ApiProperty({ description: "수신번호" })
  @IsArray()
  @IsPhoneNumber("KR", { each: true })
  @MaxLength(11, { each: true })
  @Expose()
  receivers!: string[];
}

export class ApiGroupOrderItemDto {
  @ApiProperty({ description: "상품 ID" })
  @IsInt()
  @Min(1)
  @Type(() => Number)
  @Expose()
  productId!: number;

  @ApiProperty({ description: "제목", maxLength: 100 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  @Expose()
  title!: string;

  @ApiProperty({ description: "메시지", maxLength: 500 })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  @Expose()
  message!: string;

  @ApiProperty({ description: "수신번호 목록", type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(10000)
  @Expose()
  receivers!: string[];
}

// 그룹 주문 요청
export class ApiGroupOrderDto {
  @ApiProperty({ description: "주문 그룹 TID", example: "GROUP_20250904_0001" })
  @MaxLength(50)
  @Expose()
  tid!: string;

  @ApiProperty({ description: "주문 항목들(최대 5개)", type: [ApiGroupOrderItemDto] })
  @ValidateNested({ each: true })
  @Type(() => ApiGroupOrderItemDto)
  @ArrayMinSize(1)
  @ArrayMaxSize(5)
  @Expose()
  items!: ApiGroupOrderItemDto[];
}
