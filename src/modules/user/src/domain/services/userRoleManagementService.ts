import type { IUser } from "@/modules/user/src/domain/classes/user";
import { USER_ACCOUNT_TYPE } from "@/modules/user/src/domain/shared/constant";
import { UserRepository } from "@/modules/user/src/repositories/userRepository";

export interface IUSerRoleManagementService {
	isSuperAdmin(userInput: IUser | string): Promise<boolean>;
	hasHigherAccountType(accountType: string, targetAccountType: string): boolean;
	ensureValidRoleChange(
		updaterRole: string,
		targetAccountType: { oldRole: string; newRole: string },
	): void;
}

export class UserRoleManagementService implements IUSerRoleManagementService {
	constructor(private _userRepository = new UserRepository()) {}

	private ACCOUNT_TYPE_HIERARCHY: { [key: string]: number } = {
		[USER_ACCOUNT_TYPE.SUPER_ADMIN]: 3,
		[USER_ACCOUNT_TYPE.ADMIN]: 2,
		[USER_ACCOUNT_TYPE.CASH_TOP_UP]: 1,
		[USER_ACCOUNT_TYPE.CASHIER]: 1,
		[USER_ACCOUNT_TYPE.USER]: 1,
	};

	public async isSuperAdmin(userInput: IUser | string): Promise<boolean> {
		const user =
			typeof userInput === "string"
				? await this._userRepository.findUserById(userInput)
				: userInput;

		return this._isAccountTypeSuperAdmin(user?.accountTypeValue ?? "");
	}

	public hasHigherAccountType(accountType: string, targetAccountType: string): boolean {
		return (
			this.ACCOUNT_TYPE_HIERARCHY[accountType] >
			(this.ACCOUNT_TYPE_HIERARCHY[targetAccountType] ?? 0)
		);
	}

	public ensureValidRoleChange(
		updaterRole: string,
		targetAccountType: { oldRole: string; newRole: string },
	): void {
		if (!this.hasHigherAccountType(updaterRole, targetAccountType.oldRole)) {
			throw new Error("Modifying a user with a higher or equal role is restricted");
		}

		if (!this.hasHigherAccountType(updaterRole, targetAccountType.newRole)) {
			throw new Error(
				"Assigning a role that is higher or equal to the current role is restricted.",
			);
		}
	}

	private _isAccountTypeSuperAdmin(accountType: string): boolean {
		return accountType === USER_ACCOUNT_TYPE.SUPER_ADMIN;
	}
}
