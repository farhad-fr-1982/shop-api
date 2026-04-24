import { PartialType } from '@nestjs/mapped-types';
import { CreateAddressDto } from './create-address.dto';
import { IsString, IsNotEmpty, Length, IsOptional } from 'class-validator';

export class UpdateAddressDto extends PartialType(CreateAddressDto) {
    @IsString({ message: 'استان باید یک رشته باشد' })
    @IsNotEmpty({ message: 'استان نمیتواند خالی باشد' })
    province: string;

    @IsString({ message: 'شهر باید یک رشته باشد' })
    @IsNotEmpty({ message: 'شهر نمیتواند خالی باشد' })
    city: string;

    @IsString()
    @Length(10, 10, { message: 'کد پستی باید 10 رقم باشد' })
    postal_code: string;

    @IsString({ message: 'آدرس باید یک رشته باشد' })
    @IsNotEmpty({ message: 'آدرس نمیتواند خالی باشد' })
    address: string;

    @IsString({ message: 'شماره موبایل گیرنده باید یک رشته باشد' })
    @Length(11, 11, { message: 'شماره موبایل گیرنده حتما باید 11 رقم باشد' })
    receiver_mobile: string;

    @IsOptional()
    @IsString({ message: 'توضیحات باید یک رشته باشد' })
    description?: string;
}
