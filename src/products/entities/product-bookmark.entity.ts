import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Product } from './product.entity';
import { User } from 'src/users/entities/user.entity';


@Entity('bookmark_product')
export class BookmarkProduct {
    @PrimaryGeneratedColumn()
    id: number;

    @ManyToOne(() => Product, (product) => product.bookmarks)
    @JoinColumn({ name: 'product_id' })
    product: Product;

    @ManyToOne(() => User, (user) => user.bookmarks)
    @JoinColumn({ name: 'user_id' })
    user: User;

    
}