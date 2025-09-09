/**
 * Sanitized for portfolio use.
 * Focus: Group Order (multi-order) API.
 * - Non-group order logic bodies are redacted.
 * - Internal imports (@rsteam, @rs-team, @rstful) are masked.
 * - DB calls remain illustrative or are stubbed; not intended to run.
 */

import { ORDER_ERROR, isDuplicateError } from "@libs/common";
import { tnBrand, tnOrder, tnProduct } from "@libs/model";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DrizzleClsService, DrizzleFilterBuilder, withPagination } from "redacted/drizzle";
import { count, desc, eq, getTableColumns, sql } from "drizzle-orm";
import { ApiGetOrdersDto } from "./dto/order.request.dto";

@Injectable()
export class OrderRepository {
  constructor(private readonly db: DrizzleClsService) {
  /* redacted for portfolio */
}

  async findManyWithCount(dto: ApiGetOrdersDto, userId: number) {
  /* redacted for portfolio */
}
  /** 그룹 TID 접두로 생성된 단건 주문들을 한 번에 그룹에 연결 */
  async attachOrdersToGroupByTidPrefix(tid: string, groupId: number) {
    // tid_1, tid_2 ... 모두 잡히도록 LIKE + 언더스코어 이스케이프
    await this.db.tx.execute(sql`
    UPDATE tn_order
    SET order_group_id = ${groupId}
    WHERE tid LIKE CONCAT(${tid}, '\\_%')
  `);
  }

  /** th_credit 메모를 "다건 주문 결제 (n개)"로 일괄 갱신 (USE만) */
  async updateCreditMemoForGroupTidPrefix(userId: number, tid: string, itemCount: number) {
    const memo = `다건 주문 결제 (${itemCount}개)`;
    await this.db.tx.execute(sql`
    UPDATE th_credit c
    JOIN tn_order o ON o.id = c.order_id
    SET c.memo = ${memo}
    WHERE c.user_id = ${userId}
      AND c.type = 'USE'
      AND o.tid LIKE CONCAT(${tid}, '\\_%')
  `);
  }

  async findOne(params: SearchOrderParams) {
  /* redacted for portfolio */
}

  async findOneOrThrow(params: SearchOrderParams) {
  /* redacted for portfolio */
}

  async save(payload: typeof tnOrder.$inferInsert) {
  /* redacted for portfolio */
}
}
type SearchOrderParams = {
  id?: number;
  oid?: string;
};
