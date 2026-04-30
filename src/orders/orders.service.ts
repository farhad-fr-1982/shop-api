// orders.service.ts
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { User } from '../users/entities/user.entity';
import { Address } from '../address/entities/address.entity';
import { Product } from '../products/entities/product.entity';
import { OrderStatus } from './enums/order-status.entity';
import { HttpService } from '@nestjs/axios';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class OrdersService {
    constructor(
        @InjectRepository(Order)
        private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem)
        private orderItemRepository: Repository<OrderItem>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Address)
        private addressRepository: Repository<Address>,
        @InjectRepository(Product)
        private productRepository: Repository<Product>,
        private readonly httpService: HttpService,
    ) { }

    // ========== متدهای اصلی سفارش ==========

    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        const user = await this.userRepository.findOne({
            where: { id: createOrderDto.userId }
        });
        if (!user) throw new NotFoundException('کاربر یافت نشد');

        const address = await this.addressRepository.findOne({
            where: { id: createOrderDto.addressId }
        });
        if (!address) throw new NotFoundException('آدرس یافت نشد');

        let calculatedTotalPrice = 0;
        const orderItems: OrderItem[] = [];

        for (const item of createOrderDto.items) {
            const product = await this.productRepository.findOne({
                where: { id: item.productId }
            });
            if (!product) throw new NotFoundException(`محصول با شناسه ${item.productId} یافت نشد`);
            if (product.stock < item.quantity) throw new BadRequestException(`موجودی محصول ${product.title} کافی نیست`);

            calculatedTotalPrice += Number(product.price) * item.quantity;

            const orderItem = this.orderItemRepository.create({
                product: product,
                quantity: item.quantity,
            });
            orderItems.push(orderItem);

            product.stock -= item.quantity;
            await this.productRepository.save(product);
        }

        let finalPrice = calculatedTotalPrice;
        if (createOrderDto.discount) {
            finalPrice = calculatedTotalPrice - (calculatedTotalPrice * createOrderDto.discount / 100);
        }

        const order = this.orderRepository.create({
            user: user,
            address: address,
            total_price: finalPrice,
            discount_code: createOrderDto.discount ? String(createOrderDto.discount) : null,
            status: createOrderDto.status || OrderStatus.PENDING,
            payed_time: createOrderDto.paid_time,
            items: orderItems,
        });

        const savedOrder = await this.orderRepository.save(order);

        for (const item of orderItems) {
            item.order = savedOrder;
            await this.orderItemRepository.save(item);
        }

        return savedOrder;
    }

    async findAll(): Promise<Order[]> {
        return await this.orderRepository.find({
            relations: ['user', 'address', 'items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: number): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['user', 'address', 'items', 'items.product'],
        });
        if (!order) throw new NotFoundException(`سفارش با شناسه ${id} یافت نشد`);
        return order;
    }

    async findByUser(userId: number): Promise<Order[]> {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user) throw new NotFoundException('کاربر یافت نشد');
        return await this.orderRepository.find({
            where: { user: { id: userId } },
            relations: ['address', 'items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByStatus(status: OrderStatus): Promise<Order[]> {
        return await this.orderRepository.find({
            where: { status },
            relations: ['user', 'address', 'items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
        return await this.orderRepository.find({
            where: { createdAt: Between(startDate, endDate) },
            relations: ['user', 'address', 'items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }

    async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const order = await this.findOne(id);
        if (updateOrderDto.status) order.status = updateOrderDto.status;
        if (updateOrderDto.addressId) {
            const address = await this.addressRepository.findOne({ where: { id: updateOrderDto.addressId } });
            if (!address) throw new NotFoundException('آدرس یافت نشد');
            order.address = address;
        }
        if (updateOrderDto.payed_time) order.payed_time = updateOrderDto.payed_time;
        return await this.orderRepository.save(order);
    }

    async updateStatus(id: number, status: OrderStatus): Promise<Order> {
        const order = await this.findOne(id);
        order.status = status;
        return await this.orderRepository.save(order);
    }

    async remove(id: number): Promise<{ message: string }> {
        const order = await this.findOne(id);
        for (const item of order.items) {
            const product = await this.productRepository.findOne({ where: { id: item.product.id } });
            if (product) {
                product.stock += item.quantity;
                await this.productRepository.save(product);
            }
        }
        await this.orderRepository.remove(order);
        return { message: `سفارش با شناسه ${id} با موفقیت حذف شد` };
    }

    async getTotalSales(): Promise<number> {
        const result = await this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.total_price)', 'total')
            .where('order.status = :status', { status: OrderStatus.COMPLETED })
            .getRawOne();
        return result?.total || 0;
    }

    async getOrderStats(): Promise<any> {
        const totalOrders = await this.orderRepository.count();
        const pendingOrders = await this.orderRepository.count({ where: { status: OrderStatus.PENDING } });
        const completedOrders = await this.orderRepository.count({ where: { status: OrderStatus.COMPLETED } });
        const cancelledOrders = await this.orderRepository.count({ where: { status: OrderStatus.CANCELLED } });
        const totalSales = await this.getTotalSales();
        return { totalOrders, pendingOrders, completedOrders, cancelledOrders, totalSales };
    }

    // orders.service.ts
    async startPayment(order_id: number, amount: number): Promise<any> {
        const order = await this.findOne(order_id);

        if (order.status !== OrderStatus.PENDING) {
            throw new BadRequestException('فقط سفارش‌های در انتظار قابل پرداخت هستند');
        }

        if (Number(order.total_price) !== amount) {
            throw new BadRequestException(`مبلغ پرداختی باید برابر ${order.total_price} تومان باشد`);
        }

        try {
            const response = await lastValueFrom(
                this.httpService.post(
                    'https://gateway.zibal.ir/v1/request',
                    {
                        merchant: 'zibal',  // یا 'test'
                        amount: amount * 10,
                        callbackUrl: `http://localhost:3000/orders/callback-payment?order_id=${order_id}`,
                        description: `پرداخت سفارش شماره ${order_id}`,
                    },
                    {
                        timeout: 30000,  // 30 ثانیه تایم‌اوت
                        headers: {
                            'Content-Type': 'application/json',
                        },
                    }
                )
            );

            const data = response.data;
            console.log('Zibal response:', data);  // لاگ برای دیباگ

            if (data.result === 100) {
                order.payment_track_id = data.trackId;
                await this.orderRepository.save(order);

                return {
                    success: true,
                    order_id: order_id,
                    trackId: data.trackId,
                    payment_url: `https://gateway.zibal.ir/start/${data.trackId}`,
                    message: 'درخواست پرداخت با موفقیت ثبت شد'
                };
            } else {
                throw new BadRequestException(`خطا در درگاه پرداخت: ${data.message} (کد: ${data.result})`);
            }
        } catch (error:any) {
            console.error('Payment error details:', error.response?.data || error.message);

            if (error.code === 'ECONNABORTED') {
                throw new BadRequestException('اتصال به درگاه پرداخت زمان‌بر شد، مجدداً تلاش کنید');
            }

            throw new BadRequestException('خطا در ارتباط با درگاه پرداخت');
        }
    }

    // مرحله 2: تایید پرداخت (بعد از بازگشت از درگاه)
    async verifyPayment(trackId: string, order_id?: number): Promise<any> {
        try {
            const response = await lastValueFrom(
                this.httpService.post('https://gateway.zibal.ir/v1/verify', {
                    merchant: 'zibal',
                    trackId: trackId,
                })
            );

            const data = response.data;

            // پیدا کردن سفارش
            let order: Order | null = null;
            if (order_id) {
                order = await this.findOne(order_id);
            } else {
                order = await this.orderRepository.findOne({
                    where: { payment_track_id: trackId }
                });
            }

            switch (data.result) {
                case 100: // پرداخت موفق
                    if (order) {
                        order.status = OrderStatus.COMPLETED;
                        order.payed_time = new Date();
                        order.payment_date = new Date();
                        await this.orderRepository.save(order);
                    }
                    return {
                        success: true,
                        status: 'paid',
                        message: 'پرداخت با موفقیت انجام شد',
                        order_id: order?.id,
                        trackId: data.trackId,
                        amount: data.amount / 10, // تبدیل به تومان
                        cardNumber: data.cardNumber,
                    };

                case 102: // در انتظار پرداخت
                    return {
                        success: false,
                        status: 'pending',
                        message: 'پرداخت در انتظار تایید است',
                        order_id: order?.id,
                    };

                case 103: // پرداخت انجام نشده
                case 104: // خطای سیستمی
                case 202: // انصراف کاربر
                    if (order && order.status === OrderStatus.PENDING) {
                        order.status = OrderStatus.CANCELLED;
                        await this.orderRepository.save(order);
                    }
                    return {
                        success: false,
                        status: 'failed',
                        message: data.result === 202 ? 'پرداخت ناموفق - انصراف کاربر' : 'پرداخت انجام نشده است',
                        order_id: order?.id,
                    };

                default:
                    return {
                        success: false,
                        status: 'unknown',
                        message: `وضعیت نامشخص: ${data.message}`,
                        resultCode: data.result,
                    };
            }
        } catch (error) {
            console.error('Verify error:', error);
            throw new BadRequestException('خطا در تایید پرداخت');
        }
    }

    // مرحله 3: دریافت وضعیت نهایی پرداخت
    async getPaymentStatus(order_id: number): Promise<any> {
        const order = await this.findOne(order_id);

        return {
            order_id: order.id,
            status: order.status,
            total_price: order.total_price,
            payment_track_id: order.payment_track_id,
            payed_time: order.payed_time,
            payment_date: order.payment_date,
            message: order.status === OrderStatus.COMPLETED
                ? 'پرداخت با موفقیت انجام شده است'
                : order.status === OrderStatus.PENDING
                    ? 'در انتظار پرداخت'
                    : 'پرداخت انجام نشده است'
        };
    }
}