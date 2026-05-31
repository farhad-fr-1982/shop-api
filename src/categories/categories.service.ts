import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Category } from './entities/category.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CategoriesService {

  constructor(@InjectRepository(Category) private readonly categoryRepository: Repository<Category>) {

  }

  async create(createCategoryDto: CreateCategoryDto): Promise<Category> {
    const category = this.categoryRepository.create(createCategoryDto)
    return await this.categoryRepository.save(category)
  }

  async findAll(): Promise<Category[]> {
    return await this.categoryRepository.find({ relations: ['products'] })
  }

  async findOne(id: number): Promise<Category> {
    const category = await this.categoryRepository.findOne({
      where: { id },
      relations: ['products']
    });

    if (!category) {
      throw new NotFoundException(`Cدسته بندی یافت نشد`);
    }

    return category;
  }

  update(id: number, updateCategoryDto: UpdateCategoryDto) {
    return `This action updates a #${id} category`;
  }

  remove(id: number) {
    return `This action removes a #${id} category`;
  }


  // async removeOnlyCategory(id: number): Promise<void> {
  //   const category = await this.findOne(id)

  //   category.products = []
  //   await this.categoryRepository.save(category)

  //   await this.categoryRepository.remove(category)
  // }

  async safeRemove(id: number): Promise<void>{
    const category = await this.findOne(id)
    if(category.products.length > 0){
      throw new BadRequestException('این دسته بندی دارای تعدادی محصول است')
    }

    await this.categoryRepository.remove(category)
  }
}
