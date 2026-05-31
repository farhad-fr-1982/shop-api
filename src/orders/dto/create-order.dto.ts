// src/orders/dto/create-order.dto.ts
import { IsNumber, IsEnum, IsOptional, Min, IsDateString, IsArray, ValidateNested } from "class-validator";
import { OrderStatus } from "../enums/order-status.entity";
import { Type } from "class-transformer";
import { CreateOrderItemDto } from "../entities/create-order.entity";


export class CreateOrderDto {
    @IsNumber({}, { message: 'userId باید عدد باشد' })
    @Min(1, { message: 'userId باید بیشتر از 0 باشد' })
    userId: number;

    @IsEnum(OrderStatus, { message: 'status معتبر نیست' })
    @IsOptional()
    status?: OrderStatus;

    @IsDateString({}, { message: 'paid_time تاریخ نامعتبر' })
    @IsOptional()
    paid_time?: Date;

    @IsNumber({}, { message: 'addressId باید عدد باشد' })
    @Min(1, { message: 'addressId باید بیشتر از 0 باشد' })
    addressId: number;

    @IsNumber({}, { message: 'discount باید عدد باشد' })
    @IsOptional()
    discount?: number;

    @IsArray({ message: 'فیلد items باید یک آرایه باشد' })
    @ValidateNested({ each: true })
    @Type(() => CreateOrderItemDto)
    items: CreateOrderItemDto[];
}