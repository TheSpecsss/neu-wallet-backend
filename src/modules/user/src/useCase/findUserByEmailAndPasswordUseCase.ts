import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { FindUserByEmailAndPasswordDTO } from "@/modules/user/src/dtos/userDTO";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";

export class FindUserByEmailAndPasswordUseCase {
	private _userRepository: IUserRepository;

	constructor(userRepository = new UserRepository()) {
		this._userRepository = userRepository;
	}

	public async execute({ email, password }: FindUserByEmailAndPasswordDTO): Promise<IUser | null> {
		return await this._userRepository.findUserByEmailAndPassword(email, password);
	}
}
