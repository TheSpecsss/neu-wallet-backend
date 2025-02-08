import type { IUser } from "@/modules/user/src/domain/classes/user";
import {
	type IUserRepository,
	type UserHydrateOption,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import type { QueryOptions } from "@/shared/constant";

export class FindUserByIdUseCase {
	private _userRepository: IUserRepository;

	constructor(userRepository = new UserRepository()) {
		this._userRepository = userRepository;
	}

	public async execute(
		userId: string,
		options?: QueryOptions,
		hydrate?: UserHydrateOption,
	): Promise<IUser | null> {
		return await this._userRepository.findUserById(userId, options, hydrate);
	}
}
