import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {DataSource, DeleteResult, Repository, SelectQueryBuilder} from "typeorm";
import {Transaction} from "../entity/transaction.entity";
import {CreateTransactionDTO} from "../DTO/CreateTransactionDTO";
import {IPaginationOptions, paginate, Pagination} from "nestjs-typeorm-paginate";
import {TransactionsFilters} from "../../../../my-wallet-shared-types/shared-types";
import {Account} from '../entity/account.entity';
import {User} from "../../user/entity/user.entity";
import {TransactionsExpensesByMonth, TransactionsExpensesGroupedByCategory} from "../DTO/transaction.dto";

type PaginationWithFacets<T> = Pagination<T> & {
    facets: {
        currency: { key: string, count: number }[],
        category: { key: string, count: number }[],
        account: { id: string, key: string, count: number }[]
    }
}

@Injectable()
export class TransactionService {
    constructor(
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        private dataSource: DataSource
    ) {
    }

    async createTransaction(transactionDTO: CreateTransactionDTO, userId: string): Promise<Transaction> {

        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const account = await queryRunner.manager.findOne(Account, {where: {id: transactionDTO.accountId}});
            await queryRunner.manager.save(Account, {...account, balance: account.balance + transactionDTO.amount});
            const user = await queryRunner.manager.findOne(User, {where: {id: userId}});
            const transaction: Transaction = new Transaction();
            transaction.user = user;
            transaction.amount = transactionDTO.amount;
            transaction.date = transactionDTO.date;
            transaction.category = transactionDTO.category;
            transaction.name = transactionDTO.name;

            transaction.account = account;
            const result = await queryRunner.manager.save(Transaction, transaction);

            await queryRunner.commitTransaction();
            return result;
        } catch (err) {
            console.error("Cannot create transaction", err)
            await queryRunner.rollbackTransaction();
        } finally {
            await queryRunner.release();
        }
    }

    async createTransactions(transactions: CreateTransactionDTO[], userId: string): Promise<Transaction[]> {
        const queryRunner = this.dataSource.createQueryRunner();

        await queryRunner.connect();
        await queryRunner.startTransaction();

        try {
            const results: Transaction[] = [];

            for (const transactionDTO of transactions) {
                const account = await queryRunner.manager.findOne(Account, {where: {id: transactionDTO.accountId}});
                await queryRunner.manager.save(Account, {...account, balance: account.balance + transactionDTO.amount});

                const user = await queryRunner.manager.findOne(User, {where: {id: userId}});

                const transaction: Transaction = new Transaction();
                transaction.user = user;
                transaction.amount = transactionDTO.amount;
                transaction.date = transactionDTO.date;
                transaction.category = transactionDTO.category;
                transaction.name = transactionDTO.name;
                transaction.account = account;

                const result = await queryRunner.manager.save(Transaction, transaction);
                results.push(result);
            }

            await queryRunner.commitTransaction();
            return results;
        } catch (err) {
            console.error("Cannot create transactions", err);
            await queryRunner.rollbackTransaction();
            throw err;
        } finally {
            await queryRunner.release();
        }
    }

    async deleteTransactionById(userId: string, transactionId: string): Promise<DeleteResult> {
        return this.transactionRepository.delete({id: transactionId, user: {id: userId}})
    }

    async getTransactionsForUser(options: IPaginationOptions, userId: string, filters?: TransactionsFilters): Promise<PaginationWithFacets<Transaction>> {
        const qb: SelectQueryBuilder<Transaction> = this.transactionRepository.createQueryBuilder('transaction').leftJoin('transaction.account', 'account').where("transaction.user_Id = :id", {id: userId});
        const facets = {
            currency: await this.getCurrencyFacet(qb),
            category: await this.getCategoryFacet(qb),
            account: await this.getAccountFacet(qb),
        }
        if (filters) {
            if (filters.accountId && filters.accountId.length > 0) {
                qb.andWhere('transaction.account_Id IN (:...accountIds)', {accountIds: filters.accountId});
            }
            if (filters.category && filters.category.length > 0) {
                qb.andWhere('transaction.category IN (:...categories)', {categories: filters.category});
            }
            if (filters.currency && filters.currency.length > 0) {
                qb.andWhere('account.currency IN (:...currencies)', {currencies: filters.currency});
            }
            if (filters.eq !== undefined) {
                qb.andWhere("transaction.amount = :eq", {eq: filters.eq});
            }
            if (filters.gte !== undefined) {
                qb.andWhere("transaction.amount >= :gte", {gte: filters.gte});
            }
            if (filters.lte !== undefined) {
                qb.andWhere("transaction.amount <= :lte", {lte: filters.lte});
            }
            if (filters.fromDate) {
                qb.andWhere("transaction.date >= :fromDate", {fromDate: filters.fromDate});
            }
            if (filters.toDate) {
                qb.andWhere("transaction.date <= :toDate", {toDate: filters.toDate});
            }
            if (filters.transactionName) {
                qb.andWhere('transaction.name LIKE :transactionName', {transactionName: `%${filters.transactionName}%`});
            }
        }
        qb.addSelect(['account.id', 'account.name', 'account.currency']);
        qb.orderBy('transaction.date', 'DESC');

        const paginatedResult = await paginate<Transaction>(qb, options);

        return {
            ...paginatedResult,
            facets,
        };
    }

    async getTransactionsExpensesGroupedByCategories(userId: string, filters?: TransactionsFilters): Promise<TransactionsExpensesGroupedByCategory> {
        const qb: SelectQueryBuilder<Transaction> = this.transactionRepository.createQueryBuilder('transaction').leftJoin('transaction.account', 'account').where("transaction.user_Id = :id", {id: userId});
        const accountsFroTransactions: { id: string, key: string }[] = await this.getAccountForTransactions(qb);
        qb.andWhere("transaction.amount < 0");
        if (filters) {
            if (filters.accountId && filters.accountId.length > 0) {
                qb.andWhere('transaction.account_Id IN (:...accountIds)', {accountIds: filters.accountId});
            }
            if (filters.fromDate) {
                qb.andWhere("transaction.date >= :fromDate", {fromDate: filters.fromDate});
            }
            if (filters.toDate) {
                qb.andWhere("transaction.date <= :toDate", {toDate: filters.toDate});
            }
        }
        qb.select(['category', 'SUM(amount) as amount'])
        qb.groupBy('category');
        qb.orderBy('amount', 'ASC');
        const categoryGroupedResults = await qb.getRawMany();


        return {
            transactionsGroupedByCategory: categoryGroupedResults.map((r: { amount: number, category: string }) => ({
                category: r.category,
                amount: r.amount,
            })),
            accounts: accountsFroTransactions,
        }

    }

    async getTransactionsExpensesByMonth(userId: string, filters?: TransactionsFilters): Promise<TransactionsExpensesByMonth> {
        const qb: SelectQueryBuilder<Transaction> = this.transactionRepository.createQueryBuilder('transaction')
            .leftJoin('transaction.account', 'account')
            .where("transaction.user_Id = :id", { id: userId });

        const accountsForTransactions: { id: string, key: string }[] = await this.getAccountForTransactions(qb);

        if (filters) {
            if (filters.accountId && filters.accountId.length > 0) {
                qb.andWhere('transaction.account_Id IN (:...accountIds)', { accountIds: filters.accountId });
            }
            if (filters.fromDate) {
                qb.andWhere("transaction.date >= :fromDate", { fromDate: filters.fromDate });
            }
            if (filters.toDate) {
                qb.andWhere("transaction.date <= :toDate", { toDate: filters.toDate });
            }
        }

        const selectCase = (amountAlias: string, condition: string) =>
            `SUM(CASE WHEN ${condition} THEN transaction.amount ELSE 0 END) as ${amountAlias}`;

        qb.select([
            'EXTRACT(MONTH FROM transaction.date) as month',
            'EXTRACT(YEAR FROM "transaction"."date") as year',
            selectCase('incomingAmount', 'transaction.amount > 0'),
            selectCase('outgoingAmount', 'transaction.amount < 0'),
        ]);

        qb.groupBy('month').addGroupBy('year');
        qb.orderBy('year', 'ASC').addOrderBy('month', 'ASC');

        const groupedResults = await qb.getRawMany();

        const incomingTransactionsGroupedByMonth = groupedResults.map((r: { year: string, month: string, incomingamount: number, outgoingamount: number }) => ({
            year: r.year,
            month: r.month,
            amount: r.incomingamount,
        }));

        const outgoingTransactionsGroupedByMonth = groupedResults.map((r: { year: string, month: string, incomingamount: number, outgoingamount: number }) => ({
            year: r.year,
            month: r.month,
            amount: Math.abs(r.outgoingamount),
        }));

        return {
            incomingTransactionsGroupedByMonth,
            outgoingTransactionsGroupedByMonth,
            accounts: accountsForTransactions,
        };
    }

    private async getCategoryFacet(qb: SelectQueryBuilder<Transaction>): Promise<{
        key: string,
        count: number
    }[]> {
        const categoryQb = qb.clone();

        categoryQb.select(['category', 'COUNT(*) as count']);
        categoryQb.groupBy('category')

        const categoryResults = await categoryQb.getRawMany();


        return categoryResults.map((r: { count: number, category: string }) => ({
            key: r.category,
            count: r.count,
        }));

    }

    private async getCurrencyFacet(qb: SelectQueryBuilder<Transaction>): Promise<{
        key: string,
        count: number
    }[]> {
        const currencyQb = qb.clone();

        currencyQb.select(['account.currency', 'COUNT(transaction.id) as count']);
        currencyQb.groupBy('account.currency')

        const currencyResults = await currencyQb.getRawMany();

        return currencyResults.map((r: { count: number, account_currency: string }) => ({
            key: r.account_currency,
            count: r.count,
        }));

    }

    private async getAccountFacet(qb: SelectQueryBuilder<Transaction>): Promise<{
        id: string,
        key: string,
        count: number
    }[]> {
        const accountQb = qb.clone();
        accountQb.select([
            'account.id',
            'account.name',
            'COUNT(transaction.id) as count',
        ]);
        accountQb.groupBy('account.id');
        const accountResults = await accountQb.getRawMany();

        return accountResults.map((r: { account_id: string, account_name: string, count: number }) => ({
            id: r.account_id,
            key: r.account_name,
            count: r.count,
        }));
    }

    private async getAccountForTransactions(qb: SelectQueryBuilder<Transaction>) {
        const accountQb = qb.clone();
        accountQb.select([
            'account.id',
            'account.name',
        ]);
        accountQb.groupBy('account.id');
        const accountResults = await accountQb.getRawMany();

        return accountResults.map((r: { account_id: string, account_name: string, count: number }) => ({
            id: r.account_id,
            key: r.account_name,
        }));
    }
}
