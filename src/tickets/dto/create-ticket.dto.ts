// create-ticket.dto.ts
import { IsString, IsNotEmpty, IsNumber, IsOptional, IsInt, Min } from 'class-validator';

export class CreateTicketDto {
    @IsString({ message: 'عنوان باید یک رشته باشد' })
    @IsNotEmpty({ message: 'عنوان نمیتواند خالی باشد' })
    title: string;

    @IsString({ message: 'موضوع باید یک رشته باشد' })
    @IsNotEmpty({ message: 'موضوع نمیتواند خالی باشد' })
    subject: string;

    @IsString({ message: 'توضیحات باید یک رشته باشد' })
    @IsNotEmpty({ message: 'توضیحات نمیتواند خالی باشد' })
    description: string;

    @IsNumber({}, { message: 'آیدی کاربر باید یک عدد باشد' })
    @IsNotEmpty({ message: 'id کاربر نمیتواند خالی باشد' })
    @IsInt({ message: 'آیدی کاربر باید یک عدد صحیح باشد' })
    @Min(1, { message: 'آیدی کاربر باید بزرگتر از 0 باشد' })
    userId: number;

    @IsOptional()
    @IsNumber({}, { message: 'پاسخ به باید یک عدد باشد' })
    @IsInt({ message: 'پاسخ به باید یک عدد صحیح باشد' })
    @Min(1, { message: 'آیدی پاسخ باید بزرگتر از 0 باشد' })
    replyTo?: number;
}