// dto/payment-order.dto.ts
import { IsNumber, IsNotEmpty, Min } from 'class-validator';

export class PaymentOrderDto {
    @IsNumber({}, { message: 'شناسه سفارش باید یک عدد باشد' })
    @IsNotEmpty({ message: 'شناسه سفارش نمی‌تواند خالی باشد' })
    @Min(1, { message: 'شناسه سفارش باید بزرگتر از 0 باشد' })
    order_id: number;

    @IsNumber({}, { message: 'مبلغ باید یک عدد باشد' })
    @IsNotEmpty({ message: 'مبلغ نمی‌تواند خالی باشد' })
    @Min(1000, { message: 'مبلغ باید حداقل 1000 تومان باشد' })
    amount: number;
}