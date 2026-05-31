import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressService } from './address.service';
import { AddressController } from './address.controller';
import { Address } from './entities/address.entity';
import { User } from '../users/entities/user.entity'; // مسیر صحیح را وارد کنید

@Module({
  imports: [
    TypeOrmModule.forFeature([Address, User]) // ثبت Entityها در TypeORM
  ],
  controllers: [AddressController],
  providers: [AddressService],
})
export class AddressModule {}