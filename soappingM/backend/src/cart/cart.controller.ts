// backend/src/cart/cart.controller.ts
import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CartService } from './cart.service';

@Controller('cart')
export class CartController {
  constructor(private cartService: CartService) {}

  @UseGuards(AuthGuard('jwt'))
  @Get()
  getItems(@Request() req) {
    const userId = req.user.userId;
    return this.cartService.findAllForUser(userId);
  }

  // 👇 1. 'clear'라는 고정된 경로를 먼저 정의합니다.
  @UseGuards(AuthGuard('jwt'))
  @Delete('clear')
  clearCartForUser(@Request() req) {
    const userId = req.user.userId;
    return this.cartService.clearCart(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('add')
  addItemToCart(
    @Body() body: { productId: string; quantity: number },
    @Request() req,
  ) {
    const userId = req.user.userId;
    return this.cartService.addItem(userId, body.productId, body.quantity);
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch(':id')
  updateItem(@Param('id') id: string, @Body() body: { quantity: number }) {
    return this.cartService.updateItemQuantity(id, body.quantity);
  }

  // 👇 2. ':id'라는 변하는 경로는 나중에 정의합니다.
  @UseGuards(AuthGuard('jwt'))
  @Delete(':id')
  removeItem(@Param('id') id: string) {
    return this.cartService.removeItem(id);
  }
}
