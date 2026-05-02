import { IsEnum, IsNotEmpty, IsOptional, IsString, Length, Matches, MaxLength, MinLength } from "class-validator";
import UserRoleEnum from "../enums/userRoleEnum";
import { Transform } from "class-transformer";
import { ApiProperty } from "@nestjs/swagger";

export class CreateUserDto {
    // @ApiProperty({example:'09167194055',description:'شماره همراه'})
    @IsString({ message: 'شماره همراه باید یک رشته باشد' })
    @Length(11, 11, { message: 'شماره همراه باید 11 کاراکتر باشد' })
    @Matches(/^09[0-9]{9}$/, { message: 'شماره همراه معتبر نیست' })
    @IsNotEmpty({ message: 'شماره همراه نمی‌تواند خالی باشد' })
    @Transform(({ value }) => value.trim())
    mobile: string;

    // @ApiProperty({example:'فرهاد',description:'نام نمایشی'})
    @IsString({ message: 'نام باید یک رشته باشد' })
    @IsNotEmpty({ message: 'نام نمی‌تواند خالی باشد' })
    display_name: string;

    @IsString({ message: 'کلمه عبور باید یک رشته باشد' })
    @MinLength(6, { message: 'کلمه عبور باید حداقل 6 کاراکتر باشد' })
    @MaxLength(15, { message: 'کلمه عبور باید حداکثر 15 کاراکتر باشد' })
    @IsNotEmpty({ message: 'کلمه عبور نمی تواند خالی باشد' })
    password: string;

    @IsOptional()
    @IsEnum(UserRoleEnum, { message: 'نقش کاربر باید user یا admin باشد' })
    role?: UserRoleEnum;
}