// backend/src/users/entities/user.entity.ts
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Cart } from '../../cart/entities/cart.entity';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
}

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column() // 이름
  name: string;

  @Column({ unique: true }) // 아이디 (중복 불가)
  username: string;

  @Column() // 비밀번호
  password: string;

  @Column() // 전화번호
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  @OneToMany(() => Cart, (cart) => cart.user)
  cartItems: Cart[];

  role: UserRole;
}
