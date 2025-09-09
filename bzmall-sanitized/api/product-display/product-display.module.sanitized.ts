/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { Module } from "@nestjs/common";
import { PublicProductController } from "./product-display.controller";
import { PublicProductDisplayRepository } from "./product-display.repository";
import { PublicProductDisplayService } from "./product-display.service";

@Module({
  controllers: [PublicProductController],
  providers: [PublicProductDisplayService, PublicProductDisplayRepository],
})
export class PublicProductDisplayModule {}
