// backend/src/cart/entities/cart.entity.ts
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { Product } from '../../products/entities/product.entity';
import { User } from '../../users/entities/user.entity';

@Entity()
export class Cart {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.cartItems)
  user: User;

  @ManyToOne(() => Product, (product) => product.cartItems)
  product: Product;

  @Column({ type: 'int', default: 1 })
  quantity: number;
}
