// order.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Address } from 'src/address/entities/address.entity';
import { OrderStatus } from '../enums/order-status.entity';

@Entity('orders')
export class Order {
    @PrimaryGeneratedColumn({ type: 'bigint' })
    id: number;

    @ManyToOne(() => User, (user) => user.orders)
    @JoinColumn({ name: 'user_id' })
    user: User;

    @Column({
        type: 'enum',
        enum: OrderStatus,
        default: OrderStatus.PENDING,
    })
    status: OrderStatus;
    
    @Column({ type: 'timestamp', name: 'payed_time', nullable: true })
    payed_time: Date;

    @ManyToOne(() => Address, (address) => address.orders)  // ← این مهم است
    @JoinColumn({ name: 'address_id' })
    address: Address;  // ← اسم این باید 'address' باشد

    @Column({ type: 'bigint', name: 'total_price' })
    total_price: number;

    @Column({ type: 'varchar', name: 'discount_code', nullable: true })
    discount_code: string;

    @CreateDateColumn({ type: 'timestamp', name: 'created_at' })
    createdAt: Date;

    @UpdateDateColumn({ type: 'timestamp', name: 'updated_at' })
    updatedAt: Date;
}