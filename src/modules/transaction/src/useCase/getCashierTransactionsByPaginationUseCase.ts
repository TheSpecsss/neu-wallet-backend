import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import type { GetCashierTransactionsByPaginationDTO } from "@/modules/transaction/src/dtos/transactionDTO";
import { TransactionRepository } from "@/modules/transaction/src/repositories/transactionRepository";

export interface GetCashierTransactionsByPaginationResponseUseCase {
	transactions: ITransaction[];
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	page: number;
	totalPages: number;
}

export class GetCashierTransactionsByPaginationUseCase {
	constructor(private _transactionRepository = new TransactionRepository()) {}

	public async execute(
		dto: GetCashierTransactionsByPaginationDTO,
	): Promise<GetCashierTransactionsByPaginationResponseUseCase> {
		const { perPage, page, hydrate } = dto;

		const transactions = await this._transactionRepository.getCashierTransactionsByPagination(
			{
				start: (page - 1) * perPage,
				size: perPage,
			},
			hydrate,
		);

		const totalPages = await this._transactionRepository.getCashierTransactionsTotalPages(perPage);

		return {
			transactions,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
			page,
			totalPages,
		};
	}
}
