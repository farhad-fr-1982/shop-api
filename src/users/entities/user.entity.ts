import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import UserRoleEnum from '../enums/userRoleEnum';
import { Address } from 'src/address/entities/address.entity';
import { Ticket } from 'src/tickets/entities/ticket.entity';
import { BookmarkProduct } from 'src/products/entities/product-bookmark.entity';
import { Product } from 'src/products/entities/product.entity';
import { Order } from 'src/orders/entities/order.entity';


@Entity({ name: "users" })
export class User {

    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    mobile: string

    @Column({ nullable: false })
    display_name: string

    @Column({ nullable: true })
    password: string

    @Column({ type: 'enum', enum: UserRoleEnum, default: UserRoleEnum.NormalUser })
    role: UserRoleEnum

    @OneToMany(() => Address, (order) => order.user)
    orders: Order[]

     @OneToMany(() => Order, (address) => address.user)
    addresses: Address[]


    @ManyToMany(() => Product, (product) => product.baskets)
    @JoinTable({
        name: 'basket_items',
        joinColumn: { name: 'user_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'product_id', referencedColumnName: 'id' }
    })
    basket_items: Product[]

    @OneToMany(() => Ticket, (ticket) => ticket.user)
    ticket: Ticket[]

    @OneToMany(() => BookmarkProduct, bookmark => bookmark.user)
    bookmarks: BookmarkProduct[]
    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}