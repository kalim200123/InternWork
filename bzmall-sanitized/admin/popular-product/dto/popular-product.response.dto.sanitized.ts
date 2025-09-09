/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

// apps/admin/src/modules/popular-product/dto/popular-product.response.dto.ts
import { ApiProperty } from "@nestjs/swagger";

export class PopularProductAdminItem {
  @ApiProperty({ example: 123 }) productId!: number;
  @ApiProperty({ example: 1 }) rank!: number;
  @ApiProperty({ example: 1 }) name!: string | null;

  @ApiProperty({ example: 81399 }) salesCount30d!: number;
  @ApiProperty({ example: 38 }) viewCount30d!: number;
  @ApiProperty({ example: 7 }) wishlistCount30d!: number;
  @ApiProperty({ example: 12 }) cartAddCount30d!: number;

  @ApiProperty({ example: 325596 }) totalScore!: number;
}

export class PopularProductAdminListResDto {
  @ApiProperty({ type: [PopularProductAdminItem] })
  items!: PopularProductAdminItem[];

  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 20 }) limit!: number;
  @ApiProperty({ example: 234 }) total!: number;
}
