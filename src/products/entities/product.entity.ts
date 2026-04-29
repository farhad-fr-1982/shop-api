import { Category } from "src/categories/entities/category.entity";
import { Column, CreateDateColumn, Entity, JoinTable, ManyToMany, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { BookmarkProduct } from "./product-bookmark.entity";
import { User } from "src/users/entities/user.entity";

@Entity('products')
export class Product {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    title: string

    @Column({ nullable: false })
    description: string

    @Column({ nullable: false })
    price: number

    @Column({ nullable: false })
    stock: number

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;

    @ManyToMany(() => Category, (category) => category.products)
    @JoinTable({
        name: 'product_category',
        joinColumn: { name: 'product_id', referencedColumnName: 'id' },
        inverseJoinColumn: { name: 'category_id', referencedColumnName: 'id' }
    })
    categories: Category[]

    @ManyToMany(() => User, (user) => user.basket_items)
    baskets: User[]

    @OneToMany(() => BookmarkProduct, (bookmark) => bookmark.product)
    bookmarks: BookmarkProduct[];
}
