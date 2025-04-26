import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import type { GetCashierTransactionsByPaginationDTO } from "@/modules/transaction/src/dtos/transactionDTO";
import { TransactionRepository } from "@/modules/transaction/src/repositories/transactionRepository";

export interface GetCashierTopUpTransactionsByPaginationResponseUseCase {
	transactions: ITransaction[];
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	page: number;
	totalPages: number;
}

export class GetCashierTopUpTransactionsByPaginationUseCase {
	constructor(private _transactionRepository = new TransactionRepository()) {}

	public async execute(
		dto: GetCashierTransactionsByPaginationDTO,
	): Promise<GetCashierTopUpTransactionsByPaginationResponseUseCase> {
		const { perPage, page, hydrate } = dto;

		const transactions = await this._transactionRepository.getCashierTopUpTransactionsByPagination(
			{
				start: (page - 1) * perPage,
				size: perPage,
			},
			hydrate,
		);

		const totalPages =
			await this._transactionRepository.getCashierTopUpTransactionsTotalPages(perPage);

		return {
			transactions,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
			page,
			totalPages,
		};
	}
}
