import { User } from "src/users/entities/user.entity";
import { Column, CreateDateColumn, Entity, ManyToOne, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";

@Entity()
export class Address {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ nullable: false })
    privince: string

    @Column({ nullable: false })
    city: string

    @Column({ nullable: false })
    address: string

    @Column({ length: 10 })
    postal_code: string

    @Column({ length: 11 })
    reciver_mobile: string

    @Column({ nullable: true })
    description: string

    @ManyToOne(()=>User,(user)=>user.addresses)
    user:User

    @CreateDateColumn()
    createdAt: Date

    @UpdateDateColumn()
    updatedAt: Date
}
