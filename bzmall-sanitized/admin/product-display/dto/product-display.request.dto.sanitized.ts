/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { ApiProperty } from "@nestjs/swagger";
import { Transform, Type } from "class-transformer";
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsInt,
  IsISO8601,
  IsOptional,
  IsString,
  ValidateIf,
  ValidateNested,
} from "class-validator";

export enum DisplayType {
  RECOMMEND = "RECOMMEND",
}

/** 목록 조회 쿼리 */
export class ListProductDisplaysRequest {
  @ApiProperty({ enum: DisplayType, required: false, default: DisplayType.RECOMMEND })
  @IsOptional()
  @IsEnum(DisplayType)
  type?: DisplayType = DisplayType.RECOMMEND;

  @ApiProperty({ required: false, description: "상품명/코드 검색" })
  @IsOptional()
  @IsString()
  q?: string;

  @ApiProperty({ required: false, default: 1 })
  @IsOptional()
  @IsInt()
  page?: number = 1;

  @ApiProperty({ required: false, default: 20 })
  @IsOptional()
  @IsInt()
  limit?: number = 20;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isShow?: boolean;
}

/** 추천 노출 추가 */
export class CreateProductDisplayRequest {
  @ApiProperty({ example: 123 })
  @IsInt()
  productId!: number;

  @ApiProperty({ enum: DisplayType, example: DisplayType.RECOMMEND })
  @IsEnum(DisplayType)
  type!: DisplayType;

  @ApiProperty({ required: false, default: true })
  @IsOptional()
  @IsBoolean()
  isShow?: boolean = true;

  @ApiProperty({ required: false, description: "ISO 날짜 문자열" })
  @IsOptional()
  @IsISO8601()
  startDate?: string;

  @ApiProperty({ required: false, description: "ISO 날짜 문자열" })
  @IsOptional()
  @IsISO8601()
  endDate?: string;

  @ApiProperty({ required: false, description: "없으면 맨 뒤로 배치" })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}

/** 정렬 순서 변경 */
export class ReorderItem {
  @ApiProperty({ example: 10 })
  @IsInt()
  id!: number;

  @ApiProperty({ example: 3 })
  @IsInt()
  sortOrder!: number;
}
export class ReorderProductDisplaysRequest {
  @ApiProperty({ enum: DisplayType, example: DisplayType.RECOMMEND })
  @IsEnum(DisplayType)
  type!: DisplayType;

  @ApiProperty({ type: [ReorderItem] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItem)
  items!: ReorderItem[];
}

/** 부분 수정 (노출/기간) */
export class UpdateProductDisplayRequest {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  isShow?: boolean;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? null : value))
  @ValidateIf((_, v) => v !== null)
  @IsISO8601()
  startDate?: string | null;

  @ApiProperty({ required: false, nullable: true })
  @IsOptional()
  @Transform(({ value }) => (value === "" ? null : value))
  @ValidateIf((_, v) => v !== null)
  @IsISO8601()
  endDate?: string | null;
}
