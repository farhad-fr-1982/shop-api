import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Address } from './entities/address.entity';
import { Repository } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(Address) private readonly addressRepository: Repository<Address>,
    @InjectRepository(User) private readonly userRepository: Repository<User>
  ) { }

  async create(createAddressDto: CreateAddressDto): Promise<Address> {
    const { userId, ...addressData } = createAddressDto;
    
    if (!userId) {
      throw new BadRequestException('userId الزامی است');
    }
    
    const user = await this.userRepository.findOne({ where: { id: userId } });
    
    if (!user) {
      throw new NotFoundException('کاربری با این شناسه یافت نشد');
    }
    
    const address = this.addressRepository.create({ ...addressData, user });
    return await this.addressRepository.save(address);
  }

  async findAll(): Promise<Address[]> {
    return await this.addressRepository.find({ relations: ['user'] });
  }

  async findOne(id: number): Promise<Address> {
    const address = await this.addressRepository.findOne({ 
      where: { id }, 
      relations: ['user'] 
    });

    if (!address) {
      throw new NotFoundException('آدرسی یافت نشد');
    }

    return address;
  }

  async update(id: number, updateAddressDto: UpdateAddressDto): Promise<Address> {
    const address = await this.findOne(id);
    
    // حذف userId از دیتای به‌روزرسانی (اگر وجود داشته باشد)
    const { userId, ...updateData } = updateAddressDto as any;
    
    Object.assign(address, updateData);
    return await this.addressRepository.save(address);
  }

  async remove(id: number): Promise<void> {
    const address = await this.findOne(id);
    await this.addressRepository.remove(address);
  }
}