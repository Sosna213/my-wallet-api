import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm';
import {User} from "../../user/entity/user.entity";

@Entity()
export class Account {

    @PrimaryGeneratedColumn()
    id: number;
    @Column({nullable: false})
    name: string;
    @Column({default: 0})
    balance: number;
    @Column({nullable: false})
    currency: string;
    @Column({nullable: false})
    userId: string;

    @ManyToOne(() => User, (user) => user.accounts, {onDelete: "CASCADE"})
    @JoinColumn()
    user: User;

}
