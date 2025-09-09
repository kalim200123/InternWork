/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { Injectable } from "@nestjs/common";
import { ProductDisplayType } from "libs/model/schemas/product-display.schema";
import { PublicProductDisplayRepository } from "./product-display.repository";

@Injectable()
export class PublicProductDisplayService {
  constructor(private readonly repo: PublicProductDisplayRepository) {}

  async findPublicRecommended(type: ProductDisplayType, limit: number) {
    return this.repo.findPublicRecommended(type, limit);
  }
}
