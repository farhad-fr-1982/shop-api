import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class IpRecord {
    @PrimaryGeneratedColumn()
    id: number

    @Column()
    ip: string

    @Column({ type: 'timestamp' })
    WindowStart: Date

    @Column()
    requestCount: number

    @Column({ default: false })
    isBlocked: boolean

    @Column({ type: 'timestamp', nullable: true })
    blockUnit: Date | null

}