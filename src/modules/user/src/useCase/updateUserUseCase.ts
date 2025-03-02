import type { IUser } from "@/modules/user/src/domain/classes/user";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";

export class UpdateUserUseCase {
	private _userRepository: IUserRepository;

	constructor(userRepository = new UserRepository()) {
		this._userRepository = userRepository;
	}

	public async execute(user: IUser): Promise<IUser | null> {
		return await this._userRepository.updateUser(user);
	}
}
