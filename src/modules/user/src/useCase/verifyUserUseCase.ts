import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { VerifyUserDTO } from "@/modules/user/src/dtos/userDTO";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";

export class VerifyUserUseCase {
	private readonly _userRepository: IUserRepository;

	constructor(userRepository: IUserRepository = new UserRepository()) {
		this._userRepository = userRepository;
	}

	public async execute(request: VerifyUserDTO): Promise<IUser> {
		const { userId } = request;

		const user = await this._getUserById(userId);

		user.updateIsVerified(true);

		const updatedUser = await this._updateUser(user);

		return updatedUser;
	}

	private async _getUserById(userId: string): Promise<IUser> {
		const user = await this._userRepository.findUserById(userId);
		if (user === null) {
			throw new Error(`User ${userId} does not exist`);
		}

		if (user.isVerified) {
			throw new Error(`User ${userId} already verified`);
		}

		return user;
	}

	private async _updateUser(user: IUser): Promise<IUser> {
		const updatedUser = await this._userRepository.updateUser(user);
		if (!updatedUser) {
			throw new Error("Something went wrong while updating user");
		}

		return updatedUser;
	}
}
