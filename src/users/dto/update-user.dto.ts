import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import UserRoleEnum from "../enums/userRoleEnum";

export class UpdateUserDto {

    @IsString({ message: 'نام باید یک رشته باشد' })
    @IsNotEmpty({ message: 'نام نمی‌تواند خالی باشد' })
    display_name: string;

    @IsOptional()
    @IsEnum(UserRoleEnum, { message: 'نقش کاربر باید user یا admin باشد' })
    role?: UserRoleEnum;
}
