import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { FindUserByEmailDTO } from "@/modules/user/src/dtos/userDTO";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";

export class FindUserByEmailUseCase {
	private _userRepository: IUserRepository;

	constructor(userRepository = new UserRepository()) {
		this._userRepository = userRepository;
	}

	public async execute({ email }: FindUserByEmailDTO): Promise<IUser | null> {
		return await this._userRepository.findUserByEmail(email);
	}
}
