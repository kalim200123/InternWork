// backend/src/products/entities/product.entity.ts
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Cart } from '../../cart/entities/cart.entity';

export enum ProductStatus {
  SELLING = 'selling',
  SOLD_OUT = 'sold_out',
  PREPARING = 'preparing',
}

@Entity()
export class Product {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  price: number;

  @Column({ type: 'text' })
  description: string;

  @Column({ nullable: true }) // 👈 null 값을 허용하도록 변경
  imageUrl: string;

  @Column()
  category: string;

  @Column({ type: 'int', default: 0 }) // 재고 (기본값 0)
  stock: number;

  @Column({ default: false }) // 추천 상품 여부 (기본값 false)
  isFeatured: boolean;

  @Column({
    // 👇 판매 상태 컬럼 추가
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.PREPARING,
  })
  status: ProductStatus;

  @Column({ type: 'int', default: 99 }) // 👇 배치 순서 컬럼 추가
  sortOrder: number;

  @CreateDateColumn() // 생성 시각 자동 기록
  createdAt: Date;

  @UpdateDateColumn() // 수정 시각 자동 기록
  updatedAt: Date;

  @OneToMany(() => Cart, (cart) => cart.product)
  cartItems: Cart[];
}
