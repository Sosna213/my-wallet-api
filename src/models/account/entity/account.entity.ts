import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, OneToMany} from 'typeorm';
import {User} from "../../user/entity/user.entity";
import {Transaction} from "./transaction.entity";

@Entity()
export class Account {

    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column({nullable: false})
    name: string;
    @Column({default: 0})
    balance: number;
    @Column({default: 0})
    startingBalance: number;
    @Column({nullable: false})
    currency: string;

    @ManyToOne(() => User, (user) => user.accounts, {onDelete: "CASCADE"})
    @JoinColumn({name: 'user_id'})
    user: User;

    @OneToMany(() => Transaction, (transaction) => transaction.account)
    transactions: Transaction[];

}
