/**
 * Sanitized for portfolio use.
 * - Internal import paths (@rsteam, @rs-team, @rstful) have been masked.
 * - No functional changes beyond import specifier masking.
 */

import { BadRequestException, ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { ProductDisplayType } from "libs/model/schemas/product-display.schema";
import {
  CreateProductDisplayRequest,
  DisplayType,
  ListProductDisplaysRequest,
  ReorderProductDisplaysRequest,
  UpdateProductDisplayRequest,
} from "./dto/product-display.request.dto";
import { OkResponse } from "./dto/product-display.response.dto";
import { ProductDisplayRepository } from "./product-display.repository";

const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

@Injectable()
export class ProductDisplayService {
  constructor(private readonly repo: ProductDisplayRepository) {}

  async list(q: ListProductDisplaysRequest) {
    const page = Math.max(1, q.page ?? 1);
    const limit = Math.min(100, Math.max(1, q.limit ?? 20));
    const { items, total } = await this.repo.findList({
      type: (q.type ?? DisplayType.RECOMMEND) as unknown as ProductDisplayType,
      page,
      limit,
      q: q.q,
      isShow: q.isShow,
    });
    return { items, total, page, limit };
  }

  async create(dto: CreateProductDisplayRequest) {
    const type = dto.type as unknown as ProductDisplayType;

    const exists = await this.repo.existsByTypeAndProductId(type, dto.productId);
    if (exists) throw new BadRequestException("ALREADY_EXISTS");

    let order = dto.sortOrder;
    if (order == null) order = (await this.repo.getMaxSortOrder(type)) + 1;

    const id = await this.repo.insertOne({
      productId: dto.productId,
      type,
      sortOrder: order,
      isShow: dto.isShow ?? true,
      startDate: dto.startDate ?? null,
      endDate: dto.endDate ?? null,
    });

    return id;
  }

  async reorder(type: DisplayType, items: ReorderProductDisplaysRequest["items"]) {
    if (!items?.length) return { ok: true as const };

    const t = type as unknown as ProductDisplayType;

    // 1) 현재 type 전체 id를 현행 순서대로 가져오기
    const allIds = await this.repo.findIdsByType(t); // ex) [1,2,3,4]
    const N = allIds.length;
    if (!N) return { ok: true as const };

    // 2) payload 분석
    const withNumber = items.filter((it) => Number.isFinite((it as any).sortOrder)) as Array<{
      id: number;
      sortOrder: number;
    }>;
    const onlyIds = items.filter((it) => !Number.isFinite((it as any).sortOrder)).map((it) => it.id);

    // 3) 최종 순서 계산
    let finalIds: number[] = [];

    if (withNumber.length > 0) {
      // 💡 “부분 numeric 재배치” 지원: 희소(sparse) 배치 알고리즘
      //    지정된 자리(index=sortOrder-1)에 해당 id를 먼저 꽂고, 남는 칸을 기존 순서로 채움
      const slots: (number | null)[] = Array(N).fill(null);

      // (3-1) 중복 sortOrder 사전 검증
      const wanted = withNumber.map((x) => clamp(x.sortOrder, 1, N));
      const hasDup = new Set(wanted).size !== wanted.length;
      if (hasDup) throw new BadRequestException("중복된 sortOrder가 있습니다.");

      // (3-2) 명시된 것들 먼저 자리 배치(범위를 벗어나면 끝으로 클램프)
      for (const { id, sortOrder } of withNumber) {
        const pos = clamp(sortOrder, 1, N) - 1;
        slots[pos] = id; // 같은 pos에 두 번 올 경우 위의 hasDup에서 걸림
      }

      // (3-3) 나머지 id들(=명시 안 된 것들)을 현행 순서대로 빈 칸에 채움
      const fixedIds = new Set(withNumber.map((x) => x.id));
      const rest = allIds.filter((id) => !fixedIds.has(id)); // ex) [2,3,4]
      let r = 0;
      for (let i = 0; i < N; i++) {
        if (slots[i] === null) {
          slots[i] = rest[r++]; // 빈 칸을 기존 순서로 채우기
        }
      }

      finalIds = slots as number[];
    } else {
      // 💡 “배열 순서” 방식: items id를 앞으로, 나머지는 현행 순서 그대로 뒤에
      const chosen = new Set(onlyIds);
      const rest = allIds.filter((id) => !chosen.has(id));
      finalIds = [...onlyIds, ...rest];
    }

    // 4) 최종 rows(1..N) 구성
    const rows = finalIds.map((id, idx) => ({ id, sortOrder: idx + 1 }));

    try {
      // 🔹 UNIQUE(sort_order)와 충돌 없도록 "type 전체"를 오프셋 후 CASE로 한 번에 세팅하는 메서드
      await this.repo.updateSortOrdersAll(t, rows);
    } catch (e: any) {
      if (e?.code === "ER_DUP_ENTRY" || e?.errno === 1062) {
        // 개발/운영에서 이해하기 쉬운 메시지로 변환
        throw new ConflictException(
          "이미 사용 중인 정렬값과 충돌했습니다. 전체 최종 순서를 보내거나, 값 중복을 피해주세요."
        );
      }
      throw e;
    }

    return { ok: true as const };
  }

  async update(id: number, dto: UpdateProductDisplayRequest) {
    const patch: Partial<{ isShow: boolean; startDate: string | null; endDate: string | null }> = {};
    const raw = dto as Record<string, unknown>;

    if (Object.prototype.hasOwnProperty.call(raw, "isShow")) {
      patch.isShow = dto.isShow!;
    }
    if (Object.prototype.hasOwnProperty.call(raw, "startDate")) {
      patch.startDate = dto.startDate === null ? null : (dto.startDate as string);
    }
    if (Object.prototype.hasOwnProperty.call(raw, "endDate")) {
      patch.endDate = dto.endDate === null ? null : (dto.endDate as string);
    }

    if (Object.keys(patch).length === 0) return id;

    const updatedId = await this.repo.updateOne(id, patch);
    if (!updatedId) throw new NotFoundException("NOT_FOUND");
    return updatedId;
  }

  async remove(id: number): Promise<OkResponse> {
    const row = await this.repo.findById(id);
    if (!row) throw new NotFoundException("추천상품을 찾을 수 없습니다.");

    await this.repo.deleteById(id);
    await this.repo.normalizeByType(row.type);

    return { ok: true };
  }

  async publicListRecommended(type: DisplayType, limit = 10) {
    return this.repo.findPublicRecommended(type as unknown as ProductDisplayType, limit);
  }
}
