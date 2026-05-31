import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Product } from './entities/product.entity';
import { In, Repository } from 'typeorm';
import { Category } from 'src/categories/entities/category.entity';
import { BookmarkProduct } from './entities/product-bookmark.entity';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class ProductsService {

  constructor(
    @InjectRepository(Product) private readonly productRepository: Repository<Product>,
    @InjectRepository(Category) private readonly categoryRepository: Repository<Category>,
    @InjectRepository(BookmarkProduct) private readonly bookmarkProductRepository: Repository<BookmarkProduct>,
    private readonly userService: UsersService,
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

  async toggleBookmark(userId: number, productId: number): Promise<BookmarkProduct | { message: string }> {
    // چک کردن وجود کاربر و محصول
    const user = await this.userService.findOne(userId);
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!user || !product) {
      throw new NotFoundException('کاربر یا محصول یافت نشد');
    }

    // بررسی وجود بوکمارک
    const existingBookmark = await this.bookmarkProductRepository.findOne({
      where: {
        user: { id: userId },
        product: { id: productId }
      },
    });

    if (existingBookmark) {
      // اگر بوکمارک وجود داشت، حذف می‌کنیم
      await this.bookmarkProductRepository.remove(existingBookmark);
      return { message: 'بوکمارک با موفقیت حذف شد' };
    } else {
      // اگر بوکمارک وجود نداشت، ایجاد می‌کنیم
      const newBookmark = this.bookmarkProductRepository.create({
        user: { id: userId },
        product: { id: productId },
      });
      return await this.bookmarkProductRepository.save(newBookmark);
    }
  }

  async addItemtoBasket(userId: number, productId: number) {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
      throw new Error('محصول یافت نشد');
    }

    return await this.userService.addProductToBasket(userId, product); // ✅ اسم درست
  }

  async removeItemFromBasket(userId: number, productId: number) {
    const product = await this.productRepository.findOne({ where: { id: productId } });

    if (!product) {
        throw new Error('محصول یافت نشد');
    }

    return await this.userService.removeProductFromBasket(userId, product);
}
}
