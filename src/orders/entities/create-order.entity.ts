// src/orders/dto/create-order-item.dto.ts
import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class CreateOrderItemDto {
    @IsNumber({}, { message: 'شناسه محصول باید یک عدد باشد' })
    @IsNotEmpty({ message: 'شناسه محصول نمی‌تواند خالی باشد' })
    @Min(1, { message: 'شناسه محصول باید بزرگتر از 0 باشد' })
    productId: number;

    @IsNumber({}, { message: 'تعداد باید یک عدد باشد' })
    @IsNotEmpty({ message: 'تعداد نمی‌تواند خالی باشد' })
    @Min(1, { message: 'تعداد باید حداقل 1 باشد' })
    quantity: number;
}