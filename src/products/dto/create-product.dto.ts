import { IsString, IsInt, IsOptional, IsArray, IsPositive } from 'class-validator';

export class CreateProductDto {
    @IsString()
    title: string;

    @IsInt()
    @IsPositive()
    price: number;

    @IsString()
    description: string;

    @IsInt()
    @IsPositive()
    stock: number;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    categoryIds?: number[];
}