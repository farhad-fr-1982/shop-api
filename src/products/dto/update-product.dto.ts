import { IsArray, IsInt, IsOptional, IsPositive, IsString } from "class-validator";

export class UpdateProductDto {

    @IsOptional()
    @IsString()
    title: string;

    @IsInt()
    @IsOptional()
    price: number;

    @IsString()
    @IsOptional()
    description: string;

    @IsInt()
    @IsOptional()
    stock: number;

    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    categoryIds?: number[];
}
