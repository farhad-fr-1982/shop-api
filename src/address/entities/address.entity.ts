// address.entity.ts
import { Column, CreateDateColumn, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn, JoinColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';
import { Order } from 'src/orders/entities/order.entity';

@Entity()
export class Address {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    province: string;

    @Column()
    city: string;

    @Column()
    address: string;

    @Column({ name: 'postal_code' })
    postal_code: string;

    @Column({ name: 'receiver_mobile' })
    receiver_mobile: string;

    @Column({ nullable: true })
    description: string;

    @OneToMany(() => Order, (order) => order.address)  // ← اسم 'address' باید با Order هماهنگ باشد
    orders: Order[];

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.addresses)
    @JoinColumn({ name: 'user_id' })
    user: User;
}