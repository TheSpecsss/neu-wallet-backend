import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import type { GetRecentTransactionsByUserIdDTO } from "@/modules/transaction/src/dtos/transactionDTO";
import {
	type ITransactionRepository,
	TransactionRepository,
} from "@/modules/transaction/src/repositories/transactionRepository";
import { type IUserService, UserService } from "@/modules/user/src";

export interface GetRecentTransactionsByUserIdResponseUseCase {
	transactions: ITransaction[];
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	page: number;
	totalPages: number;
}

export class GetRecentTransactionsByUserIdUseCase {
	private _transactionRepository: ITransactionRepository;
	private _userService: IUserService;

	constructor(
		transactionRepository = new TransactionRepository(),
		userService = new UserService(),
	) {
		this._transactionRepository = transactionRepository;
		this._userService = userService;
	}

	public async execute(
		dto: GetRecentTransactionsByUserIdDTO,
	): Promise<GetRecentTransactionsByUserIdResponseUseCase> {
		const { userId, perPage, page, hydrate } = dto;

		await this._ensureUserDoesExist(userId);

		const transactions = await this._transactionRepository.getTransactionsByPagination(
			userId,
			{
				start: (page - 1) * perPage,
				size: perPage,
			},
			hydrate,
		);

		const totalPages = await this._transactionRepository.getTransactionsByUserIdTotalPages(
			userId,
			perPage,
		);

		return {
			transactions,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
			page,
			totalPages,
		};
	}

	private async _ensureUserDoesExist(userId: string): Promise<void> {
		const user = await this._userService.findUserById({ userId });
		if (!user) {
			throw new Error(`User ${userId} does not exist`);
		}
	}
}
