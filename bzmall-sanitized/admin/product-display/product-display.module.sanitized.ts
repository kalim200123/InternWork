/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { Module } from "@nestjs/common";
import { AdminProductDisplayController, PublicProductController } from "./product-display.controller";
import { ProductDisplayRepository } from "./product-display.repository";
import { ProductDisplayService } from "./product-display.service";

@Module({
  controllers: [AdminProductDisplayController, PublicProductController],
  providers: [ProductDisplayService, ProductDisplayRepository],
  exports: [ProductDisplayService],
})
export class ProductDisplayModule {}
