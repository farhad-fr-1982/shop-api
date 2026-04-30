// src/orders/orders.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './enums/order-status.entity';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) {}

    // ایجاد سفارش جدید
    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(@Body() createOrderDto: CreateOrderDto) {
        const order = await this.ordersService.create(createOrderDto);
        return {
            statusCode: HttpStatus.CREATED,
            success: true,
            message: 'سفارش با موفقیت ایجاد شد',
            data: order,
        };
    }

    // دریافت همه سفارش‌ها
    @Get()
    async findAll() {
        const orders = await this.ordersService.findAll();
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: 'لیست سفارش‌ها با موفقیت دریافت شد',
            data: orders,
            count: orders.length,
        };
    }

    // دریافت سفارش‌های یک کاربر خاص
    @Get('user/:userId')
    async findByUser(@Param('userId') userId: string) {
        const orders = await this.ordersService.findByUser(+userId);
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: `سفارش‌های کاربر با شناسه ${userId} با موفقیت دریافت شد`,
            data: orders,
            count: orders.length,
        };
    }

    // دریافت سفارش‌های با وضعیت خاص
    @Get('status/:status')
    async findByStatus(@Param('status') status: OrderStatus) {
        const orders = await this.ordersService.findByStatus(status);
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: `سفارش‌های با وضعیت ${status} با موفقیت دریافت شد`,
            data: orders,
            count: orders.length,
        };
    }

    // دریافت آمار سفارش‌ها
    @Get('analytics/stats')
    async getOrderStats() {
        const stats = await this.ordersService.getOrderStats();
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: 'آمار سفارش‌ها با موفقیت دریافت شد',
            data: stats,
        };
    }

    // دریافت مجموع فروش
    @Get('analytics/total-sales')
    async getTotalSales() {
        const total = await this.ordersService.getTotalSales();
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: 'مجموع فروش با موفقیت محاسبه شد',
            data: { totalSales: total },
        };
    }

    // دریافت سفارش‌های یک بازه زمانی
    @Get('analytics/date-range')
    async findByDateRange(
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        const orders = await this.ordersService.findByDateRange(
            new Date(startDate),
            new Date(endDate),
        );
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: 'سفارش‌های بازه زمانی با موفقیت دریافت شد',
            data: orders,
            count: orders.length,
        };
    }

    // دریافت یک سفارش با شناسه
    @Get(':id')
    async findOne(@Param('id') id: string) {
        const order = await this.ordersService.findOne(+id);
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: `سفارش با شناسه ${id} با موفقیت دریافت شد`,
            data: order,
        };
    }

    // بروزرسانی سفارش
    @Patch(':id')
    async update(@Param('id') id: string, @Body() updateOrderDto: UpdateOrderDto) {
        const order = await this.ordersService.update(+id, updateOrderDto);
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: `سفارش با شناسه ${id} با موفقیت بروزرسانی شد`,
            data: order,
        };
    }

    // بروزرسانی وضعیت سفارش
    @Patch(':id/status')
    async updateStatus(
        @Param('id') id: string,
        @Body('status') status: OrderStatus,
    ) {
        const order = await this.ordersService.updateStatus(+id, status);
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: `وضعیت سفارش با شناسه ${id} با موفقیت به ${status} تغییر یافت`,
            data: order,
        };
    }

    // لغو سفارش
    @Patch(':id/cancel')
    async cancelOrder(@Param('id') id: string) {
        const order = await this.ordersService.updateStatus(+id, OrderStatus.CANCELLED);
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: `سفارش با شناسه ${id} با موفقیت لغو شد`,
            data: order,
        };
    }

    // حذف سفارش
    @Delete(':id')
    async remove(@Param('id') id: string) {
        const result = await this.ordersService.remove(+id);
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: result.message,
        };
    }
}