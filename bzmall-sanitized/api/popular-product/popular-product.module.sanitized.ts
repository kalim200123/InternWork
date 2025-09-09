/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { PopularProductController } from "./popular-product.controller";
import { PopularProductRepository } from "./popular-product.repository";
import { PopularProductService } from "./popular-product.service";

@Module({
  imports: [ScheduleModule.forRoot()],
  controllers: [PopularProductController],
  providers: [PopularProductService, PopularProductRepository],
  exports: [PopularProductService],
})
export class PopularProductModule {}
