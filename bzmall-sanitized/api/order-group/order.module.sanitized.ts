/**
 * Sanitized for portfolio use.
 * Focus: Group Order (multi-order) API.
 * - Non-group order logic bodies are redacted.
 * - Internal imports (@rsteam, @rs-team, @rstful) are masked.
 * - DB calls remain illustrative or are stubbed; not intended to run.
 */

import { RandomizerModule } from "@libs/randomizer";
import { Module } from "@nestjs/common";
import { CreditHistoryModule } from "apps/admin/src/modules/credit/history/credit-history.module";
import { CouponModule } from "../coupon/coupon.module";
import { InvoiceModule } from "../invoice/invoice.module";
import { ProductModule } from "../product/product.module";
import { SendHistoryModule } from "../send/history/send-history.module";
import { UserModule } from "../user/user.module";
import { OrderGroupRepository } from "./order-group.repository";
import { OrderController } from "./order.controller";
import { OrderRepository } from "./order.repository";
import { OrderService } from "./order.service";

@Module({
  imports: [
    RandomizerModule,
    ProductModule,
    UserModule,
    CouponModule,
    SendHistoryModule,
    InvoiceModule,
    CreditHistoryModule,
  ],
  controllers: [OrderController],
  providers: [OrderService, OrderRepository, OrderGroupRepository],
  exports: [OrderRepository, OrderGroupRepository],
})
export class OrderModule {}
