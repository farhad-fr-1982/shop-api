import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus, Put } from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import type { Response } from 'express';
import { BookmarkProductDto } from './dto/bookmark-product.dto';
import { ApiBearerAuth } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) { }

  @Post()
  async create(@Body() createProductDto: CreateProductDto, @Res() res: Response) {
    const product = await this.productsService.create(createProductDto);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: product,
      message: 'محصول با موفقیت ثبت شد'
    });
  }

  @Post('bookmark-product')
  async bookmarkProduct(@Body() bookmarkProduct: BookmarkProductDto, @Res() res: Response) {
    const bookmarkdata = await this.productsService.toggleBookmark(
      bookmarkProduct.user_id,
      bookmarkProduct.product_id
    );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: bookmarkdata,
      message: 'محصول با موفقیت به سبد خرید اضافه شد'
    });
  }

  @Post('add-basket')
  async addItemToBasket(@Body() bookmarkProduct: BookmarkProductDto, @Res() res: Response) {
    const bookmarkdata = await this.productsService.addItemtoBasket(
      bookmarkProduct.user_id,
      bookmarkProduct.product_id
    );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: bookmarkdata,
      message: 'عملیات بوکمارک با موفقیت انجام شد'
    });
  }

  @Post('remove-basket')
  async removeItemFromBasket(@Body() bookmarkProduct: BookmarkProductDto, @Res() res: Response) {
    await this.productsService.removeItemFromBasket(
      bookmarkProduct.user_id,
      bookmarkProduct.product_id
    );

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'محصول با موفقیت از سبد خرید حذف شد'
    });
  }

  @Get()
  async findAll(@Res() res: Response) {
    const products = this.productsService.findAll();

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: products,
      message: 'لیست همه محصولات'
    });
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Res() res: Response) {
    const product = await this.productsService.findOne(+id);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: product,
      message: 'لیست  محصول'
    });
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto, @Res() res: Response) {
    const product = await this.productsService.update(+id, updateProductDto);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: product,
      message: 'محصول با موفقیت به‌روزرسانی شد'
    });
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.productsService.remove(+id);
  }
}
