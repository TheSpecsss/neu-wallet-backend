import {
	USER_ACCOUNT_TYPE,
	type UserAccountTypeKind,
} from "@/modules/user/src/domain/shared/constant";
import { Result } from "@/shared/core/result";

export interface IUserAccountType {
	value: string;
}

export class UserAccountType implements IUserAccountType {
	private readonly _value: string;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(type: string): Result<UserAccountType> {
		if (!Object.values(USER_ACCOUNT_TYPE).includes(type as UserAccountTypeKind)) {
			return Result.fail(`${type} is invalid user account type`);
		}

		return Result.ok(new UserAccountType(type));
	}

	public get value(): string {
		return this._value;
	}
}
