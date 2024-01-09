import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Account} from "../entity/account.entity";
import {CreateAccountDTO} from "../DTO/create-account.dto";
import {IPaginationOptions, Pagination, paginate} from "nestjs-typeorm-paginate";

@Injectable()
export class AccountService {
    constructor(
        @InjectRepository(Account)
        private accountRepository: Repository<Account>) {
    }

    async createAccount(accountDTO: CreateAccountDTO, userId: string) {
        return this.accountRepository.save({
            name: accountDTO.name,
            currency: accountDTO.currency,
            balance: accountDTO.balance ?? 0,
            userId: userId,
        });
    }
    async deleteAccountById(userId: string, accountId){
        return this.accountRepository.delete({userId: userId, id: accountId})
    }

    async getAccountsForUser(options: IPaginationOptions, userId: string): Promise<Pagination<Account>> {
        const qb = this.accountRepository.createQueryBuilder('account').where("account.userId = :id", {id: userId});
        qb.orderBy('account.id', 'DESC');

        return paginate<Account>(qb, options);
    }
}
