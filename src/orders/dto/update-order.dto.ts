// src/orders/dto/update-order.dto.ts
import { IsOptional, IsEnum, IsNumber, IsDateString, Min } from 'class-validator';
import { OrderStatus } from '../enums/order-status.entity';

export class UpdateOrderDto {
    @IsOptional()
    @IsEnum(OrderStatus, { message: 'وضعیت سفارش معتبر نیست' })
    status?: OrderStatus;

    @IsOptional()
    @IsNumber({}, { message: 'addressId باید یک عدد باشد' })
    @Min(1, { message: 'addressId باید بزرگتر از 0 باشد' })
    addressId?: number;

    @IsOptional()
    @IsDateString({}, { message: 'payed_time باید یک تاریخ معتبر باشد' })
    payed_time?: Date;
}