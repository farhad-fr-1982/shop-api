import { IsEnum, IsNotEmpty, IsOptional, IsString } from "class-validator";
import Role from "../enums/Role";

export class UpdateUserDto {

    @IsString({ message: 'نام باید یک رشته باشد' })
    @IsNotEmpty({ message: 'نام نمی‌تواند خالی باشد' })
    display_name: string;

    @IsOptional()
    @IsEnum(Role, { message: 'نقش کاربر باید user یا admin باشد' })
    role?: Role;
}
