import {Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn} from 'typeorm';
import {User} from "../../user/entity/user.entity";
import {Account} from "./account.entity";
import {TransactionsCategories} from "../../../../my-wallet-shared-types/shared-consts";
@Entity()
export class Transaction {

    @PrimaryGeneratedColumn("uuid")
    id: string;
    @Column({nullable: false})
    name: string;
    @Column({default: 0})
    amount: number;
    @Column({nullable: false})
    category: TransactionsCategories;
    @Column({nullable: false, type: 'date'})
    date: string;

    @ManyToOne(() => User, (user) => user.accounts, {onDelete: "CASCADE"})
    @JoinColumn({name: 'user_id'})
    user: User;

    @ManyToOne(() => Account, (account) => account.transactions, {onDelete: "CASCADE"})
    @JoinColumn({name: 'account_id'})
    account: Account;


}
