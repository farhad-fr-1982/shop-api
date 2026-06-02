import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, Matches, Length } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendSmsDto {
    @ApiProperty({ example: '09135882813', description: 'شماره موبایل' })
    @IsString({ message: 'شماره موبایل باید یک رشته باشد' })
    @IsNotEmpty({ message: 'موبایل نمی‌تواند خالی باشد' })
    @Matches(/^09[0-9]{9}$/, { message: 'شماره موبایل باید با 09 شروع شده و 11 رقم باشد' })
    @Transform(({ value }) => value?.trim())
    mobile: string;

    @ApiProperty({ example: 'سام', description: 'نام کاربر' })
    @IsString({ message: 'نام باید یک رشته باشد' })
    @IsNotEmpty({ message: 'نام نمی‌تواند خالی باشد' })
    @Length(2, 50, { message: 'نام باید بین 2 تا 50 کاراکتر باشد' })
    message: string;
}