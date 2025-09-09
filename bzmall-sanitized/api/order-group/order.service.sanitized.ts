/**
 * Sanitized for portfolio use.
 * Focus: Group Order (multi-order) API.
 * - Non-group order logic bodies are redacted.
 * - Internal imports (@rsteam, @rs-team, @rstful) are masked.
 * - DB calls remain illustrative or are stubbed; not intended to run.
 */

import { ORDER_ERROR, YMDHMS, chunk, concurrency } from "@libs/common";
import { CouponStatus, CreditHistoryType, SendStatus } from "@libs/model";
import { OID_GENERATOR, OidGenerator } from "@libs/randomizer";
import { BadRequestException, Inject, Injectable } from "@nestjs/common";
import { Transactional } from "redacted/drizzle";
import { CreditHistoryRepository } from "apps/admin/src/modules/credit/history/credit-history.repository";
import dayjs from "dayjs";
import { CouponRepository } from "../coupon/coupon.repository";
import { InvoiceProducer } from "../invoice/invoice.producer";
import { ProductRepository } from "../product/product.repository";
import { SendHistoryRepository } from "../send/history/send-history.repository";
import { UserRepository } from "../user/user.repository";
import { ApiGroupOrderDto, OrderDto, OrderListDto } from "./dto";
import { OrderGroupRepository } from "./order-group.repository";
import { OrderRepository } from "./order.repository";

@Injectable()
export class OrderService {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly userRepository: UserRepository,
    private readonly orderRepository: OrderRepository,
    private readonly couponRepository: CouponRepository,
    private readonly invoiceProducer: InvoiceProducer,
    private readonly sendHistoryRepository: SendHistoryRepository,
    private readonly creditHistoryRepository: CreditHistoryRepository,
    private readonly orderGroupRepository: OrderGroupRepository,
    @Inject(OID_GENERATOR)
    private readonly oidGenerator: OidGenerator
  ) {
  /* redacted for portfolio */
}

  async list(query: OrderListDto, userId: number) {
  /* redacted for portfolio */
}

  @Transactional()
  async detail(id: number) {
  /* redacted for portfolio */
}

  /** 유저 노출용 상태 추출 */
  private getDisplayStatus(couponStatus: CouponStatus, sendStatus: SendStatus, failureReason: string | null) {
  /* redacted for portfolio */
}

  /**
   * 주문 생성 및 처리
   * @param dto 주문 정보 (상품ID, 제목, 메시지, 수신자 목록 등)
   * @param userId 주문하는 사용자 ID
   * @throws BadRequestException 수량이 10,000개를 초과하는 경우
   * @throws BadRequestException 사용자 크레딧이 부족한 경우
   * @throws NotFoundException 사용자나 상품을 찾을 수 없는 경우
   * @description 사용자의 주문 요청을 검증하고 처리합니다. 수량 제한 및 크레딧 잔액을 확인한 후 주문을 생성하고, 쿠폰과 발송 이력을 생성하여 Halo API로 배치 처리합니다.
   */
  async order(dto: OrderDto, userId: number) {
  /* redacted for portfolio */
}

  @Transactional()
  async groupOrder(dto: ApiGroupOrderDto, userId: number) {
    if (!dto.items?.length) throw new BadRequestException("주문 항목이 없습니다.");

    // 1) 중복 상품 금지
    const ids = dto.items.map((i) => i.productId);
    const dup = ids.find((id, i) => ids.indexOf(id) !== i);
    if (dup) throw new BadRequestException("중복 상품 주문은 불가합니다.");

    // 2) 총액/필수값 검증
    const user = await this.userRepository.findOneOrThrow({ id: userId });
    let totalAmount = 0;
    const cache = new Map<number, any>();

    for (const it of dto.items) {
      const product = cache.get(it.productId) ?? (await this.productRepository.findOneOrThrow({ id: it.productId }));
      cache.set(it.productId, product);

      if (!it.title?.trim()) throw new BadRequestException(`[${product.name}]의 제목을 입력해주세요.`);
      if (!it.message?.trim()) throw new BadRequestException(`[${product.name}]의 메시지를 입력해주세요.`);
      if (!it.receivers?.length) throw new BadRequestException(`[${product.name}]의 수신번호를 입력해주세요.`);
      if (it.receivers.length > 10000)
        throw new BadRequestException(`[${product.name}]의 수신번호는 최대 10,000명입니다.`);

      totalAmount += product.salePrice * it.receivers.length;
    }

    // 3) 크레딧 일괄 검증
    if (user.credit < totalAmount) throw new BadRequestException("크레딧이 부족합니다.");

    // 4) 그룹 생성 (스키마/엔티티 변경 없음)
    const groupId = await this.orderGroupRepository.createByTid(userId, dto.tid, totalAmount);

    // 5) 각 항목을 기존 단건 주문 로직으로 생성 (tid에 _순번 suffix)
    const orders: Array<Awaited<ReturnType<typeof this.order>>> = [];
    for (let i = 0; i < dto.items.length; i++) {
      const it = dto.items[i];
      const singleTid = `${dto.tid}_${i + 1}`;

      const created = await this.order(
        {
          tid: singleTid,
          productId: it.productId,
          title: it.title,
          message: it.message,
          receivers: it.receivers,
        } as any,
        userId
      );
      orders.push(created);
    }

    // 6) 단건 주문들을 그룹에 연결 (order_group_id 채우기)
    await this.orderRepository.attachOrdersToGroupByTidPrefix(dto.tid, groupId);

    // 7) 크레딧 메모 일괄 갱신: "다건 주문 결제 (n개)"
    await this.orderRepository.updateCreditMemoForGroupTidPrefix(userId, dto.tid, dto.items.length);

    // 8) 그룹 ROW 조회 후 응답 조립
    const group = await this.orderGroupRepository.findByTidOrThrow(dto.tid);
    return { group, orders };
  }
}
