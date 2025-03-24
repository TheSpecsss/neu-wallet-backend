import type { IUser } from "@/modules/user/src/domain/classes/user";
import {
	USER_ACCOUNT_TYPE,
	type UserAccountTypeKind,
} from "@/modules/user/src/domain/shared/constant";
import { UserRepository } from "@/modules/user/src/repositories/userRepository";

export interface IUserRoleManagementService {
	isSuperAdmin(userInput: IUser | string): Promise<boolean>;
	hasPermission(userInput: IUser | string, accountType: UserAccountTypeKind): Promise<boolean>;
	hasHigherPermission(user1Input: IUser | string, user2Input: IUser | string): Promise<boolean>;
	hasHigherAccountType(accountType: string, targetAccountType: string): boolean;
	ensureValidRoleChange(
		updaterRole: string,
		targetAccountType: { oldRole: string; newRole: string },
	): void;
}

export class UserRoleManagementService implements IUserRoleManagementService {
	constructor(private _userRepository = new UserRepository()) {}

	private ACCOUNT_TYPE_HIERARCHY: { [key: string]: number } = {
		[USER_ACCOUNT_TYPE.SUPER_ADMIN]: 3,
		[USER_ACCOUNT_TYPE.ADMIN]: 2,
		[USER_ACCOUNT_TYPE.CASH_TOP_UP]: 1,
		[USER_ACCOUNT_TYPE.CASHIER]: 1,
		[USER_ACCOUNT_TYPE.USER]: 1,
	};

	public async isSuperAdmin(userInput: IUser | string): Promise<boolean> {
		const user = await this._getUser(userInput);
		if (!user) {
			return false;
		}

		return user.accountTypeValue === USER_ACCOUNT_TYPE.SUPER_ADMIN;
	}

	public async hasPermission(
		userInput: IUser | string,
		accountType: UserAccountTypeKind,
	): Promise<boolean> {
		const user = await this._getUser(userInput);
		if (!user) {
			return false;
		}

		const isSuperAdmin = await this.isSuperAdmin(user);

		return isSuperAdmin || user.accountTypeValue === accountType;
	}

	public async hasHigherPermission(
		reference: IUser | string,
		target: IUser | string,
	): Promise<boolean> {
		const referenceUser = await this._getUser(reference);
		const targetUser = await this._getUser(target);
		if (!referenceUser || !targetUser) return false;

		return this.hasHigherAccountType(referenceUser.accountTypeValue, targetUser.accountTypeValue);
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
				"Assigning a role that is higher or equal to the current role is restricted",
			);
		}
	}

	private async _getUser(user: IUser | string): Promise<IUser | null> {
		return typeof user === "string" ? await this._userRepository.findUserById(user) : user;
	}
}
