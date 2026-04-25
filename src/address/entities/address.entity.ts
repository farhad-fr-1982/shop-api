import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { User } from 'src/users/entities/user.entity';

@Entity()
export class Address {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    province: string;  // ✅ درست - نه privince

    @Column()
    city: string;

    @Column()
    address: string;

    @Column({ name: 'postal_code' })
    postal_code: string;

    @Column({ name: 'receiver_mobile' })
    receiver_mobile: string;  // ✅ درست - نه reciver_mobile

    @Column({ nullable: true })
    description: string;

    @CreateDateColumn({ name: 'createdAt' })
    createdAt: Date;

    @UpdateDateColumn({ name: 'updatedAt' })
    updatedAt: Date;

    @ManyToOne(() => User, (user) => user.addresses)
    user: User;
}