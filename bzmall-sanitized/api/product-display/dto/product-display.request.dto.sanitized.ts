/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsEnum, IsInt, IsOptional } from "class-validator";
import { ProductDisplayType } from "libs/model";

export enum DisplayType {
  RECOMMEND = "RECOMMEND",
}

export class ListProductDisplaysRequest {
  @ApiProperty({ enum: ProductDisplayType, required: true, example: ProductDisplayType.RECOMMEND })
  @IsEnum(ProductDisplayType)
  type!: ProductDisplayType;

  @ApiProperty({ required: false, default: 10, description: "조회할 개수" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  limit?: number = 10;
}
