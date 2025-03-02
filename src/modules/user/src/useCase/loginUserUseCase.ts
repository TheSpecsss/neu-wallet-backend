import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { LoginUserDTO } from "@/modules/user/src/dtos/userDTO";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import { comparePassword } from "@/shared/infrastructure/authentication/comparePassword";
import { createToken } from "@/shared/infrastructure/authentication/createToken";

export class LoginUserUseCase {
	private readonly _userRepository: IUserRepository;

	constructor(userRepository: IUserRepository = new UserRepository()) {
		this._userRepository = userRepository;
	}

	public async execute(request: LoginUserDTO): Promise<{ token: string }> {
		const { email, password } = request;

		const user = await this._getUserByEmail(email);

		await this._comparePassword(password, user.password);

		const token = createToken(user.emailValue, user.password);

		return { token };
	}

	private async _getUserByEmail(email: string): Promise<IUser> {
		const user = await this._userRepository.findUserByEmail(email);
		if (user === null) {
			throw new Error(`Email '${email}' does not exist`);
		}

		if (!user.isVerified) {
			throw new Error(`Email ${email} not verified`);
		}

		return user;
	}

	private async _comparePassword(rawPassword: string, hashPassword: string): Promise<void> {
		const comparedPassword = await comparePassword(rawPassword, hashPassword);
		if (!comparedPassword) {
			throw new Error("Invalid password");
		}
	}
}
