import {Module} from "@nestjs/common";
import { AccountController } from './controller/account.controller';
import {Account} from "./entity/account.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AccountService} from "./service/account.service";
import {Transaction} from "./entity/transaction.entity";
import {TransactionService} from "./service/transaction.service";
import {TransactionController} from "./controller/transaction.controller";


@Module({
    imports: [TypeOrmModule.forFeature([Account, Transaction])],
    providers: [AccountService, TransactionService],
    controllers: [AccountController, TransactionController]
})
export class AccountModule {}
