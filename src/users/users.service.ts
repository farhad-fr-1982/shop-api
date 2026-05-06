import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import Role from './enums/Role';
import { UpdateUserDto } from './dto/update-user.dto';
import { Product } from 'src/products/entities/product.entity';

@Injectable()
export class UsersService {
  constructor(@InjectRepository(User) private readonly userRepository: Repository<User>) {

  }

  async create(createUserDto: CreateUserDto) {
    try {
      const existingUser = await this.userRepository.findOne({
        where: { mobile: createUserDto.mobile }
      });

      if (existingUser) {
        throw new BadRequestException('کاربری قبلا با این شماره موبایل ثبت نام کرده است');
      }

      const newUser = this.userRepository.create(createUserDto);
      return await this.userRepository.save(newUser);

    } catch (error) {
      if (error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('خطا در ایجاد کاربر');
    }
  }

  async findAll(role?: Role, limit: number = 5, page: number = 1) {
    const query = this.userRepository.createQueryBuilder('users')
    if (role) {
      query.where('role = :role', { role })
    }

    query.skip((page - 1) * limit).take(limit)

    return await query.getMany()
  }

  async findOne(id: number) {
    const user = await this.userRepository.findOne({ where: { id } })
    if (!user) {
      throw new NotFoundException('کاربری یافت نشد')
    }
    return user
  }

  async findUserByPermission(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
        where: { id: userId },
        relations: ['roles', 'roles.permissions', 'permissions']  // ✅ اصلاح شده
    });
    
    if (!user) {
        throw new NotFoundException('کاربری یافت نشد');
    }
    return user;
}

  async findOneByMobile(mobile: string) {
    const user = await this.userRepository.findOne({ where: { mobile } })
    if (!user) {
      throw new NotFoundException('کاربری یافت نشد')
    }
    return user
  }

  async update(id: number, updateUserDto: UpdateUserDto) {
    const user = await this.findOne(id)
    if (!user) {
      throw new NotFoundException(`کاربری با ای دی ${id} یافت نشد`)
    }

    try {
      await this.userRepository.update(id, updateUserDto)
      const updatedUser = await this.findOne(id)
      return updatedUser
    } catch (error) {
      throw new BadRequestException('خطایی در ویرایش کاربر رخ داده است')
    }
  }

  async addProductToBasket(userId: number, product: Product) {  // ✅ اضافه کردن type
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['basket_items']  // ✅ اضافه شد
    });

    if (!user) {
      throw new Error('کاربر یافت نشد');  // ✅ throw جدید
    }

    if (!user.basket_items) {
      user.basket_items = [];
    }

    user.basket_items.push(product);
    return await this.userRepository.save(user);
  }

  async remove(id: number) {
    const user = await this.findOne(id)
    if (!user) {
      throw new NotFoundException(`کاربری با ای دی ${id} یافت نشد`)
    }

    try {
      await this.userRepository.delete(id)
      return { message: 'کاربر با موفقیت حذف شد', id: id }
    } catch (error) {
      throw new BadRequestException('خطایی در حذف کاربر رخ داده است')
    }
  }

  async removeProductFromBasket(userId: number, product: Product) {
    // پیدا کردن کاربر به همراه آیتم‌های سبد خرید
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['basket_items']
    });

    if (!user) {
      throw new Error('کاربر یافت نشد');
    }

    // پیدا کردن آیتم مورد نظر در سبد خرید
    const productIndex = user.basket_items.findIndex(item => item.id === product.id);

    if (productIndex === -1) {
      throw new NotFoundException('هیچ محصولی در سبد خرید وجود ندارد');
    }

    // حذف آیتم از سبد خرید
    user.basket_items.splice(productIndex, 1);

    // ذخیره تغییرات
    return await this.userRepository.save(user);
  }
}