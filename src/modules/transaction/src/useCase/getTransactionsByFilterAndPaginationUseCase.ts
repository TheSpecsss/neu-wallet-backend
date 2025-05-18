import type { ITransaction } from "@/modules/transaction/src/domain/classes/transaction";
import type { GetTransactionsByFilterAndPaginationDTO } from "@/modules/transaction/src/dtos/transactionDTO";
import { TransactionRepository } from "@/modules/transaction/src/repositories/transactionRepository";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src";
import { UserRoleManagementService } from "@/modules/user/src/domain/services/userRoleManagementService";

export interface GetTransactionsByFilterAndPaginationResponseUseCase {
	transactions: ITransaction[];
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	page: number;
	totalPages: number;
}

export class GetTransactionsByFilterAndPaginationUseCase {
	constructor(
		private _transactionRepository = new TransactionRepository(),
		private _userRoleManagementService = new UserRoleManagementService(),
	) {}

	public async execute(
		dto: GetTransactionsByFilterAndPaginationDTO,
	): Promise<GetTransactionsByFilterAndPaginationResponseUseCase> {
		const { perPage, page, userId, hydrate, orderBy, filter } = dto;

		const hasAdminPermission = await this._hasAdminPermission(userId);

		const transactions = await this._transactionRepository.getTransactionsByFilterAndPagination({
			pagination: { start: (page - 1) * perPage, size: perPage },
			userId,
			hydrate,
			filter: {
				isAdmin: hasAdminPermission,
				date: { from: filter?.startDate, to: filter?.endDate },
				types: filter?.types,
				accountTypes: filter?.accountTypes,
				status: filter?.status,
				id: filter?.id,
				name: filter?.name,
				email: filter?.email,
			},
			orderBy,
		});

		const totalPages =
			await this._transactionRepository.getTransactionsByFilterAndPaginationTotalPages(
				perPage,
				userId,
				{
					isAdmin: hasAdminPermission,
					date: { from: filter?.startDate, to: filter?.endDate },
					types: filter?.types,
					accountTypes: filter?.accountTypes,
					id: filter?.id,
					name: filter?.name,
					email: filter?.email,
				},
			);

		return {
			transactions,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
			page,
			totalPages,
		};
	}

	private async _hasAdminPermission(userId: string): Promise<boolean> {
		return await this._userRoleManagementService.hasPermission(userId, USER_ACCOUNT_TYPE.ADMIN);
	}
}
