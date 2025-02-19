import type { IUser } from "@/modules/user/src/domain/classes/user";
import { UserFactory } from "@/modules/user/src/domain/factory";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import type { CreateUserDTO } from "@/modules/user/src/dtos/userDTO";
import {
	type IUserRepository,
	UserRepository,
} from "@/modules/user/src/repositories/userRepository";
import type { Result } from "@/shared/core/result";
import bcrypt from "bcrypt";
import { defaultTo } from "rambda";

export class CreateUserUseCase {
	private readonly _userRepository: IUserRepository;

	constructor(userRepository: IUserRepository = new UserRepository()) {
		this._userRepository = userRepository;
	}

	public async execute(request: CreateUserDTO): Promise<IUser> {
		const { email, name, password } = this._getValidatedData(request);

		const hashedPassword = await this._hashPassword(password);

		const user = this._createUser(email, name, hashedPassword);

		this._throwErrorIfUserIsInvalid(user);

		await this._saveUser(user);

		return user.getValue();
	}

	private _getValidatedData(request: CreateUserDTO): CreateUserDTO {
		this._validatePasswordConfirmation(request.password, request.confirmPassword);

		return request;
	}

	private async _hashPassword(password: string): Promise<string> {
		return await bcrypt.hash(password, 10);
	}

	private _createUser(email: string, name: string, password: string): Result<IUser> {
		return UserFactory.create({
			email,
			name,
			password,
			accountType: USER_ACCOUNT_TYPE.USER,
			isDeleted: false,
			deletedAt: null,
			createdAt: new Date(),
			updatedAt: new Date(),
		});
	}

	private async _saveUser(user: Result<IUser>): Promise<void> {
		await this._userRepository.createUser(user.getValue());
	}

	private _validatePasswordConfirmation(password: string, confirmPassword: string): void {
		if (password !== confirmPassword) {
			throw Error("Password and confirm password do not match");
		}
	}

	private _throwErrorIfUserIsInvalid(user: Result<IUser>): void {
		if (user.isFailure) {
			throw Error(defaultTo("Failed to create user", user.getErrorMessage()));
		}
	}
}
