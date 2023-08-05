import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {Repository} from "typeorm";
import {Account} from "../entity/account.entity";
import {CreateAccountDTO} from "../DTO/account.dto";

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
            userId: userId,
        });
    }
    async getAllAccounts(){
        return await this.accountRepository.find();
    }
}
