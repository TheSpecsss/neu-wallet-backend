import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { GetUsersByPaginationDTO } from "@/modules/user/src/dtos/userDTO";
import { UserRepository } from "@/modules/user/src/repositories/userRepository";

export interface GetUsersByPaginationResponseDTO {
	users: IUser[];
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	page: number;
	totalPages: number;
}

export class GetUsersByPaginationUseCase {
	constructor(private _userRepository = new UserRepository()) {}

	public async execute(dto: GetUsersByPaginationDTO): Promise<GetUsersByPaginationResponseDTO> {
		const { perPage, page } = dto;

		this._validatePaginationParameters(perPage, page);

		const users = await this._userRepository.getUsersByPagination(
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

	private _validatePaginationParameters(perPage: number, page: number): void {
		if (perPage < 1) {
			throw new Error("perPage must be greater than or equal to 1");
		}
		if (page < 1) {
			throw new Error("page must be greater than or equal to 1");
		}
	}
}
