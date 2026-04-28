import { Controller, Get, Post, Body, Patch, Param, Delete, Res, HttpStatus } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import type { Response } from 'express';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) { }

  @Post()
  async create(@Body() createCategoryDto: CreateCategoryDto, @Res() res: Response) {
    const category = this.categoriesService.create(createCategoryDto);

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: category,
      message: 'دسته بندی با موفقیت ثبت شد'
    });
  }

  @Get()
  async findAll(@Res() res: Response) {
    const category = await this.categoriesService.findAll();

    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      data: category,
      message: 'لیست همه دسته بندی ها'
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.categoriesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCategoryDto: UpdateCategoryDto) {
    return this.categoriesService.update(+id, updateCategoryDto);
  }

  // @Delete('remove-only-category/:id')
  // async remove(@Param('id') id: string, @Res() res: Response) {
  //   await this.categoriesService.remove(+id);
  //   return res.status(HttpStatus.OK).json({
  //     statusCode: HttpStatus.OK,
  //     message: 'دسته بندی با موفقیت حذف شد'
  //   });
  // }

  @Delete('safe-remove/:id')
  async safeRemove(@Param('id') id: string, @Res() res: Response) {
    await this.categoriesService.safeRemove(+id);
    return res.status(HttpStatus.OK).json({
      statusCode: HttpStatus.OK,
      message: 'دسته بندی با موفقیت حذف شد'
    });
  }
}
