/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { ApiProperty } from "@nestjs/swagger";

export class PopularProductItemDto {
  @ApiProperty({ example: 49 }) productId!: number;
  @ApiProperty({ example: 1 }) rank!: number;

  @ApiProperty({ example: "이마트" })
  name!: string | null;

  @ApiProperty({ example: "https://.../thumb.jpg" })
  thumbnail_path!: string | null;

  @ApiProperty({ example: 15000 })
  sale_price!: number | null;
}

export class PopularProductListResDto {
  @ApiProperty({ type: [PopularProductItemDto] })
  items!: PopularProductItemDto[];

  @ApiProperty({ example: 1 }) page!: number;
  @ApiProperty({ example: 20 }) limit!: number;
  @ApiProperty({ example: 137 }) total!: number;
}
