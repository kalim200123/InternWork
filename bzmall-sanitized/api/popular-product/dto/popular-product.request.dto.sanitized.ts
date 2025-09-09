/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class PopularProductListQueryDto {
  @ApiPropertyOptional({ example: 1, default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;

  @ApiPropertyOptional({ description: "상품명 검색" })
  @IsOptional()
  @IsString()
  q?: string;
}
