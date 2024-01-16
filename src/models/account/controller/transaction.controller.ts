import {
    Body,
    Controller, DefaultValuePipe, Delete, Get, Param, ParseIntPipe, Post, Query, Req, UseGuards,
} from '@nestjs/common';
import {TransactionService} from "../service/transaction.service";
import {ApiTags} from "@nestjs/swagger";
import {Request} from "express";
import {CreateTransactionDTO} from "../DTO/CreateTransactionDTO";
import {AuthorizationGuard} from "../../../authorization/authorization.guard";
import {IPaginationOptions, Pagination} from "nestjs-typeorm-paginate";
import {Transaction} from "../entity/transaction.entity";
import {TransactionsFilters} from "../../../../my-wallet-shared-types/shared-types";

@ApiTags('transaction')
@Controller('transaction')
export class TransactionController {

    constructor(private transactionService: TransactionService) {
    }

    @UseGuards(AuthorizationGuard)
    @Post()
    createTransaction(@Body() transaction: CreateTransactionDTO, @Req() request: Request) {
        const userId = request.auth.payload.sub;

        return this.transactionService.createTransaction(transaction, userId);
    }

    @UseGuards(AuthorizationGuard)
    @Delete('/delete/:id')
    deleteAccountById(@Req() request: Request, @Param('id') id) {
        const userId = request.auth.payload.sub;

        return {response: this.transactionService.deleteTransactionById(userId, id), deletedId: id};
    }

    @UseGuards(AuthorizationGuard)
    @Get('/user-transactions')
    getTransactionsForUser(@Req() request: Request,
                           @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number = 1,
                           @Query('limit', new DefaultValuePipe(10), ParseIntPipe) limit: number = 1,
                           @Query('accountId') accountId?: string[],
                           @Query('transactionName') transactionName?: string,
                           @Query('category') category?: string[],
                           @Query('eq') eq?: number,
                           @Query('gte') gte?: number,
                           @Query('lte') lte?: number,
                           @Query('fromDate') fromDate?: string,
                           @Query('toDate') toDate?: string,
    ): Promise<Pagination<Transaction>> {
        const userId = request.auth.payload.sub;
        const options: IPaginationOptions = {
            limit,
            page,
        };
        const filters: TransactionsFilters = {
            transactionName,
            accountId,
            category,
            eq,
            gte,
            lte,
            fromDate,
            toDate,
        };

        return this.transactionService.getTransactionsForUser(options, userId, filters);
    }


}
