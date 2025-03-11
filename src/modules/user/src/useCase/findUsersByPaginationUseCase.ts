import type { IUser } from "@/modules/user/src/domain/classes/user";
import { UserRoleManagementService } from "@/modules/user/src/domain/services/userRoleManagementService";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import type { FindUsersByPaginationDTO } from "@/modules/user/src/dtos/userDTO";
import { UserRepository } from "@/modules/user/src/repositories/userRepository";

export interface FindUsersByPaginationResponseDTO {
	users: IUser[];
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	page: number;
	totalPages: number;
}

export class FindUsersByPaginationUseCase {
	constructor(
		private _userRepository = new UserRepository(),
		private _userRoleManagementService = new UserRoleManagementService(),
	) {}

	public async execute(dto: FindUsersByPaginationDTO): Promise<FindUsersByPaginationResponseDTO> {
		const { perPage, page, userId } = dto;

		await this._ensureUserHaveAdminPermission(userId);

		const users = await this._userRepository.findUsersByPagination(
			{
				start: (page - 1) * perPage,
				size: perPage,
			},
			{ includeDeleted: false },
		);

		const totalPages = await this._userRepository.getUsersTotalPages(perPage);

		return {
			users,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
			page,
			totalPages,
		};
	}

	private async _ensureUserHaveAdminPermission(userId: string): Promise<void> {
		const hasPermission = await this._userRoleManagementService.hasPermission(
			userId,
			USER_ACCOUNT_TYPE.ADMIN,
		);

		if (!hasPermission) {
			throw new Error(`User ${userId} does not have admin permission`);
		}
	}
}
