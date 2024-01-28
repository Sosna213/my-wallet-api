export type TransactionsExpensesGroupedByCategory = {
    transactionsGroupedByCategory: {
        category: string;
        amount: number;
    }[],
    accounts: {
        id: string;
        key: string;
    }[];
}

export type TransactionsExpensesByMonth = {
    incomingTransactionsGroupedByMonth: {
        year: string;
        month: string;
        amount: number;
    }[],
    outgoingTransactionsGroupedByMonth: {
        year: string;
        month: string;
        amount: number;
    }[],
    accounts: {
        id: string;
        key: string;
    }[];
}

