import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { LoginUserDTO } from "@/modules/user/src/dtos/userDTO";
import { UserRepository } from "@/modules/user/src/repositories/userRepository";
import { comparePassword } from "@/shared/infrastructure/authentication/comparePassword";
import { createToken } from "@/shared/infrastructure/authentication/createToken";

export class LoginUserUseCase {
	constructor(private _userRepository = new UserRepository()) {}

	public async execute(request: LoginUserDTO): Promise<{ token: string }> {
		const { email, password } = request;

		const user = await this._getUserByEmail(email);

		await this._comparePassword(password, user.password);

		const token = createToken({
			userId: user.idValue,
			email: user.emailValue,
			accountType: user.accountTypeValue,
		});

		return { token };
	}

	private async _getUserByEmail(email: string): Promise<IUser> {
		const user = await this._userRepository.findUserByEmail(email);
		if (user === null) {
			throw new Error(`${email} does not exist`);
		}

		if (!user.isVerified) {
			throw new Error(`${email} is not yet verified. Please verify your account`);
		}

		return user;
	}

	private async _comparePassword(rawPassword: string, hashPassword: string): Promise<void> {
		const comparedPassword = await comparePassword(rawPassword, hashPassword);
		if (!comparedPassword) {
			throw new Error("Incorrect password. Please try again");
		}
	}
}
