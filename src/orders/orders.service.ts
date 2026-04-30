// src/orders/orders.service.ts
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
    ) {}

    // ایجاد سفارش جدید
    async create(createOrderDto: CreateOrderDto): Promise<Order> {
        // بررسی وجود کاربر
        const user = await this.userRepository.findOne({
            where: { id: createOrderDto.userId }
        });
        if (!user) {
            throw new NotFoundException('کاربر یافت نشد');
        }

        // بررسی وجود آدرس
        const address = await this.addressRepository.findOne({
            where: { id: createOrderDto.addressId }
        });
        if (!address) {
            throw new NotFoundException('آدرس یافت نشد');
        }

        let calculatedTotalPrice = 0;
        const orderItems: OrderItem[] = [];

        // بررسی محصولات و محاسبه قیمت
        for (const item of createOrderDto.items) {
            const product = await this.productRepository.findOne({
                where: { id: item.productId }
            });

            if (!product) {
                throw new NotFoundException(`محصول با شناسه ${item.productId} یافت نشد`);
            }

            if (product.stock < item.quantity) {
                throw new BadRequestException(`موجودی محصول ${product.title} کافی نیست`);
            }

            // محاسبه قیمت کل
            calculatedTotalPrice += Number(product.price) * item.quantity;

            // ایجاد آیتم سفارش
            const orderItem = this.orderItemRepository.create({
                product: product,
                quantity: item.quantity,
            });

            orderItems.push(orderItem);

            // کاهش موجودی محصول
            product.stock -= item.quantity;
            await this.productRepository.save(product);
        }

        // اعمال تخفیف
        let finalPrice = calculatedTotalPrice;
        if (createOrderDto.discount) {
            finalPrice = calculatedTotalPrice - (calculatedTotalPrice * createOrderDto.discount / 100);
        }

        // ایجاد سفارش
        const order = this.orderRepository.create({
            user: user,
            address: address,
            total_price: finalPrice,
            discount_code: createOrderDto.discount ? String(createOrderDto.discount) : null,
            status: createOrderDto.status || OrderStatus.PENDING,
            payed_time: createOrderDto.paid_time,
            items: orderItems,
        });

        // ذخیره سفارش
        const savedOrder = await this.orderRepository.save(order);

        // ذخیره آیتم‌های سفارش
        for (const item of orderItems) {
            item.order = savedOrder;
            await this.orderItemRepository.save(item);
        }

        return savedOrder;
    }

    // دریافت همه سفارش‌ها
    async findAll(): Promise<Order[]> {
        return await this.orderRepository.find({
            relations: ['user', 'address', 'items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }

    // دریافت یک سفارش با شناسه
    async findOne(id: number): Promise<Order> {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: ['user', 'address', 'items', 'items.product'],
        });

        if (!order) {
            throw new NotFoundException(`سفارش با شناسه ${id} یافت نشد`);
        }

        return order;
    }

    // دریافت سفارش‌های یک کاربر
    async findByUser(userId: number): Promise<Order[]> {
        const user = await this.userRepository.findOne({
            where: { id: userId }
        });
        if (!user) {
            throw new NotFoundException('کاربر یافت نشد');
        }

        return await this.orderRepository.find({
            where: { user: { id: userId } },
            relations: ['address', 'items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }

    // دریافت سفارش‌ها بر اساس وضعیت
    async findByStatus(status: OrderStatus): Promise<Order[]> {
        return await this.orderRepository.find({
            where: { status },
            relations: ['user', 'address', 'items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }

    // دریافت سفارش‌های یک بازه زمانی
    async findByDateRange(startDate: Date, endDate: Date): Promise<Order[]> {
        return await this.orderRepository.find({
            where: {
                createdAt: Between(startDate, endDate),
            },
            relations: ['user', 'address', 'items', 'items.product'],
            order: { createdAt: 'DESC' },
        });
    }

    // بروزرسانی سفارش
    async update(id: number, updateOrderDto: UpdateOrderDto): Promise<Order> {
        const order = await this.findOne(id);

        if (updateOrderDto.status) {
            order.status = updateOrderDto.status;
        }

        if (updateOrderDto.addressId) {
            const address = await this.addressRepository.findOne({
                where: { id: updateOrderDto.addressId }
            });
            if (!address) {
                throw new NotFoundException('آدرس یافت نشد');
            }
            order.address = address;
        }

        if (updateOrderDto.payed_time) {
            order.payed_time = updateOrderDto.payed_time;
        }

        return await this.orderRepository.save(order);
    }

    // بروزرسانی وضعیت سفارش
    async updateStatus(id: number, status: OrderStatus): Promise<Order> {
        const order = await this.findOne(id);
        order.status = status;
        return await this.orderRepository.save(order);
    }

    // حذف سفارش
    async remove(id: number): Promise<{ message: string }> {
        const order = await this.findOne(id);

        // برگرداندن موجودی محصولات
        for (const item of order.items) {
            const product = await this.productRepository.findOne({
                where: { id: item.product.id }
            });
            if (product) {
                product.stock += item.quantity;
                await this.productRepository.save(product);
            }
        }

        await this.orderRepository.remove(order);
        return { message: `سفارش با شناسه ${id} با موفقیت حذف شد` };
    }

    // محاسبه مجموع فروش
    async getTotalSales(): Promise<number> {
        const result = await this.orderRepository
            .createQueryBuilder('order')
            .select('SUM(order.total_price)', 'total')
            .where('order.status != :status', { status: OrderStatus.CANCELLED })
            .getRawOne();
        
        return result?.total || 0;
    }

    // آمار سفارش‌ها
    async getOrderStats(): Promise<any> {
        const totalOrders = await this.orderRepository.count();
        const pendingOrders = await this.orderRepository.count({ where: { status: OrderStatus.PENDING } });
        const completedOrders = await this.orderRepository.count({ where: { status: OrderStatus.COMPLETED } });
        const cancelledOrders = await this.orderRepository.count({ where: { status: OrderStatus.CANCELLED } });
        const totalSales = await this.getTotalSales();

        return {
            totalOrders,
            pendingOrders,
            completedOrders,
            cancelledOrders,
            totalSales,
        };
    }
}