import {Body, Controller, Delete, Get, Param, Post, Req, UseGuards} from '@nestjs/common';
import {Request} from "express";
import {AccountService} from "../service/account.service";
import {AuthorizationGuard} from "../../../authorization/authorization.guard";
import {CreateAccountDTO} from "../DTO/create-account.dto";

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

    @UseGuards(AuthorizationGuard)
    @Get('/user-accounts')
    getAccountsForUser(@Req() request: Request){
        const userId = request.auth.payload.sub;

        return this.accountService.getAccountsForUser(userId);
    }
    @UseGuards(AuthorizationGuard)
    @Delete('/delete/:id')
    deleteAccountById(@Req() request: Request, @Param('id') id){
        const userId = request.auth.payload.sub;

        return {response: this.accountService.deleteAccountById(userId, id), deletedId: id};
    }

}
