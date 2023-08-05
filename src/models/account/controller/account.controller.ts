import {Body, Controller, Post, Req, UseGuards} from '@nestjs/common';
import {Request} from "express";
import {AccountService} from "../service/account.service";
import {AuthorizationGuard} from "../../../authorization/authorization.guard";
import {CreateAccountDTO} from "../DTO/account.dto";

@Controller('account')
export class AccountController {

    constructor(private accountService: AccountService) {
    }

    @UseGuards(AuthorizationGuard)
    @Post()
    createAccount(@Body() account: CreateAccountDTO, @Req() request: Request) {
        const userId = request.auth.payload.sub;

        return this.accountService.createAccount(account, userId);
    }
}
