import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ProductsService } from './products.service';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(FileInterceptor('image')) // 'image'라는 이름의 파일을 받겠다고 설정
  create(
    @UploadedFile() file: Express.Multer.File, // 업로드된 파일
    @Body() createProductDto: CreateProductDto, // 텍스트 데이터
  ) {
    console.log(file); // 파일이 잘 들어왔는지 터미널에 출력해보기
    console.log(createProductDto); // 텍스트 데이터가 잘 들어왔는지 터미널에 출력해보기

    return this.productsService.create(createProductDto, file);
  }

  @Get()
  findAll(@Query('category') category: string) {
    return this.productsService.findAll(category);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto) {
    return this.productsService.update(id, updateProductDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(id);
  }
}
