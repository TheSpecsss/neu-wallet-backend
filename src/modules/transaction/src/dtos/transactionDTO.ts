import type {
	TransactionStatusKind,
	TransactionTypeKind,
} from "@/modules/transaction/src/domain/shared/constant";
import type { TransactionHydrateOption } from "@/modules/transaction/src/repositories/transactionRepository";
import type { UserAccountTypeKind } from "@/modules/user/src/domain/shared/constant";
import type { OrderBy } from "@/shared/constant";

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

export interface GetTransactionsByFilterAndPaginationDTO {
	perPage: number;
	page: number;
	userId: string;
	hydrate?: TransactionHydrateOption;
	orderBy?: OrderBy;
	filter?: {
		startDate?: Date;
		endDate?: Date;
		types?: TransactionTypeKind[];
		accountTypes?: UserAccountTypeKind[];
		status?: TransactionStatusKind[];
		id?: string;
		name?: string;
		email?: string;
	};
}
