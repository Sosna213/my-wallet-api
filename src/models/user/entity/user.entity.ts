import {Entity, Column, PrimaryColumn, OneToMany} from 'typeorm';
import {Account} from "../../account/entity/account.entity";

@Entity()
export class User {

    @PrimaryColumn()
    id: string;
    @Column({nullable: false})
    nickname: string;
    @Column({nullable: false})
    email: string;
    @Column({nullable: false})
    name: string;
    @OneToMany(() => Account, (account) => account.user)
    accounts: Account[];
}
