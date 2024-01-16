import {IsDate, IsNotEmpty} from "class-validator";
import {TransactionsCategories} from "../../../../my-wallet-shared-types/shared-consts";

export class CreateTransactionDTO{
    @IsNotEmpty()
    name: string;
    @IsNotEmpty()
    amount: number;
    @IsNotEmpty()
    category: TransactionsCategories;
    @IsNotEmpty()
    @IsDate()
    date: string
    @IsNotEmpty()
    accountId: string
}
