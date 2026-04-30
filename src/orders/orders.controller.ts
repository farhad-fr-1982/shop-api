// src/orders/orders.controller.ts
import { Controller, Get, Post, Body, Patch, Param, Delete, HttpStatus, HttpCode, Query, HttpException, ParseIntPipe, Res } from '@nestjs/common';
import { Response } from 'express';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { OrderStatus } from './enums/order-status.entity';
import { PaymentOrderDto } from './dto/payment-order.dto';

@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    // ========== مدیریت سفارش‌ها ==========

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
    async findByUser(@Param('userId', ParseIntPipe) userId: number) {
        const orders = await this.ordersService.findByUser(userId);
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
    async findOne(@Param('id', ParseIntPipe) id: number) {
        const order = await this.ordersService.findOne(id);
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: `سفارش با شناسه ${id} با موفقیت دریافت شد`,
            data: order,
        };
    }

    // بروزرسانی سفارش
    @Patch(':id')
    async update(@Param('id', ParseIntPipe) id: number, @Body() updateOrderDto: UpdateOrderDto) {
        const order = await this.ordersService.update(id, updateOrderDto);
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
        @Param('id', ParseIntPipe) id: number,
        @Body('status') status: OrderStatus,
    ) {
        const order = await this.ordersService.updateStatus(id, status);
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: `وضعیت سفارش با شناسه ${id} با موفقیت به ${status} تغییر یافت`,
            data: order,
        };
    }

    // لغو سفارش
    @Patch(':id/cancel')
    async cancelOrder(@Param('id', ParseIntPipe) id: number) {
        const order = await this.ordersService.updateStatus(id, OrderStatus.CANCELLED);
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: `سفارش با شناسه ${id} با موفقیت لغو شد`,
            data: order,
        };
    }

    // حذف سفارش
    @Delete(':id')
    async remove(@Param('id', ParseIntPipe) id: number) {
        const result = await this.ordersService.remove(id);
        return {
            statusCode: HttpStatus.OK,
            success: true,
            message: result.message,
        };
    }

    // ========== فرآیند پرداخت ==========

    // مرحله 1: شروع پرداخت (API برای فرانت‌اند)
    @Post('start-payment')
    async startPayment(@Body() paymentOrderDto: PaymentOrderDto) {
        const result = await this.ordersService.startPayment(
            paymentOrderDto.order_id,
            paymentOrderDto.amount
        );

        if (result && result.trackId) {
            return {
                statusCode: HttpStatus.OK,
                success: true,
                data: result,
                message: 'درخواست پرداخت با موفقیت ثبت شد'
            };
        } else {
            throw new HttpException('خطا در ایجاد لینک پرداخت', HttpStatus.BAD_REQUEST);
        }
    }

    // مرحله 2: بازگشت از درگاه (callback زبال)
    @Get('callback-payment')
    async callbackPayment(
        @Query('trackId') trackId: string,
        @Query('order_id') order_id: string,
        @Res() res: any  // ← استفاده از any
    ) {
        const result = await this.ordersService.verifyPayment(trackId, order_id ? parseInt(order_id) : undefined);

        if (result.success && result.status === 'paid') {
            return res.redirect(`http://localhost:3000/success-payment?order_id=${result.order_id}`);
        } else {
            return res.redirect(`http://localhost:3000/failed-payment?order_id=${result.order_id || order_id}`);
        }
    }

    // مرحله 3: تایید پرداخت (API برای بررسی وضعیت)
    @Post('verify-payment')
    async verifyPayment(@Body() body: { trackId: string; order_id?: number }) {
        const result = await this.ordersService.verifyPayment(body.trackId, body.order_id);
        return {
            statusCode: result.success ? HttpStatus.OK : HttpStatus.BAD_REQUEST,
            success: result.success,
            data: result,
            message: result.message,
        };
    }

    // مرحله 4: دریافت وضعیت پرداخت یک سفارش
    @Get(':id/payment-status')
    async getPaymentStatus(@Param('id', ParseIntPipe) id: number) {
        const result = await this.ordersService.getPaymentStatus(id);
        return {
            statusCode: HttpStatus.OK,
            success: true,
            data: result,
            message: 'وضعیت پرداخت با موفقیت دریافت شد',
        };
    }
}