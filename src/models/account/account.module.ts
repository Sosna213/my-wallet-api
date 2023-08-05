import {Module} from "@nestjs/common";
import { AccountController } from './controller/account.controller';
import {Account} from "./entity/account.entity";
import {TypeOrmModule} from "@nestjs/typeorm";
import {AccountService} from "./service/account.service";


@Module({
    imports: [TypeOrmModule.forFeature([Account])],
    providers: [AccountService],
    controllers: [AccountController]
})
export class AccountModule {}
