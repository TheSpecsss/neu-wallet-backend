import type { IUser } from "@/modules/user/src/domain/classes/user";
import type { LoginUserDTO } from "@/modules/user/src/dtos/userDTO";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class LoginUserUseCase {
	private readonly _userRepository: IUserRepository;

	constructor(userRepository: IUserRepository = new UserRepository()) {
		this._userRepository = userRepository;
	}

	public async execute(request: LoginUserDTO): Promise<{ token: string }> {
		const { email, password } = request;

		const user = await this._getUserByEmail(email);

		await this._comparePassword(password, user.password);

		const token = this._createToken(user.emailValue, user.password);

		return { token };
	}

	private async _getUserByEmail(email: string): Promise<IUser> {
		const user = await this._userRepository.findUserByEmail(email);
		if (user === null) {
			throw new Error(`Email '${email}' does not exist`);
		}

		return user;
	}

	private async _comparePassword(rawPassword: string, hashPassword: string): Promise<void> {
		const comparedPassword = await bcrypt.compare(rawPassword, hashPassword);
		if (!comparedPassword) {
			throw new Error("Invalid password");
		}
	}

	private _createToken(email: string, password: string): string {
		return jwt.sign({ email, password }, process.env.JWT_SECRET as string);
	}
}
