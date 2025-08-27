// backend/src/products/products.service.ts
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Product } from './entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  create(createProductDto: CreateProductDto, file?: Express.Multer.File) {
    const productDataToSave: Partial<Product> = {
      ...createProductDto,
      price: Number(createProductDto.price),
      stock: Number(createProductDto.stock),
      sortOrder: Number(createProductDto.sortOrder),
      isFeatured: createProductDto.isFeatured === 'true',
    };

    // 파일이 있는 경우에만 파일 이름을 imageUrl에 저장합니다.
    if (file) {
      productDataToSave.imageUrl = file.filename;
    } else {
      // 파일이 없는 경우 (시드 스크립트 등), DTO에 있는 imageUrl을 그대로 사용합니다.
      productDataToSave.imageUrl = createProductDto.imageUrl;
    }

    const newProduct = this.productRepository.create(productDataToSave);
    return this.productRepository.save(newProduct);
  }

  findAll(category: string) {
    if (category && category !== 'all') {
      return this.productRepository.find({ where: { category } });
    }
    return this.productRepository.find();
  }

  findOne(id: string) {
    return this.productRepository.findOneBy({ id });
  }

  update(id: string, _updateProductDto: UpdateProductDto) {
    return `This action updates a #${id} product`;
  }

  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
