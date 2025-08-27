// backend/src/products/dto/create-product.dto.ts
import { ProductStatus } from '../entities/product.entity';

export class CreateProductDto {
  name: string;
  price: string;
  description: string;
  imageUrl: string;
  category: string;
  stock: string;
  isFeatured: boolean | string;
  status: ProductStatus;
  sortOrder: string;
}
