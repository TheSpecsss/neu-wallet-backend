import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { FindUsersByIdsDTO } from "@/modules/user/src/dtos/userDTO";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";

export class FindUsersByIdsUseCase {
	private _userRepository: IUserRepository;

	constructor(userRepository = new UserRepository()) {
		this._userRepository = userRepository;
	}

	public async execute(request: FindUsersByIdsDTO): Promise<IUser[]> {
		const { userIds, options, hydrate } = request;

		return await this._userRepository.findUsersByIds(userIds, options, hydrate);
	}
}
