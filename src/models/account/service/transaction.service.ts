import {Injectable} from '@nestjs/common';
import {InjectRepository} from "@nestjs/typeorm";
import {DataSource, DeleteResult, Repository} from "typeorm";
import {Transaction} from "../entity/transaction.entity";
import {CreateTransactionDTO} from "../DTO/CreateTransactionDTO";
import {IPaginationOptions, paginate, Pagination} from "nestjs-typeorm-paginate";
import {TransactionsFilters} from "../../../../my-wallet-shared-types/shared-types";
import {Account} from '../entity/account.entity';
import {User} from "../../user/entity/user.entity";


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

    async deleteTransactionById(userId: string, transactionId: string): Promise<DeleteResult> {
        return this.transactionRepository.delete({id: transactionId, user: {id: userId}})
    }

    async getTransactionsForUser(options: IPaginationOptions, userId: string, filters?: TransactionsFilters): Promise<Pagination<Transaction>> {
        const qb = this.transactionRepository.createQueryBuilder('transaction').leftJoin('transaction.account', 'account').where("transaction.user_Id = :id", {id: userId});
        if (filters) {
            if (filters.accountId && filters.accountId.length > 0) {
                qb.andWhere('transaction.accountId IN (:...accountIds)', { accountIds: filters.accountId });
            }
            if (filters.category && filters.category.length > 0) {
                qb.andWhere('transaction.category IN (:...categories)', { categories: filters.category });
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

        return paginate<Transaction>(qb, options);
    }
}
