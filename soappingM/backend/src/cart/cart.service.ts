// backend/src/cart/cart.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cart } from './entities/cart.entity';

@Injectable()
export class CartService {
  constructor(
    @InjectRepository(Cart)
    private cartRepository: Repository<Cart>,
  ) {}

  async addItem(userId: string, productId: string, quantity: number) {
    const existingItem = await this.cartRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId },
      },
    });

    if (existingItem) {
      existingItem.quantity += quantity;
      return this.cartRepository.save(existingItem);
    } else {
      const newItem = this.cartRepository.create({
        user: { id: userId },
        product: { id: productId },
        quantity,
      });
      return this.cartRepository.save(newItem);
    }
  }

  async findAllForUser(userId: string) {
    return this.cartRepository.find({
      where: { user: { id: userId } },
      relations: ['product'],
    });
  }

  async updateItemQuantity(cartItemId: string, quantity: number) {
    const item = await this.cartRepository.findOneBy({ id: cartItemId });
    if (item) {
      item.quantity = quantity;
      return this.cartRepository.save(item);
    }
    return null;
  }

  async removeItem(cartItemId: string) {
    return this.cartRepository.delete(cartItemId);
  }

  // 👇 이 함수를 확인합니다.
  async clearCart(userId: string) {
    return this.cartRepository.delete({ user: { id: userId } });
  }
}
