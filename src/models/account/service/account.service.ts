import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Account} from "../entity/account.entity";
import {CreateAccountDTO} from "../DTO/create-account.dto";
import {IPaginationOptions, Pagination, paginate} from "nestjs-typeorm-paginate";
import {CreateTransactionDTO} from "../DTO/CreateTransactionDTO";

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
            startingBalance: accountDTO.balance ?? 0,
            user: {id: userId},
        });
    }
    async updateBalance(transactionDTO: CreateTransactionDTO){
        const account= await this.accountRepository.findOne({where: {id: transactionDTO.accountId}});

        return this.accountRepository.save({
            ...account,
            balance: account.balance + transactionDTO.amount
        })
    }
    async deleteAccountById(userId: string, accountId){
        return this.accountRepository.delete({user: {id: userId}, id: accountId})
    }

    async getAccountsForUser(options: IPaginationOptions, userId: string): Promise<Pagination<Account>> {
        const qb = this.accountRepository.createQueryBuilder('account').where("account.user_id = :id", {id: userId});
        qb.orderBy('account.id', 'DESC');

        return paginate<Account>(qb, options);
    }
}
