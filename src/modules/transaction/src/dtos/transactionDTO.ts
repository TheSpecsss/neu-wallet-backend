import type { TransactionHydrateOption } from "@/modules/transaction/src/repositories/transactionRepository";

export interface GetRecentTransactionsByUserIdDTO {
	userId: string;
	perPage: number;
	page: number;
	hydrate?: TransactionHydrateOption;
}

export interface GetCashierTransactionsByPaginationDTO {
	perPage: number;
	page: number;
	hydrate?: TransactionHydrateOption;
}
