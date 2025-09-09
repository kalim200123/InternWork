/**
 * Sanitized for portfolio use.
 * Focus: Group Order (multi-order) API.
 * - Non-group order logic bodies are redacted.
 * - Internal imports (@rsteam, @rs-team, @rstful) are masked.
 * - DB calls remain illustrative or are stubbed; not intended to run.
 */

import { ORDER_ERROR, isDuplicateError } from "@libs/common";
import { tnOrderGroup } from "@libs/model";
import { BadRequestException, Injectable, NotFoundException } from "@nestjs/common";
import { DrizzleClsService } from "redacted/drizzle";
import { eq } from "drizzle-orm";

@Injectable()
export class OrderGroupRepository {
  constructor(private readonly db: DrizzleClsService) {}

  /** 그룹 생성: insert → tid로 재조회하여 id 반환 (insertId 의존 X) */
  async createByTid(userId: number, tid: string, totalAmount: number) {
    await this.db.tx
      .insert(tnOrderGroup)
      .values({ userId, tid, totalAmount })
      .catch((err) => {
        if (isDuplicateError(err)) {
          throw new BadRequestException(ORDER_ERROR.TID_DUPLICATE);
        }
        throw err;
      });

    const [row] = await this.db.tx.select().from(tnOrderGroup).where(eq(tnOrderGroup.tid, tid)).limit(1);

    if (!row) throw new NotFoundException("주문 그룹 생성에 실패했습니다.");
    return Number(row.id);
  }

  /** tid로 그룹 조회 (없으면 404) */
  async findByTidOrThrow(tid: string) {
    const rows = await this.db.tx.select().from(tnOrderGroup).where(eq(tnOrderGroup.tid, tid)).limit(1);

    const group = rows[0];
    if (!group) throw new NotFoundException("주문 그룹이 존재하지 않습니다.");
    return group;
  }

  /** (옵션) 총액 갱신 */
  async updateTotalAmountByTid(tid: string, totalAmount: number) {
    await this.db.tx.update(tnOrderGroup).set({ totalAmount }).where(eq(tnOrderGroup.tid, tid));
  }
}
