import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { FindUsersWithPaginationDTO } from "@/modules/user/src/dtos/userDTO";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";

export interface FindUsersWithPaginationResponseDTO {
	users: IUser[];
	hasNextPage: boolean;
	hasPreviousPage: boolean;
	page: number;
	totalPages: number;
}

export class FindUsersWithPaginationUseCase {
	private _userRepository: IUserRepository;

	constructor(userRepository = new UserRepository()) {
		this._userRepository = userRepository;
	}

	public async execute(
		dto: FindUsersWithPaginationDTO,
	): Promise<FindUsersWithPaginationResponseDTO> {
		const { perPage, page, options, hydrate } = dto;

		const users = await this._userRepository.findUsersByPagination(
			{ start: (page - 1) * perPage, size: perPage },
			options,
			hydrate,
		);

		const totalPages = await this._userRepository.getUsersTotalPages(
			perPage,
			options?.includeDeleted,
		);

		return {
			users,
			hasNextPage: page < totalPages,
			hasPreviousPage: page > 1,
			page,
			totalPages,
		};
	}
}
