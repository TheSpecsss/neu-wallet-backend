import type { IUser } from "@/modules/user/src/domain/classes/user";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import type { QueryOptions } from "@/shared/constant";

export class FindUsersByIdsUseCase {
	private _userRepository: IUserRepository;

	constructor(userRepository = new UserRepository()) {
		this._userRepository = userRepository;
	}

	public async execute(userIds: string[], options?: QueryOptions): Promise<IUser[]> {
		return await this._userRepository.findUsersByIds(userIds, options);
	}
}
