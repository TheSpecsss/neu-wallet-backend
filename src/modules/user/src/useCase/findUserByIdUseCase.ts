import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { FindUserByIdDTO } from "@/modules/user/src/dtos/userDTO";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";

export class FindUserByIdUseCase {
	private _userRepository: IUserRepository;

	constructor(userRepository = new UserRepository()) {
		this._userRepository = userRepository;
	}

	public async execute(request: FindUserByIdDTO): Promise<IUser | null> {
		const { userId, options, hydrate } = request;

		return await this._userRepository.findUserById(userId, options, hydrate);
	}
}
