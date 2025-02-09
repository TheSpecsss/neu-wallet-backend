import { Result } from "@/shared/core/result";

export interface IUserName {
	value: string;
}

export class UserName implements IUserName {
	private readonly _value: string;
	public static readonly MINIMUM_USERNAME_LENGTH = 2;
	public static readonly MAXIMUM_USERNAME_LENGTH = 60;

	private constructor(value: string) {
		this._value = value;
	}

	public static create(userName: string): Result<UserName> {
		if (userName.length < UserName.MINIMUM_USERNAME_LENGTH) {
			return Result.fail(
				`Name must be at least ${UserName.MINIMUM_USERNAME_LENGTH} characters long`,
			);
		}

		if (userName.length > UserName.MAXIMUM_USERNAME_LENGTH) {
			return Result.fail(`Name is limited to ${UserName.MAXIMUM_USERNAME_LENGTH} characters long`);
		}

		return Result.ok(new UserName(userName));
	}

	public get value(): string {
		return this._value;
	}
}
