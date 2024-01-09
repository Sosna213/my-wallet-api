import {
    Body,
    Controller,
    DefaultValuePipe,
    Delete,
    Get,
    Param,
    ParseIntPipe,
    Post, Query,
    Req,
    UseGuards
} from '@nestjs/common';
import {Request} from "express";
import {AccountService} from "../service/account.service";
import {AuthorizationGuard} from "../../../authorization/authorization.guard";
import {CreateAccountDTO} from "../DTO/create-account.dto";
import {Account} from "../entity/account.entity";
import {IPaginationOptions, Pagination} from "nestjs-typeorm-paginate";

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
    getAccountsForUser(@Req() request: Request,
                       @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
                       @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 1,): Promise<Pagination<Account>> {
        const userId = request.auth.payload.sub;
        const options: IPaginationOptions = {
            limit,
            page,
        };

        return this.accountService.getAccountsForUser(options, userId);
    }

    @UseGuards(AuthorizationGuard)
    @Delete('/delete/:id')
    deleteAccountById(@Req() request: Request, @Param('id') id) {
        const userId = request.auth.payload.sub;

        return {response: this.accountService.deleteAccountById(userId, id), deletedId: id};
    }

}
