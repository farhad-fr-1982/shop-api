import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>
  ) { }


  async create(createProductDto: CreateProductDto): Promise<Product> {
    const { title, price, description, stock, categoryIds } = createProductDto;

    const product: Product = this.productRepository.create({ title, price, description, stock });

    if (categoryIds) {
      const categories = await this.categoryRepository.findBy({ id: In(categoryIds) })
      product.categories = categories
    }

    return await this.productRepository.save(product);
  }

  async findAll(): Promise<Product[]> {
    return await this.productRepository.find({ relations: ['categories'] })
  }

  async findOne(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id }, relations: ['categories'] })

    if (!product) {
      throw new NotFoundException('محصولی یافت نشد')
    }

    return product
  }

  async update(id: number, updateProductDto: UpdateProductDto): Promise<Product> {
    const { title, price, description, stock, categoryIds } = updateProductDto;

    const product = await this.findOne(id)

    if (title) product.title = title
    if (price) product.price = price
    if (description) product.description = description
    if (stock) product.stock = stock

    if (categoryIds) {
      const categories = await this.categoryRepository.findBy({ id: In(categoryIds) })
      product.categories = categories
    }

    return await this.productRepository.save(product)

  }

  remove(id: number) {
    return `This action removes a #${id} product`;
  }
}
