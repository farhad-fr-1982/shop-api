import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import UserRoleEnum from './enums/userRoleEnum';
import { UpdateUserDto } from './dto/update-user.dto';

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

  async findAll(role?: UserRoleEnum, limit: number = 5, page: number = 1) {
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
}