import type { IUser } from "@/modules/user/src/domain/classes/user";
import { UserRoleManagementService } from "@/modules/user/src/domain/services/userRoleManagementService";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import type { LoginUserDTO } from "@/modules/user/src/dtos/userDTO";
import { UserRepository } from "@/modules/user/src/repositories/userRepository";
import { comparePassword } from "@/shared/infrastructure/authentication/comparePassword";
import { createToken } from "@/shared/infrastructure/authentication/createToken";

export class LoginUserUseCase {
	constructor(
		private _userRepository = new UserRepository(),
		private _userRoleManagementService = new UserRoleManagementService(),
	) {}

	public async execute(request: LoginUserDTO): Promise<{ token: string; expiresAt: string }> {
		const { email, password } = request;

		const user = await this._getAdminByEmail(email);

		await this._ensureUserHasAdminPermission(user);

		await this._comparePassword(password, user.password);

		return createToken({
			userId: user.idValue,
			email: user.emailValue,
			accountType: user.accountTypeValue,
		});
	}

	private async _getAdminByEmail(email: string): Promise<IUser> {
		const user = await this._userRepository.findUserByEmail(email);
		if (user === null) {
			throw new Error(`${email} does not exist`);
		}

		if (!user.isVerified) {
			throw new Error(`${email} is not yet verified. Please verify your account`);
		}

		return user;
	}

	private async _ensureUserHasAdminPermission(user: IUser): Promise<void> {
		const hasAdminPermission = await this._userRoleManagementService.hasPermission(
			user,
			USER_ACCOUNT_TYPE.ADMIN,
		);
		if (!hasAdminPermission) {
			throw new Error(`User ${user.emailValue} does not have admin permission`);
		}
	}

	private async _comparePassword(rawPassword: string, hashPassword: string): Promise<void> {
		const comparedPassword = await comparePassword(rawPassword, hashPassword);
		if (!comparedPassword) {
			throw new Error("Incorrect password. Please try again");
		}
	}
}
